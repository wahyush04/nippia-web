import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? '',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev_access_secret_nippia_2026_32chars',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret_nippia_2026_32chars',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  aiProvider: (process.env.AI_PROVIDER ?? 'local-grounded') as 'gemini' | 'openai' | 'local-grounded',
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  aiModel: process.env.AI_MODEL ?? 'gemini-2.5-flash',
};
