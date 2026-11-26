import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Button } from '../ui';
import { useAuthStore } from '../../stores/authStore';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900">Nippia</span>
              <span className="ml-1.5 rounded-md bg-indigo-50 px-1.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                SKD MASTER
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <Link to="/features" className="hover:text-slate-900">
              Fitur
            </Link>
            <Link to="/about" className="hover:text-slate-900">
              Tentang Kami
            </Link>
            <Link to="/privacy" className="hover:text-slate-900">
              Privasi
            </Link>
            <Link to="/terms" className="hover:text-slate-900">
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

      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold text-slate-900">Nippia — SKD Master</p>
              <p className="mt-1 max-w-xl text-xs text-slate-500">
                Platform persiapan mandiri CPNS SKD (TWK, TIU, TKP) berbasis analitik dan AI.
                Nippia adalah platform persiapan independen dan tidak berafiliasi dengan BKN atau
                KemenPAN-RB. Seluruh aturan resmi ujian mengacu pada pengumuman resmi pemerintah
                pada tahun seleksi berjalan.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-600">
              <Link to="/features" className="hover:text-slate-900">
                Fitur
              </Link>
              <Link to="/about" className="hover:text-slate-900">
                Tentang
              </Link>
              <Link to="/privacy" className="hover:text-slate-900">
                Kebijakan Privasi
              </Link>
              <Link to="/terms" className="hover:text-slate-900">
                Syarat & Ketentuan
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
