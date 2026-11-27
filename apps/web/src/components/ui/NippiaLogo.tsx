import { cn } from './index';

export function NippiaLogo({
  variant = 'wordmark',
  size = 'md',
  onDark = false,
  showSubtitle = false,
  className,
}: {
  variant?: 'mark' | 'wordmark';
  size?: 'sm' | 'md' | 'lg';
  onDark?: boolean;
  showSubtitle?: boolean;
  className?: string;
}) {
  if (variant === 'mark') {
    const imgSize = size === 'sm' ? 'h-8' : size === 'lg' ? 'h-12' : 'h-10';
    const boxSize =
      size === 'sm' ? 'h-10 w-10 p-1.5' : size === 'lg' ? 'h-14 w-14 p-2' : 'h-11 w-11 p-1.5';

    if (onDark) {
      return (
        <img
          src="/nippia-mark.png"
          alt="Nippia"
          className={cn('w-auto shrink-0 object-contain select-none', imgSize, className)}
        />
      );
    }

    return (
      <div
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200/90 shadow-2xs',
          boxSize,
          className,
        )}
      >
        <img
          src="/nippia-mark.png"
          alt="Nippia"
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  const wordmarkHeight =
    size === 'sm' ? 'h-7' : size === 'lg' ? 'h-11 sm:h-12' : 'h-8 sm:h-9';

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <img
        src={onDark ? '/nippia-wordmark.png' : '/nippia-wordmark-dark.png'}
        alt="Nippia"
        className={cn('w-auto object-contain select-none', wordmarkHeight)}
      />
      {showSubtitle && (
        <span
          className={cn(
            'rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wider',
            onDark
              ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-400/25'
              : 'bg-indigo-50 text-indigo-700',
          )}
        >
          SKD MASTER
        </span>
      )}
    </div>
  );
}
