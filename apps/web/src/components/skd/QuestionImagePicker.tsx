import { useRef, useState } from 'react';
import { ImagePlus, Link2, Trash2 } from 'lucide-react';
import { Button, Input } from '../ui';
import { FiguralRenderer } from './FiguralRenderer';

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB raw upload limit

function compressImageToDataUrl(file: File, maxDimension: number): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File harus berupa gambar (PNG, JPG, WebP, atau GIF).'));
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      reject(new Error('Ukuran file gambar maksimal 5 MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      if (file.type === 'image/gif') {
        if (file.size <= 1_200_000) {
          resolve(dataUrl);
        } else {
          reject(new Error('GIF animasi maksimal 1,2 MB.'));
        }
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Format gambar tidak dapat diproses.'));
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const outputMime = file.type === 'image/png' ? 'image/png' : 'image/webp';
        const compressed = canvas.toDataURL(outputMime, 0.86);
        resolve(compressed.length < dataUrl.length ? compressed : dataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export function QuestionImagePicker({
  label,
  value,
  onChange,
  compact = false,
}: {
  label: string;
  value: Record<string, unknown> | null | undefined;
  onChange: (next: Record<string, unknown> | null) => void;
  compact?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [urlOpen, setUrlOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const isImageSpec =
    Boolean(value) &&
    ((value?.kind === 'image' || value?.type === 'image') && typeof value?.url === 'string');

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return;
    setError(null);
    setProcessing(true);
    try {
      const dataUrl = await compressImageToDataUrl(file, compact ? 520 : 1100);
      onChange({
        kind: 'image',
        url: dataUrl,
        alt: label,
      });
      setUrlOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat gambar.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData?.items ?? []);
    const imgItem = items.find((it) => it.type.startsWith('image/'));
    if (imgItem) {
      e.preventDefault();
      await handleFile(imgItem.getAsFile());
    }
  };

  const applyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!/^https?:\/\/[^\s]+$/i.test(trimmed)) {
      setError('URL gambar harus diawali dengan https:// atau http://');
      return;
    }
    setError(null);
    onChange({
      kind: 'image',
      url: trimmed,
      alt: label,
    });
    setUrlInput('');
    setUrlOpen(false);
  };

  return (
    <div onPaste={handlePaste} className={compact ? 'space-y-2' : 'space-y-2.5'}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          isLoading={processing}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="h-3.5 w-3.5 text-indigo-600" />
          {value ? `Ganti ${label}` : `Tambah ${label}`}
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            setUrlOpen((v) => !v);
            setError(null);
          }}
        >
          <Link2 className="h-3.5 w-3.5" />
          {urlOpen ? 'Tutup URL' : 'Pakai URL'}
        </Button>

        {value && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            onClick={() => onChange(null)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Hapus Gambar
          </Button>
        )}

        {!compact && !value && (
          <span className="text-[11px] text-slate-500">
            Mendukung PNG, JPG, WebP, GIF atau tempel langsung (Ctrl+V) di area ini.
          </span>
        )}
      </div>

      {urlOpen && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5">
          <Input
            type="url"
            placeholder="https://contoh.com/gambar-soal.png"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="h-8 flex-1 min-w-[200px] text-xs"
          />
          <Button type="button" size="sm" variant="indigo" onClick={applyUrl}>
            Terapkan URL
          </Button>
        </div>
      )}

      {error && (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      )}

      {value && (
        <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/40 p-3 space-y-2">
          <p className="text-[11px] font-semibold text-indigo-800">
            {isImageSpec ? `Pratinjau ${label}` : `Pratinjau Visual Figural SVG`}
          </p>
          <FiguralRenderer spec={value} compact={compact} />
          {!compact && isImageSpec && (
            <Input
              placeholder="Keterangan gambar / caption (opsional)"
              value={typeof value.caption === 'string' ? value.caption : ''}
              onChange={(e) =>
                onChange({
                  ...value,
                  caption: e.target.value,
                })
              }
              className="h-8 bg-white text-xs max-w-md"
            />
          )}
        </div>
      )}
    </div>
  );
}
