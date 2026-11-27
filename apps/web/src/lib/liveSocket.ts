import { io, type Socket } from 'socket.io-client';
import { getAccessToken } from './api';

export function createLiveEventSocket(eventId: string): Socket | null {
  const token = getAccessToken();
  if (!token) return null;

  const socket = io({
    path: '/socket.io',
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on('connect', () => {
    socket.emit('live_event:join_room', { eventId });
  });

  return socket;
}

export function formatDurationHms(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(safe / 86400);
  const hours = Math.floor((safe % 86400) / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  const hh = String(hours).padStart(2, '0');
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  return days > 0 ? `${days}h ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`;
}

export function formatDurationReadable(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins} menit ${secs} detik`;
}
