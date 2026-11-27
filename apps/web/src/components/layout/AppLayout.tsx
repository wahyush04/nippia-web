import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Award,
  BarChart3,
  Bell,
  BookMarked,
  BookOpen,
  Bot,
  CalendarDays,
  Compass,
  Crown,
  Flag,
  Flame,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Radio,
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
import { NippiaLogo } from '../ui/NippiaLogo';
import { ProBadge } from '../ui/ProBadge';

const USER_NAV = [
  { label: 'Dasbor', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Live Akbar', to: '/live-events', icon: Radio },
  { label: 'Event Saya', to: '/live-events/my-events', icon: Bell },
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
  { label: 'Nippia Pro', to: '/subscription', icon: Crown },
];

const ADMIN_NAV = [
  { label: 'Dasbor Admin', to: '/admin', icon: Shield },
  { label: 'Langganan & Order', to: '/admin/subscriptions', icon: Crown },
  { label: 'Kelola Bank Soal', to: '/admin/questions', icon: BookOpen },
  { label: 'Generator Soal AI', to: '/admin/ai-generator', icon: Sparkles },
  { label: 'Topik & Kisi-Kisi', to: '/admin/topics', icon: Compass },
  { label: 'Laporan Soal', to: '/admin/reports', icon: Flag },
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
    <div className="flex h-full flex-col bg-slate-800 text-slate-100 border-r border-slate-700/80">
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700/80">
        <Link to="/dashboard" className="flex items-center">
          <NippiaLogo variant="wordmark" onDark size="md" showSubtitle />
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Gamification compact bar */}
      <div className="mx-3 mt-3 rounded-xl bg-slate-900/70 border border-slate-700/80 p-3 text-white">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-indigo-300">{user?.profile?.levelName ?? 'Pemula'}</span>
            {user?.isPro && <ProBadge size="xs" />}
          </div>
          <span className="flex items-center gap-1 font-semibold text-amber-400">
            <Flame className="h-3.5 w-3.5" /> {user?.streak?.currentStreak ?? 0} hr
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-lg font-bold">{user?.profile?.totalXp ?? 0} XP</p>
          {!user?.isPro && (
            <Link
              to="/subscription"
              className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-[10px] font-extrabold text-slate-950 hover:from-amber-300 hover:to-orange-400"
            >
              <Crown className="h-2.5 w-2.5" /> Upgrade
            </Link>
          )}
        </div>
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
              end={item.to === '/live-events'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-200 hover:bg-slate-700/60 hover:text-white',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}

        {(user?.role === 'ADMIN' || user?.role === 'EVENT_ADMIN' || user?.role === 'HOST_OPERATOR') && (
          <div className="pt-4">
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {user.role === 'ADMIN' ? 'Administrator' : 'Operator Event'}
            </p>
            <NavLink
              to="/admin/live-events"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-200 hover:bg-slate-700/60 hover:text-white',
                )
              }
            >
              <Radio className="h-4 w-4 shrink-0" />
              <span className="truncate">Kelola Live Akbar</span>
            </NavLink>
            {user?.role === 'ADMIN' &&
              ADMIN_NAV.map((item) => {
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
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-200 hover:bg-slate-700/60 hover:text-white',
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

      <div className="border-t border-slate-700/80 p-3 space-y-1">
        <NavLink
          to="/profile"
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-indigo-600 text-white' : 'text-slate-200 hover:bg-slate-700/60 hover:text-white',
            )
          }
        >
          <User className="h-4 w-4 shrink-0" />
          <span className="truncate flex-1">{user?.name || 'Profil Saya'}</span>
          {user?.isPro && <ProBadge size="xs" />}
        </NavLink>
        <NavLink
          to="/settings"
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-indigo-600 text-white' : 'text-slate-200 hover:bg-slate-700/60 hover:text-white',
            )
          }
        >
          <Settings className="h-4 w-4" />
          <span>Pengaturan</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-300 hover:bg-rose-500/15 hover:text-rose-200 cursor-pointer"
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
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-2xs" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 w-72 max-w-[85vw] h-full">{sidebarContent}</div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-700 bg-slate-800/95 px-4 py-3 text-white backdrop-blur-sm lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-xl border border-slate-700 bg-slate-900/70 p-2 text-slate-200 hover:bg-slate-700"
          >
            <Menu className="h-5 w-5" />
          </button>
          <NippiaLogo variant="wordmark" onDark size="sm" />
          <Badge className="bg-indigo-500/25 text-indigo-200 border border-indigo-400/30">
            {user?.profile?.totalXp ?? 0} XP
          </Badge>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
