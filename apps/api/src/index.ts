import http from 'http';
import { createApp } from './app.js';
import { assertValidEnvOrExit, env } from './config/env.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';
import { attachRealtime, shutdownRealtime } from './services/realtime.service.js';

assertValidEnvOrExit();

const app = createApp();
const server = http.createServer(app);
server.requestTimeout = 30_000;
server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;

attachRealtime(server);

server.listen(env.port, () => {
  logger.info('Nippia SKD Master API + Realtime started', {
    port: env.port,
    nodeEnv: env.nodeEnv,
  });
});

let shuttingDown = false;
const handleShutdown = async (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info('Graceful shutdown initiated', { signal });

  const forceExit = setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  try {
    await shutdownRealtime();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await prisma.$disconnect();
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (err) {
    logger.error('Error during graceful shutdown', { error: err });
    process.exit(1);
  }
};

process.on('SIGINT', () => void handleShutdown('SIGINT'));
process.on('SIGTERM', () => void handleShutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection', { error: reason });
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err });
  void handleShutdown('uncaughtException');
});
