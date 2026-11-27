import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
          <div className="grid gap-8 md:grid-cols-12 md:items-start">
            <div className="md:col-span-5">
              <NippiaLogo variant="wordmark" size="sm" showSubtitle />
              <p className="mt-2.5 max-w-xl text-xs text-slate-500 leading-relaxed">
                Platform persiapan mandiri CPNS SKD (TWK, TIU, TKP) berbasis analitik dan latihan adaptif.
                Nippia adalah platform persiapan independen dan tidak berafiliasi dengan BKN atau
                KemenPAN-RB. Seluruh aturan resmi ujian mengacu pada pengumuman resmi pemerintah
                pada tahun seleksi berjalan.
              </p>
            </div>

            <div className="md:col-span-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-800">
                Informasi Kontak &amp; Dukungan
              </p>
              <div className="space-y-1.5 text-xs text-slate-600">
                <a
                  href="mailto:support@nippia.my.id"
                  className="flex items-center gap-2 hover:text-indigo-600 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 text-indigo-600" />
                  <span>
                    Email: <strong className="font-semibold text-slate-800">support@nippia.my.id</strong>
                  </span>
                </a>
                <a
                  href="tel:085737275048"
                  className="flex items-center gap-2 hover:text-indigo-600 transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span>
                    No. Telp / WhatsApp:{' '}
                    <strong className="font-semibold text-slate-800">085737275048</strong>
                  </span>
                </a>
              </div>
            </div>

            <div className="md:col-span-3 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-800">
                Tautan &amp; Legal
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-600">
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
                  Syarat &amp; Ketentuan
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <span>© 2026 Nippia — SKD Master (nippia.my.id). Seluruh hak dilindungi.</span>
            <span>Dukungan pelanggan: support@nippia.my.id • 085737275048</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
