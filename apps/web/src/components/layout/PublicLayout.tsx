import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui';
import { NippiaLogo } from '../ui/NippiaLogo';
import { useAuthStore } from '../../stores/authStore';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 text-slate-900 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link to="/" className="flex items-center">
            <NippiaLogo variant="wordmark" size="md" showSubtitle />
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <Link to="/features" className="hover:text-slate-900 transition-colors">
              Fitur
            </Link>
            <Link to="/about" className="hover:text-slate-900 transition-colors">
              Tentang Kami
            </Link>
            <Link to="/privacy" className="hover:text-slate-900 transition-colors">
              Privasi
            </Link>
            <Link to="/terms" className="hover:text-slate-900 transition-colors">
              Ketentuan
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary" size="sm">
                  Masuk ke Dasbor
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Masuk
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="indigo" size="sm">
                    Mulai Gratis
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 bg-white py-10 text-slate-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <NippiaLogo variant="wordmark" size="sm" showSubtitle />
              <p className="mt-2.5 max-w-xl text-xs text-slate-500 leading-relaxed">
                Platform persiapan mandiri CPNS SKD (TWK, TIU, TKP) berbasis analitik dan latihan adaptif.
                Nippia adalah platform persiapan independen dan tidak berafiliasi dengan BKN atau
                KemenPAN-RB. Seluruh aturan resmi ujian mengacu pada pengumuman resmi pemerintah
                pada tahun seleksi berjalan.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-600">
              <Link to="/features" className="hover:text-slate-900 transition-colors">
                Fitur
              </Link>
              <Link to="/about" className="hover:text-slate-900 transition-colors">
                Tentang
              </Link>
              <Link to="/privacy" className="hover:text-slate-900 transition-colors">
                Kebijakan Privasi
              </Link>
              <Link to="/terms" className="hover:text-slate-900 transition-colors">
                Syarat & Ketentuan
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
