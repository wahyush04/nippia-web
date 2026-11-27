import http from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { attachRealtime, shutdownRealtime } from './services/realtime.service.js';

const app = createApp();
const server = http.createServer(app);
attachRealtime(server);

server.listen(env.port, () => {
  console.log(`[Nippia SKD Master API] Server + Realtime running on http://localhost:${env.port}`);
});

const handleShutdown = async () => {
  await shutdownRealtime();
  server.close(() => process.exit(0));
};

process.on('SIGINT', () => void handleShutdown());
process.on('SIGTERM', () => void handleShutdown());
