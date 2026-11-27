import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const nodeEnv = process.env.NODE_ENV ?? 'development';
const isProd = nodeEnv === 'production';

const INSECURE_PLACEHOLDER_SECRETS = new Set([
  '',
  'dev_access_secret_nippia_2026_32chars',
  'dev_refresh_secret_nippia_2026_32chars',
  'nippia_skd_master_dev_access_secret_key_2026',
  'nippia_skd_master_dev_refresh_secret_key_2026',
  'change_me_access_secret_min_32_chars',
  'change_me_refresh_secret_min_32_chars',
]);

export const env = {
  nodeEnv,
  port: Number(process.env.PORT ?? 4000),
  logLevel: process.env.LOG_LEVEL ?? (isProd ? 'info' : 'debug'),
  trustProxy: process.env.TRUST_PROXY !== undefined ? process.env.TRUST_PROXY === 'true' : isProd,
  allowLocalOrigin: process.env.ALLOW_LOCAL_ORIGIN === 'true',
  enableSimulatedPayments: !isProd && process.env.ENABLE_SIMULATED_PAYMENTS !== 'false',
  databaseUrl: process.env.DATABASE_URL ?? '',
  redisUrl: process.env.REDIS_URL ?? '',
  corsOrigin: process.env.CORS_ORIGIN ?? (isProd ? '' : 'http://localhost:5173'),
  appUrl: process.env.APP_URL ?? process.env.CORS_ORIGIN ?? (isProd ? '' : 'http://localhost:5173'),
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  jwtAccessSecret:
    process.env.JWT_ACCESS_SECRET ?? (isProd ? '' : 'dev_access_secret_nippia_2026_32chars'),
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ?? (isProd ? '' : 'dev_refresh_secret_nippia_2026_32chars'),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  aiProvider: (process.env.AI_PROVIDER ?? 'local-grounded') as 'gemini' | 'openai' | 'local-grounded',
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  aiModel: process.env.AI_MODEL ?? 'gemini-2.5-flash',
  midtransServerKey: process.env.MIDTRANS_SERVER_KEY ?? '',
  midtransClientKey: process.env.MIDTRANS_CLIENT_KEY ?? '',
  midtransIsProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
};

export function validateEnv(config = env): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.databaseUrl) {
    errors.push('DATABASE_URL wajib diisi.');
  }

  if (Number.isNaN(config.port) || config.port < 1 || config.port > 65535) {
    errors.push('PORT harus berupa angka port yang valid (1-65535).');
  }

  if (config.nodeEnv === 'production') {
    if (
      !config.jwtAccessSecret ||
      config.jwtAccessSecret.length < 32 ||
      INSECURE_PLACEHOLDER_SECRETS.has(config.jwtAccessSecret)
    ) {
      errors.push('JWT_ACCESS_SECRET pada produksi wajib unik dan minimal 32 karakter.');
    }

    if (
      !config.jwtRefreshSecret ||
      config.jwtRefreshSecret.length < 32 ||
      INSECURE_PLACEHOLDER_SECRETS.has(config.jwtRefreshSecret)
    ) {
      errors.push('JWT_REFRESH_SECRET pada produksi wajib unik dan minimal 32 karakter.');
    }

    if (
      config.jwtAccessSecret &&
      config.jwtRefreshSecret &&
      config.jwtAccessSecret === config.jwtRefreshSecret
    ) {
      errors.push('JWT_ACCESS_SECRET dan JWT_REFRESH_SECRET pada produksi tidak boleh sama.');
    }

    const origins = config.corsOrigin
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (origins.length === 0 || origins.includes('*')) {
      errors.push('CORS_ORIGIN pada produksi wajib berisi domain tepercaya (tidak boleh kosong atau "*").');
    }

    if (!config.allowLocalOrigin) {
      const hasLocalCors = origins.some((o) => /localhost|127\.0\.0\.1/i.test(o));
      if (hasLocalCors) {
        errors.push('CORS_ORIGIN pada produksi tidak boleh menunjuk ke localhost (set ALLOW_LOCAL_ORIGIN=true hanya untuk uji staging lokal).');
      }
      if (!config.appUrl || /localhost|127\.0\.0\.1/i.test(config.appUrl)) {
        errors.push('APP_URL pada produksi wajib berisi URL publik HTTPS yang valid.');
      }
    }

    if (Boolean(config.midtransServerKey) !== Boolean(config.midtransClientKey)) {
      errors.push('MIDTRANS_SERVER_KEY dan MIDTRANS_CLIENT_KEY harus dikonfigurasi berpasangan.');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function assertValidEnvOrExit() {
  const result = validateEnv(env);
  if (!result.valid) {
    console.error('[CONFIG ERROR] Konfigurasi environment tidak valid:');
    for (const err of result.errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }
}
