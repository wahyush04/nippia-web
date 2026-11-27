import { useEffect, useState } from 'react';
import { CheckCircle2, Flag } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { Badge, Button, Modal, Textarea } from '../ui';

const REPORT_REASONS = [
  'Kunci jawaban tidak tepat / membingungkan',
  'Kesalahan ketik (typo) pada soal atau opsi',
  'Gambar figural tidak jelas / rusak / keliru',
  'Pembahasan atau dasar hukum kurang tepat',
  'Terdapat lebih dari satu jawaban benar',
  'Lainnya',
] as const;

export function ReportQuestionButton({
  questionId,
  questionCode,
  compact = true,
  className = '',
}: {
  questionId: string;
  questionCode?: string;
  compact?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reported, setReported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOpen(false);
    setReason(REPORT_REASONS[0]);
    setDetails('');
    setReported(false);
    setError(null);
  }, [questionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch(`/practice/questions/${questionId}/report`, {
        method: 'POST',
        body: JSON.stringify({
          reason,
          details: details.trim() || undefined,
        }),
      });
      setReported(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim laporan soal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={reported ? 'Soal telah dilaporkan' : 'Laporkan kesalahan soal'}
        aria-label="Laporkan kesalahan soal"
        className={`inline-flex items-center justify-center gap-1 rounded-lg border transition-colors cursor-pointer ${
          reported
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-slate-200 bg-white text-slate-400 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600'
        } ${compact ? 'h-7 px-2 text-[11px] font-medium' : 'px-2.5 py-1 text-xs font-medium'} ${className}`}
      >
        <Flag className="h-3.5 w-3.5 shrink-0" />
        {reported && <span className="hidden sm:inline">Dilaporkan</span>}
      </button>

      <Modal open={open} onClose={handleClose} title="Laporkan Kesalahan Soal" maxWidth="max-w-md">
        {reported ? (
          <div className="space-y-4 text-center py-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900">Laporan Soal Terkirim</p>
              <p className="text-xs leading-relaxed text-slate-600">
                Terima kasih atas masukan Anda. Tim Admin akan meninjau soal{' '}
                {questionCode ? <strong>{questionCode}</strong> : 'ini'} dan memperbaikinya bila diperlukan.
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={handleClose}>
              Tutup
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200/80 px-3 py-2 text-xs text-slate-600">
              <span>Kategori laporan untuk soal:</span>
              <Badge variant="navy">{questionCode || 'Soal SKD'}</Badge>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Jenis Kesalahan</label>
              <div className="grid gap-1.5">
                {REPORT_REASONS.map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-xs cursor-pointer transition-colors ${
                      reason === opt
                        ? 'border-rose-300 bg-rose-50/70 font-semibold text-rose-950'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      checked={reason === opt}
                      onChange={() => setReason(opt)}
                      className="accent-rose-600"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Keterangan Tambahan <span className="font-normal text-slate-400">(opsional)</span>
              </label>
              <Textarea
                rows={3}
                maxLength={1000}
                placeholder="Jelaskan bagian mana yang keliru atau saran perbaikannya..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="text-xs"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={handleClose}>
                Batal
              </Button>
              <Button type="submit" variant="danger" size="sm" isLoading={submitting}>
                <Flag className="h-3.5 w-3.5" /> Kirim Laporan
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
