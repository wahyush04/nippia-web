const apiUrl = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '');
const appEnv = import.meta.env.VITE_APP_ENV || (import.meta.env.PROD ? 'production' : 'development');
const enableDemoLogin =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_LOGIN === 'true';

export const webEnv = {
  apiUrl,
  appEnv,
  publicAppUrl: (import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(
    /\/$/,
    '',
  ),
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  enableDemoLogin,
  isProd: import.meta.env.PROD,
};

export function resolveSocketUrl(): string | undefined {
  const explicitSocket = import.meta.env.VITE_SOCKET_URL;
  if (explicitSocket) return explicitSocket.replace(/\/$/, '');
  if (apiUrl.startsWith('http://') || apiUrl.startsWith('https://')) {
    try {
      return new URL(apiUrl).origin;
    } catch {
      return undefined;
    }
  }
  return undefined;
}
