import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AlertCircle, Inbox, Loader2, X } from 'lucide-react';

export function cn(...inputs: Array<string | undefined | null | false>) {
  return twMerge(clsx(inputs));
}

// Button
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'indigo';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
      primary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm',
      indigo: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
      outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
      ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    };
    const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
      sm: 'h-8 px-3 text-xs rounded-lg',
      md: 'h-10 px-4 text-sm rounded-xl',
      lg: 'h-11 px-6 text-sm rounded-xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';

// Card
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-2xl border border-slate-200/90 bg-white shadow-xs', className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 pb-3', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-base font-semibold text-slate-900', className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('mt-1 text-sm text-slate-500', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 pt-2', className)} {...props} />;
}

// Badge
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'navy' | 'indigo' | 'success' | 'warning' | 'danger' | 'neutral';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const styles: Record<NonNullable<BadgeProps['variant']>, string> = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    navy: 'bg-blue-950 text-white border-blue-950',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    neutral: 'bg-slate-50 text-slate-600 border-slate-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}

// Input & Select & Textarea
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 disabled:bg-slate-50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[90px] w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = 'Select';

// Progress Bar
export function ProgressBar({
  value,
  colorClass = 'bg-indigo-600',
  className,
}: {
  value: number;
  colorClass?: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-slate-100', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-300', colorClass)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

// Modal
export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
      <div className={cn('w-full rounded-2xl border border-slate-200 bg-white shadow-xl', maxWidth)}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

// States
export function LoadingState({ label = 'Memuat data...' }: { label?: string }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
      <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
      <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-400">
        <Inbox className="h-6 w-6" />
      </div>
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/60 p-8 text-center">
      <AlertCircle className="mb-2 h-7 w-7 text-red-600" />
      <p className="text-sm font-semibold text-red-900">Terjadi Kendala</p>
      <p className="mt-1 text-sm text-red-700">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Coba Lagi
        </Button>
      )}
    </div>
  );
}
