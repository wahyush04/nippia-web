import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './index';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'Terjadi kesalahan saat merender halaman.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
          <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h1 className="text-lg font-bold text-slate-900">Terjadi Kendala Halaman</h1>
              <p className="text-xs text-slate-600">
                Silakan muat ulang halaman untuk memulihkan tampilan aplikasi.
              </p>
            </div>
            <div className="flex justify-center gap-2">
              <Button variant="indigo" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4" /> Muat Ulang Halaman
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
