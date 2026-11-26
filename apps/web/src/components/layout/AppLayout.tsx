import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Award,
  BarChart3,
  BookMarked,
  BookOpen,
  Bot,
  CalendarDays,
  Compass,
  Flame,
  GraduationCap,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  Sparkles,
  Target,
  Timer,
  Trophy,
  User,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Badge, cn } from '../ui';

const USER_NAV = [
  { label: 'Dasbor', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Latihan Harian', to: '/daily-practice', icon: Target },
  { label: 'Latihan per Topik', to: '/topics', icon: Compass },
  { label: 'Simulasi CAT', to: '/cat-simulation', icon: Timer },
  { label: 'Analisis Kelemahan', to: '/analytics', icon: BarChart3 },
  { label: 'Tutor AI', to: '/ai-tutor', icon: Bot },
  { label: 'Perencana Belajar', to: '/planner', icon: CalendarDays },
  { label: 'Buku Kesalahan', to: '/error-notebook', icon: BookMarked },
  { label: 'Kartu Hafalan', to: '/flashcards', icon: Layers },
  { label: 'Pusat Materi', to: '/materials', icon: BookOpen },
  { label: 'Peringkat', to: '/leaderboard', icon: Trophy },
  { label: 'Lencana & XP', to: '/achievements', icon: Award },
];

const ADMIN_NAV = [
  { label: 'Dasbor Admin', to: '/admin', icon: Shield },
  { label: 'Kelola Bank Soal', to: '/admin/questions', icon: BookOpen },
  { label: 'Generator Soal AI', to: '/admin/ai-generator', icon: Sparkles },
  { label: 'Topik & Kisi-Kisi', to: '/admin/topics', icon: Compass },
  { label: 'Pengguna', to: '/admin/users', icon: User },
  { label: 'Konfigurasi Ujian & Skor', to: '/admin/configs', icon: Settings },
  { label: 'Kontrol Kualitas', to: '/admin/quality', icon: BarChart3 },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white border-r border-slate-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-bold">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-slate-900">Nippia</p>
            <p className="text-[11px] font-medium text-indigo-600">SKD MASTER</p>
          </div>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Gamification compact bar */}
      <div className="mx-3 mt-3 rounded-xl bg-slate-900 p-3 text-white">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-indigo-300">{user?.profile?.levelName ?? 'Pemula'}</span>
          <span className="flex items-center gap-1 font-semibold text-amber-400">
            <Flame className="h-3.5 w-3.5" /> {user?.streak?.currentStreak ?? 0} hr
          </span>
        </div>
        <p className="mt-1 text-lg font-bold">{user?.profile?.totalXp ?? 0} XP</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Pembelajaran
        </p>
        {USER_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}

        {user?.role === 'ADMIN' && (
          <div className="pt-4">
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Administrator
            </p>
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    )
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </nav>

      <div className="border-t border-slate-100 p-3 space-y-1">
        <NavLink
          to="/profile"
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium',
              isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100',
            )
          }
        >
          <User className="h-4 w-4" />
          <span className="truncate">{user?.name || 'Profil Saya'}</span>
        </NavLink>
        <NavLink
          to="/settings"
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium',
              isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100',
            )
          }
        >
          <Settings className="h-4 w-4" />
          <span>Pengaturan</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block sticky top-0 h-screen">{sidebarContent}</aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-950/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 w-72 max-w-[85vw] h-full">{sidebarContent}</div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-sm lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-xl border border-slate-200 p-2 text-slate-700"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-bold text-slate-900">Nippia — SKD Master</span>
          <Badge variant="indigo">{user?.profile?.totalXp ?? 0} XP</Badge>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
