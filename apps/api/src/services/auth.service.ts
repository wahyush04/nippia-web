import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import type { UserRole } from '@nippia/shared';
import type { AuthPayload } from '../middleware/auth.js';

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export function signAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export async function issueTokenPair(user: { id: string; email: string; role: UserRole }) {
  const payload: AuthPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  const accessToken = signAccessToken(payload);
  const rawRefresh = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawRefresh),
      expiresAt,
    },
  });

  return { accessToken, refreshToken: rawRefresh };
}

export async function registerUser(input: { name: string; email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(409, 'Email sudah terdaftar. Silakan masuk atau gunakan email lain.', 'EMAIL_EXISTS');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const verifyCode = crypto.randomBytes(16).toString('hex');

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      passwordHash,
      role: 'USER',
      emailVerifyCode: verifyCode,
      profile: {
        create: {
          onboardingCompleted: false,
          totalXp: 0,
          levelName: 'Pemula',
        },
      },
      preferences: {
        create: {
          dailyTwkTarget: 10,
          dailyTiuTarget: 10,
          dailyTkpTarget: 10,
        },
      },
      streak: {
        create: {
          currentStreak: 0,
          longestStreak: 0,
        },
      },
    },
    include: { profile: true, preferences: true, streak: true },
  });

  const tokens = await issueTokenPair({ id: user.id, email: user.email, role: user.role });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      isPro: user.role === 'ADMIN',
      tier: user.role === 'ADMIN' ? 'PRO' : 'FREE',
      subscription: null,
      profile: user.profile,
      preferences: user.preferences,
      streak: user.streak,
    },
    ...tokens,
    devVerificationCode: env.nodeEnv !== 'production' ? verifyCode : undefined,
  };
}

export async function loginUser(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true, preferences: true, streak: true },
  });

  if (!user) {
    throw new AppError(401, 'Email atau kata sandi salah.', 'INVALID_CREDENTIALS');
  }

  if (!user.passwordHash) {
    throw new AppError(
      401,
      'Akun ini terdaftar menggunakan Google. Silakan gunakan tombol Masuk dengan Google atau atur ulang kata sandi.',
      'GOOGLE_ACCOUNT_ONLY',
    );
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'Email atau kata sandi salah.', 'INVALID_CREDENTIALS');
  }

  const tokens = await issueTokenPair({ id: user.id, email: user.email, role: user.role });
  const now = new Date();
  const activeSub = await prisma.userSubscription.findFirst({
    where: { userId: user.id, status: 'ACTIVE', expiresAt: { gt: now } },
    include: { plan: true },
    orderBy: { expiresAt: 'desc' },
  });
  const isPro = Boolean(activeSub) || user.role === 'ADMIN';

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      avatarUrl: user.avatarUrl,
      authProvider: user.authProvider,
      googleLinked: Boolean(user.googleId),
      googleEmail: user.googleEmail,
      hasPassword: Boolean(user.passwordHash),
      isPro,
      tier: isPro ? 'PRO' : 'FREE',
      subscription: activeSub
        ? {
            id: activeSub.id,
            planCode: activeSub.plan.code,
            planName: activeSub.plan.name,
            status: activeSub.status,
            startedAt: activeSub.startedAt,
            expiresAt: activeSub.expiresAt,
            daysRemaining: Math.max(1, Math.ceil((activeSub.expiresAt.getTime() - now.getTime()) / 86400000)),
            source: activeSub.source,
          }
        : null,
      profile: user.profile,
      preferences: user.preferences,
      streak: user.streak,
    },
    ...tokens,
  };
}

interface GoogleJwk extends crypto.JsonWebKey {
  kid?: string;
  alg?: string;
}

interface GoogleClaims {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

let cachedGoogleJwks: { keys: GoogleJwk[]; fetchedAt: number } | null = null;
const GOOGLE_JWKS_TTL_MS = 60 * 60 * 1000;

async function fetchGoogleJwks(forceRefresh = false): Promise<GoogleJwk[]> {
  if (!forceRefresh && cachedGoogleJwks && Date.now() - cachedGoogleJwks.fetchedAt < GOOGLE_JWKS_TTL_MS) {
    return cachedGoogleJwks.keys;
  }
  const resp = await fetch('https://www.googleapis.com/oauth2/v3/certs');
  if (!resp.ok) {
    throw new AppError(502, 'Gagal mengambil kunci verifikasi Google.', 'GOOGLE_CERTS_ERROR');
  }
  const body = (await resp.json()) as { keys?: GoogleJwk[] };
  const keys = body.keys ?? [];
  cachedGoogleJwks = { keys, fetchedAt: Date.now() };
  return keys;
}

export async function verifyGoogleIdToken(idToken: string) {
  if (!env.googleClientId) {
    throw new AppError(503, 'Sign In with Google belum dikonfigurasi pada server.', 'GOOGLE_NOT_CONFIGURED');
  }

  const decoded = jwt.decode(idToken, { complete: true }) as
    | { header?: { kid?: string; alg?: string } }
    | null;
  const kid = decoded?.header?.kid;
  if (!kid) {
    throw new AppError(401, 'Token Google tidak valid.', 'INVALID_GOOGLE_TOKEN');
  }

  let keys = await fetchGoogleJwks(false);
  let jwk = keys.find((k) => k.kid === kid);
  if (!jwk) {
    keys = await fetchGoogleJwks(true);
    jwk = keys.find((k) => k.kid === kid);
  }
  if (!jwk) {
    throw new AppError(401, 'Kunci penandatanganan token Google tidak ditemukan.', 'INVALID_GOOGLE_TOKEN');
  }

  let claims: GoogleClaims;
  try {
    const publicKey = crypto.createPublicKey({ key: jwk, format: 'jwk' });
    claims = jwt.verify(idToken, publicKey, {
      algorithms: ['RS256'],
      audience: env.googleClientId,
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
    }) as GoogleClaims;
  } catch {
    throw new AppError(401, 'Token Google tidak valid atau sudah kedaluwarsa.', 'INVALID_GOOGLE_TOKEN');
  }

  if (!claims.sub || !claims.email || claims.email_verified !== true) {
    throw new AppError(
      401,
      'Email akun Google belum terverifikasi atau tidak lengkap.',
      'GOOGLE_EMAIL_UNVERIFIED',
    );
  }

  return {
    googleId: claims.sub,
    email: claims.email.trim().toLowerCase(),
    name: (claims.name || claims.email.split('@')[0]).trim(),
    avatarUrl: claims.picture ?? null,
  };
}

export async function exchangeGoogleAuthCode(code: string, redirectUri: string) {
  if (!env.googleClientId || !env.googleClientSecret) {
    throw new AppError(503, 'OAuth Google server belum dikonfigurasi.', 'GOOGLE_NOT_CONFIGURED');
  }

  const params = new URLSearchParams({
    code,
    client_id: env.googleClientId,
    client_secret: env.googleClientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const data = (await resp.json()) as { id_token?: string; error_description?: string; error?: string };
  if (!resp.ok || !data.id_token) {
    throw new AppError(
      401,
      data.error_description || 'Gagal menukar kode otorisasi Google.',
      'GOOGLE_OAUTH_EXCHANGE_FAILED',
    );
  }

  return verifyGoogleIdToken(data.id_token);
}

export async function loginOrRegisterWithGoogle(profile: {
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}) {
  const email = profile.email.trim().toLowerCase();

  let user = await prisma.user.findFirst({
    where: {
      OR: [{ googleId: profile.googleId }, { email }],
    },
    include: { profile: true, preferences: true, streak: true },
  });

  let isNewUser = false;

  if (user) {
    const nextProvider = user.passwordHash ? 'HYBRID' : 'GOOGLE';
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        googleId: user.googleId ?? profile.googleId,
        googleEmail: user.googleEmail ?? email,
        avatarUrl: profile.avatarUrl ?? user.avatarUrl,
        authProvider: user.authProvider === 'HYBRID' ? 'HYBRID' : nextProvider,
        emailVerified: true,
        emailVerifyCode: null,
        name: user.name || profile.name,
      },
      include: { profile: true, preferences: true, streak: true },
    });
  } else {
    isNewUser = true;
    user = await prisma.user.create({
      data: {
        name: profile.name,
        email,
        passwordHash: null,
        googleId: profile.googleId,
        googleEmail: email,
        avatarUrl: profile.avatarUrl,
        authProvider: 'GOOGLE',
        role: 'USER',
        emailVerified: true,
        profile: {
          create: {
            onboardingCompleted: false,
            totalXp: 0,
            levelName: 'Pemula',
          },
        },
        preferences: {
          create: {
            dailyTwkTarget: 10,
            dailyTiuTarget: 10,
            dailyTkpTarget: 10,
          },
        },
        streak: {
          create: {
            currentStreak: 0,
            longestStreak: 0,
          },
        },
      },
      include: { profile: true, preferences: true, streak: true },
    });
  }

  const tokens = await issueTokenPair({ id: user.id, email: user.email, role: user.role });

  return {
    isNewUser,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      avatarUrl: user.avatarUrl,
      authProvider: user.authProvider,
      googleLinked: Boolean(user.googleId),
      googleEmail: user.googleEmail,
      hasPassword: Boolean(user.passwordHash),
      profile: user.profile,
      preferences: user.preferences,
      streak: user.streak,
    },
    ...tokens,
  };
}

const oauthTicketStore = new Map<
  string,
  {
    result: Awaited<ReturnType<typeof loginOrRegisterWithGoogle>>;
    expiresAt: number;
  }
>();

export function createGoogleOAuthState(): string {
  return jwt.sign({ purpose: 'google_oauth', nonce: crypto.randomBytes(12).toString('hex') }, env.jwtAccessSecret, {
    expiresIn: '5m',
  });
}

export function verifyGoogleOAuthState(state: string): boolean {
  try {
    const decoded = jwt.verify(state, env.jwtAccessSecret) as { purpose?: string };
    return decoded?.purpose === 'google_oauth';
  } catch {
    return false;
  }
}

export function createGoogleExchangeTicket(result: Awaited<ReturnType<typeof loginOrRegisterWithGoogle>>): string {
  const now = Date.now();
  for (const [k, v] of oauthTicketStore.entries()) {
    if (v.expiresAt < now) oauthTicketStore.delete(k);
  }
  const ticket = crypto.randomBytes(24).toString('hex');
  oauthTicketStore.set(ticket, { result, expiresAt: now + 90 * 1000 });
  return ticket;
}

export function consumeGoogleExchangeTicket(ticket: string) {
  const entry = oauthTicketStore.get(ticket);
  oauthTicketStore.delete(ticket);
  if (!entry || entry.expiresAt < Date.now()) {
    throw new AppError(401, 'Sesi otorisasi Google sudah kedaluwarsa. Silakan coba lagi.', 'GOOGLE_TICKET_EXPIRED');
  }
  return entry.result;
}

export async function rotateRefreshToken(rawRefresh: string) {
  const tokenHash = hashToken(rawRefresh);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new AppError(401, 'Refresh token tidak valid atau kedaluwarsa.', 'INVALID_REFRESH_TOKEN');
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const tokens = await issueTokenPair({
    id: stored.user.id,
    email: stored.user.email,
    role: stored.user.role,
  });

  return tokens;
}

export async function revokeRefreshToken(rawRefresh?: string) {
  if (!rawRefresh) return;
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(rawRefresh) },
    data: { revokedAt: new Date() },
  });
}

export async function createPasswordReset(emailInput: string) {
  const email = emailInput.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { sent: true };
  }

  const rawToken = crypto.randomBytes(24).toString('hex');
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  return {
    sent: true,
    devResetToken: env.nodeEnv !== 'production' ? rawToken : undefined,
  };
}

export async function resetPassword(rawToken: string, newPassword: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw new AppError(400, 'Token atur ulang kata sandi tidak valid atau kedaluwarsa.', 'INVALID_RESET_TOKEN');
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: record.userId },
      data: { revokedAt: new Date() },
    }),
  ]);

  return { reset: true };
}

export async function linkGoogleAccountToUser(
  userId: string,
  profile: { googleId: string; email: string; name: string; avatarUrl: string | null },
) {
  const googleEmail = profile.email.trim().toLowerCase();
  const [currentUser, conflict] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.user.findFirst({
      where: {
        googleId: profile.googleId,
        id: { not: userId },
      },
      select: { id: true },
    }),
  ]);

  if (!currentUser) throw new AppError(404, 'Pengguna tidak ditemukan.');
  if (conflict) {
    throw new AppError(
      409,
      'Akun Google ini sudah terhubung dengan akun Nippia lain.',
      'GOOGLE_ALREADY_BOUND',
    );
  }

  const nextProvider = currentUser.passwordHash ? 'HYBRID' : 'GOOGLE';
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      googleId: profile.googleId,
      googleEmail,
      avatarUrl: currentUser.avatarUrl ?? profile.avatarUrl,
      authProvider: nextProvider,
      emailVerified: true,
      emailVerifyCode: null,
    },
    select: {
      id: true,
      email: true,
      googleId: true,
      googleEmail: true,
      avatarUrl: true,
      authProvider: true,
      passwordHash: true,
    },
  });

  return {
    googleLinked: Boolean(updated.googleId),
    googleEmail: updated.googleEmail,
    avatarUrl: updated.avatarUrl,
    authProvider: updated.authProvider,
    hasPassword: Boolean(updated.passwordHash),
  };
}

export async function unlinkGoogleAccountFromUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'Pengguna tidak ditemukan.');
  if (!user.googleId) {
    throw new AppError(400, 'Akun Google belum tertaut pada akun ini.');
  }
  if (!user.passwordHash) {
    throw new AppError(
      400,
      'Buat kata sandi lokal terlebih dahulu sebelum memutus tautan Google agar Anda tetap dapat masuk.',
      'PASSWORD_REQUIRED_BEFORE_UNLINK',
    );
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      googleId: null,
      googleEmail: null,
      authProvider: 'LOCAL',
    },
    select: {
      id: true,
      googleId: true,
      googleEmail: true,
      authProvider: true,
      passwordHash: true,
    },
  });

  return {
    googleLinked: Boolean(updated.googleId),
    googleEmail: updated.googleEmail,
    authProvider: updated.authProvider,
    hasPassword: Boolean(updated.passwordHash),
  };
}

export async function setLocalPasswordForUser(
  userId: string,
  newPassword: string,
  currentPassword?: string,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'Pengguna tidak ditemukan.');

  if (user.passwordHash) {
    if (!currentPassword) {
      throw new AppError(400, 'Masukkan kata sandi saat ini untuk mengubahnya.');
    }
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      throw new AppError(401, 'Kata sandi saat ini tidak sesuai.', 'INVALID_PASSWORD');
    }
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      authProvider: user.googleId ? 'HYBRID' : 'LOCAL',
    },
    select: {
      id: true,
      googleId: true,
      googleEmail: true,
      authProvider: true,
      passwordHash: true,
    },
  });

  return {
    hasPassword: Boolean(updated.passwordHash),
    googleLinked: Boolean(updated.googleId),
    googleEmail: updated.googleEmail,
    authProvider: updated.authProvider,
  };
}
