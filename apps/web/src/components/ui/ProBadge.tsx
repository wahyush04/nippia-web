import { Link } from 'react-router-dom';
import { Crown, Lock, Sparkles } from 'lucide-react';
import { Button, cn } from './index';

export function ProBadge({
  size = 'sm',
  className,
  label = 'PRO',
}: {
  size?: 'xs' | 'sm';
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 font-bold tracking-wide text-white shadow-2xs',
        size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-[11px]',
        className,
      )}
    >
      <Crown className={size === 'xs' ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
      {label}
    </span>
  );
}

export function ProUpgradeBanner({
  title = 'Buka Akses Penuh dengan Nippia Pro',
  description = 'Nikmati seluruh 41 Unit Campaign, 420+ soal Drilling 24 Topik, Simulasi CAT 110 soal unlimited, Live Akbar Premium, Buku Kesalahan lengkap, dan Jadwal 14 Hari hanya Rp 29.000/bulan.',
  ctaLabel = 'Upgrade Pro — Rp 29.000/bln',
  compact = false,
  className,
}: {
  title?: string;
  description?: string;
  ctaLabel?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col justify-between gap-4 rounded-2xl border border-amber-300/80 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-sm sm:flex-row sm:items-center',
        compact ? 'p-4' : 'p-5',
        className,
      )}
    >
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <ProBadge />
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-200">
            <Sparkles className="h-3.5 w-3.5" /> Hanya Rp 29.000 / bulan
          </span>
        </div>
        <h3 className={cn('font-bold text-white', compact ? 'text-sm' : 'text-base')}>{title}</h3>
        <p className="text-xs leading-relaxed text-slate-300">{description}</p>
      </div>
      <Link to="/subscription" className="shrink-0">
        <Button
          variant="secondary"
          size={compact ? 'sm' : 'md'}
          className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold hover:from-amber-300 hover:to-orange-400 border-0 shadow-sm"
        >
          <Lock className="h-3.5 w-3.5" />
          {ctaLabel}
        </Button>
      </Link>
    </div>
  );
}
