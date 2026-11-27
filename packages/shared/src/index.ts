import { z } from 'zod';

export type SubjectCode = 'TWK' | 'TIU' | 'TKP';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';
export type QuestionStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type PracticeMode = 'PRACTICE' | 'EXAM';
export type MasteryLevel = 'MASTERED' | 'GOOD' | 'DEVELOPING' | 'NEEDS_IMPROVEMENT' | 'INSUFFICIENT_DATA';
export type UserRole = 'USER' | 'CONTENT_PARTNER' | 'HOST_OPERATOR' | 'EVENT_ADMIN' | 'ADMIN';

export type LiveEventStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'WAITING_ROOM'
  | 'COUNTDOWN'
  | 'LIVE'
  | 'FINALIZING'
  | 'COMPLETED'
  | 'CANCELLED';

export type LiveEventType = 'FREE' | 'PREMIUM';
export type LiveEventVisibility = 'PUBLIC' | 'UNLISTED' | 'PRIVATE';
export type LiveRegistrationStatus = 'REGISTERED' | 'CONFIRMED' | 'CANCELLED' | 'DISQUALIFIED';
export type LiveSessionStatus = 'WAITING' | 'READY' | 'IN_PROGRESS' | 'SUBMITTED' | 'TIME_EXPIRED' | 'DISQUALIFIED';
export type LiveConnectionStatus = 'OFFLINE' | 'ONLINE' | 'DISCONNECTED';
export type LiveReviewPolicy = 'IMMEDIATE' | 'DELAYED' | 'DISABLED';

export const LIVE_EVENT_STATUS_LABELS: Record<LiveEventStatus, string> = {
  DRAFT: 'Draf',
  PUBLISHED: 'Dipublikasikan',
  REGISTRATION_OPEN: 'Pendaftaran Dibuka',
  REGISTRATION_CLOSED: 'Pendaftaran Ditutup',
  WAITING_ROOM: 'Ruang Tunggu Dibuka',
  COUNTDOWN: 'Hitung Mundur Ujian',
  LIVE: 'Sedang Berlangsung',
  FINALIZING: 'Finalisasi Hasil',
  COMPLETED: 'Selesai & Hasil Terbit',
  CANCELLED: 'Dibatalkan',
};

export const LIVE_EVENT_TRANSITIONS: Record<LiveEventStatus, LiveEventStatus[]> = {
  DRAFT: ['PUBLISHED', 'REGISTRATION_OPEN', 'CANCELLED'],
  PUBLISHED: ['REGISTRATION_OPEN', 'WAITING_ROOM', 'CANCELLED'],
  REGISTRATION_OPEN: ['REGISTRATION_CLOSED', 'WAITING_ROOM', 'CANCELLED'],
  REGISTRATION_CLOSED: ['REGISTRATION_OPEN', 'WAITING_ROOM', 'COUNTDOWN', 'CANCELLED'],
  WAITING_ROOM: ['COUNTDOWN', 'LIVE', 'CANCELLED'],
  COUNTDOWN: ['LIVE', 'WAITING_ROOM', 'CANCELLED'],
  LIVE: ['FINALIZING', 'CANCELLED'],
  FINALIZING: ['COMPLETED', 'LIVE'],
  COMPLETED: [],
  CANCELLED: [],
};

export const SKD_LEVELS = [
  { name: 'Pemula', minXp: 0, maxXp: 499 },
  { name: 'Pembelajar', minXp: 500, maxXp: 1499 },
  { name: 'Menengah', minXp: 1500, maxXp: 3499 },
  { name: 'Mahir', minXp: 3500, maxXp: 6999 },
  { name: 'Ahli', minXp: 7000, maxXp: 11999 },
  { name: 'SKD Master', minXp: 12000, maxXp: Infinity },
] as const;

export function getLevelForXp(xp: number) {
  const level = SKD_LEVELS.find((l) => xp >= l.minXp && xp <= l.maxXp) ?? SKD_LEVELS[0];
  const next = SKD_LEVELS.find((l) => l.minXp > level.minXp) ?? null;
  const progressPct = next
    ? Math.min(100, Math.round(((xp - level.minXp) / (next.minXp - level.minXp)) * 100))
    : 100;
  return {
    name: level.name,
    minXp: level.minXp,
    nextXp: next?.minXp ?? null,
    nextLevelName: next?.name ?? null,
    progressPct,
  };
}

export const MASTERY_THRESHOLDS = {
  MASTERED: 85,
  GOOD: 70,
  DEVELOPING: 50,
  MIN_SAMPLES: 5,
} as const;

export function classifyMastery(accuracyPct: number, sampleCount: number): MasteryLevel {
  if (sampleCount < MASTERY_THRESHOLDS.MIN_SAMPLES) return 'INSUFFICIENT_DATA';
  if (accuracyPct >= MASTERY_THRESHOLDS.MASTERED) return 'MASTERED';
  if (accuracyPct >= MASTERY_THRESHOLDS.GOOD) return 'GOOD';
  if (accuracyPct >= MASTERY_THRESHOLDS.DEVELOPING) return 'DEVELOPING';
  return 'NEEDS_IMPROVEMENT';
}

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  MASTERED: 'Menguasai',
  GOOD: 'Baik',
  DEVELOPING: 'Berkembang',
  NEEDS_IMPROVEMENT: 'Perlu Ditingkatkan',
  INSUFFICIENT_DATA: 'Data Belum Mencukupi',
};

// Default configurable blueprint (never hardcoded as unchangeable official law)
export const DEFAULT_SKD_BLUEPRINT = {
  year: 2026,
  sourceNote: 'Konfigurasi Awal Platform (Dapat Disesuaikan Admin sesuai Pengumuman Resmi BKN/KemenPAN-RB Tahun Berjalan)',
  durationMinutes: 100,
  disabilityDurationMinutes: 130,
  subjects: {
    TWK: { questionCount: 30, correctPoints: 5, wrongPoints: 0, emptyPoints: 0, maxScore: 150, passingGrade: 65 },
    TIU: { questionCount: 35, correctPoints: 5, wrongPoints: 0, emptyPoints: 0, maxScore: 175, passingGrade: 80 },
    TKP: { questionCount: 45, minOptionScore: 1, maxOptionScore: 5, emptyPoints: 0, maxScore: 225, passingGrade: 166 },
  },
  totalQuestions: 110,
  totalMaxScore: 550,
  totalRecommendedTarget: 311,
} as const;

// Zod validation schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter').max(100),
});

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
});

export const onboardingSchema = z.object({
  experienceLevel: z.enum(['FIRST_TIME', 'REPEAT_CANDIDATE', 'REFRESHING']).optional(),
  targetExamDate: z.string().nullable().optional(),
  dailyStudyMinutes: z.number().int().min(10).max(480).optional(),
  dailyQuestionTarget: z.number().int().min(5).max(110).optional(),
  targetScore: z.number().int().min(150).max(550).optional(),
  confidenceTwk: z.number().int().min(1).max(5).optional(),
  confidenceTiu: z.number().int().min(1).max(5).optional(),
  confidenceTkp: z.number().int().min(1).max(5).optional(),
  preferredStudyDays: z.array(z.number().int().min(0).max(6)).optional(),
  skipped: z.boolean().optional(),
});

const SAFE_IMAGE_URL_REGEX =
  /^(https?:\/\/[^\s]+|data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+)$/i;

export const visualSpecSchema = z
  .any()
  .refine((val) => {
    if (val === null || val === undefined) return true;
    if (typeof val !== 'object') return false;
    const obj = val as Record<string, unknown>;
    if (obj.kind === 'image' || obj.type === 'image') {
      return (
        typeof obj.url === 'string' &&
        obj.url.length <= 2_500_000 &&
        SAFE_IMAGE_URL_REGEX.test(obj.url.trim())
      );
    }
    return true;
  }, 'Format atau ukuran URL gambar visual tidak valid.')
  .nullable()
  .optional();

export const questionOptionInputSchema = z
  .object({
    optionKey: z.enum(['A', 'B', 'C', 'D', 'E']),
    text: z.string().default(''),
    scoreValue: z.number().int().min(0).max(5),
    isCorrect: z.boolean().default(false),
    optionFeedback: z.string().optional(),
    visualSpec: visualSpecSchema,
  })
  .refine((o) => o.text.trim().length > 0 || Boolean(o.visualSpec), {
    message: 'Teks pilihan atau gambar opsi wajib diisi',
    path: ['text'],
  });

export const questionCreateSchema = z
  .object({
    code: z.string().min(3).max(50).optional(),
    subjectCode: z.enum(['TWK', 'TIU', 'TKP']),
    topicSlug: z.string().min(2),
    subtopicName: z.string().optional(),
    questionType: z.string().default('MULTIPLE_CHOICE'),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
    stem: z.string().min(3, 'Pertanyaan wajib diisi'),
    visualSpec: visualSpecSchema,
    explanation: z.string().min(10, 'Pembahasan wajib diisi'),
    conceptSummary: z.string().optional(),
    stepByStep: z.array(z.string()).optional(),
    whyOthersWrong: z.record(z.string()).optional(),
    quickTrick: z.string().optional(),
    commonMistakes: z.string().optional(),
    references: z
      .array(
        z.object({
          title: z.string(),
          source: z.string(),
          note: z.string().optional(),
        }),
      )
      .optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
    isAiGenerated: z.boolean().default(false),
    options: z.array(questionOptionInputSchema).length(5, 'Harus memiliki tepat 5 pilihan (A-E)'),
  })
  .refine((q) => q.stem.trim().length >= 10 || Boolean(q.visualSpec), {
    message: 'Pertanyaan minimal 10 karakter (kecuali disertai gambar)',
    path: ['stem'],
  });

export interface QuestionBankJsonItem {
  id: string;
  subject: SubjectCode;
  topic: string;
  topicSlug: string;
  subtopic: string;
  questionType: string;
  difficulty: DifficultyLevel;
  stem: string;
  visualSpec?: Record<string, unknown> | null;
  options: Array<{
    key: 'A' | 'B' | 'C' | 'D' | 'E';
    text: string;
    score: number;
    isCorrect: boolean;
    rationale: string;
    visualSpec?: Record<string, unknown> | null;
  }>;
  correctOption?: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation: {
    concept: string;
    stepByStep: string[];
    correctReason: string;
    distractorAnalysis: Record<string, string>;
    quickTrick: string;
    commonMistakes: string;
    studyMaterialTip: string;
  };
  references: Array<{
    title: string;
    source: string;
    note?: string;
  }>;
  disclaimer: string;
}

export const liveEventCreateSchema = z.object({
  title: z.string().min(4, 'Judul event minimal 4 karakter').max(180),
  slug: z
    .string()
    .min(3, 'Slug minimal 3 karakter')
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
  description: z.string().min(10, 'Deskripsi event minimal 10 karakter'),
  bannerUrl: z.string().url().optional().or(z.literal('')).nullable(),
  hostName: z.string().min(2).max(120).default('Tim Akademik Nippia'),
  registrationStartAt: z.string(),
  registrationEndAt: z.string(),
  scheduledStartAt: z.string(),
  durationMinutes: z.number().int().min(5).max(240).default(100),
  maxParticipants: z.number().int().min(10).max(50000).default(1000),
  visibility: z.enum(['PUBLIC', 'UNLISTED', 'PRIVATE']).default('PUBLIC'),
  eventType: z.enum(['FREE', 'PREMIUM']).default('FREE'),
  packageCode: z.enum(['ALL', 'PAKET_1', 'PAKET_2', 'PAKET_3', 'PAKET_4', 'PAKET_5']).default('ALL'),
  twkCount: z.number().int().min(0).max(60).default(30),
  tiuCount: z.number().int().min(0).max(60).default(35),
  tkpCount: z.number().int().min(0).max(60).default(45),
  difficultyMix: z.enum(['BALANCED', 'EASY', 'MEDIUM', 'HARD']).default('BALANCED'),
  scoringConfigId: z.string().optional().nullable(),
  randomizeOptions: z.boolean().default(true),
  leaderboardPublished: z.boolean().default(false),
  reviewPolicy: z.enum(['IMMEDIATE', 'DELAYED', 'DISABLED']).default('IMMEDIATE'),
  reviewUnlockAt: z.string().optional().nullable(),
  rulesMd: z.string().optional(),
  eligibilityText: z.string().optional(),
  faqItems: z
    .array(z.object({ q: z.string().min(2), a: z.string().min(2) }))
    .optional(),
});

export const liveEventUpdateSchema = liveEventCreateSchema.partial();
