import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { AuthUser } from '../../stores/authStore';

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (cfg: {
            client_id: string;
            callback: (res: { credential?: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            el: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              width?: number;
              locale?: string;
            },
          ) => void;
        };
      };
    };
  }
}

export interface GoogleAuthSuccessPayload {
  isNewUser?: boolean;
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export function GoogleSignInButton({
  mode = 'signin',
  onSuccess,
  onCredential,
  onError,
}: {
  mode?: 'signin' | 'signup';
  onSuccess?: (payload: GoogleAuthSuccessPayload) => void;
  onCredential?: (credential: string) => Promise<void> | void;
  onError: (msg: string) => void;
}) {
  const buttonContainerRef = useRef<HTMLDivElement | null>(null);
  const [gsiRendered, setGsiRendered] = useState(false);
  const [loading, setLoading] = useState(false);
  const onSuccessRef = useRef(onSuccess);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  onSuccessRef.current = onSuccess;
  onCredentialRef.current = onCredential;
  onErrorRef.current = onError;

  const { data: cfg } = useQuery({
    queryKey: ['google-oauth-config'],
    queryFn: () => apiFetch<{ enabled: boolean; clientId: string | null }>('/auth/google/config'),
    staleTime: 5 * 60 * 1000,
  });

  const clientId = cfg?.clientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const enabled = Boolean(cfg?.enabled ?? clientId);

  useEffect(() => {
    if (!enabled || !clientId) return;

    let cancelled = false;
    let attempts = 0;

    const tryInit = () => {
      if (cancelled) return;
      const gsi = window.google?.accounts?.id;
      const el = buttonContainerRef.current;
      if (!gsi || !el) {
        if (attempts < 25) {
          attempts += 1;
          setTimeout(tryInit, 150);
        }
        return;
      }

      gsi.initialize({
        client_id: clientId,
        callback: async (res) => {
          if (!res.credential) {
            onErrorRef.current('Kredensial Google tidak diterima.');
            return;
          }
          setLoading(true);
          try {
            if (onCredentialRef.current) {
              await onCredentialRef.current(res.credential);
            } else {
              const payload = await apiFetch<GoogleAuthSuccessPayload>('/auth/google', {
                method: 'POST',
                body: JSON.stringify({ credential: res.credential }),
              });
              onSuccessRef.current?.(payload);
            }
          } catch (err) {
            onErrorRef.current(err instanceof Error ? err.message : 'Gagal memproses akun Google.');
          } finally {
            setLoading(false);
          }
        },
      });

      el.innerHTML = '';
      const width = Math.min(380, Math.max(260, el.parentElement?.clientWidth || 360));
      gsi.renderButton(el, {
        theme: 'outline',
        size: 'large',
        text: mode === 'signup' ? 'signup_with' : 'continue_with',
        shape: 'rectangular',
        width,
        locale: 'id',
      });
      setGsiRendered(true);
    };

    tryInit();
    return () => {
      cancelled = true;
    };
  }, [enabled, clientId, mode]);

  if (!enabled) return null;

  const apiBase = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '');

  return (
    <div className="space-y-2.5">
      <div className="relative flex justify-center">
        <div ref={buttonContainerRef} className={gsiRendered ? 'min-h-[42px]' : 'hidden'} />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80 text-xs font-semibold text-indigo-700">
            Memverifikasi akun Google...
          </div>
        )}
      </div>

      {!gsiRendered && onCredential && (
        <p className="text-xs text-slate-500">Memuat tombol Google Sign-In...</p>
      )}

      {!gsiRendered && !onCredential && (
        <a
          href={`${apiBase}/auth/google/redirect`}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M12 10.2v3.9h5.4c-.2 1.2-1.4 3.6-5.4 3.6-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.6H12z"
            />
            <path
              fill="#34A853"
              d="M3.3 7.3l3.2 2.3C7.4 7.7 9.5 6.2 12 6.2c1.8 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2c-3.8 0-7.1 2.2-8.7 5.1z"
            />
            <path
              fill="#FBBC05"
              d="M12 21.8c2.6 0 4.8-.9 6.4-2.4l-3-2.5c-.8.6-1.9 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1l-3.2 2.5c1.6 3.2 4.9 5.5 8.8 5.5z"
            />
            <path
              fill="#4285F4"
              d="M21.4 12.2c0-.6-.1-1.1-.2-1.6H12v3.9h5.4c-.3 1.3-1 2.3-2 3l3 2.5c1.8-1.6 3-4.1 3-7.8z"
            />
          </svg>
          <span>{mode === 'signup' ? 'Daftar dengan Google' : 'Lanjutkan dengan Google'}</span>
        </a>
      )}
    </div>
  );
}
