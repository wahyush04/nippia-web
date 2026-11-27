import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Crown,
  Download,
  Edit3,
  Eye,
  Flag,
  Plus,
  Search,
  Settings,
  Shield,
  Sparkles,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { AppLayout } from '../../components/layout/AppLayout';
import { FiguralRenderer } from '../../components/skd/FiguralRenderer';
import { QuestionDiscussionPanel } from '../../components/skd/QuestionDiscussionPanel';
import { ProBadge } from '../../components/ui/ProBadge';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  LoadingState,
  Modal,
  Select,
  Textarea,
} from '../../components/ui';

export function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () =>
      apiFetch<{
        totalUsers: number;
        activeUsers7d: number;
        totalPublishedQuestions: number;
        draftQuestions: number;
        totalSimulations: number;
        openReports: number;
        hardestTopics: Array<{ topicName: string; subjectCode: string; avgAccuracy: number; totalAttempts: number }>;
        recentUsers: Array<{ id: string; name: string; email: string; role: string; createdAt: string }>;
      }>('/admin/overview'),
  });

  if (isLoading || !data) {
    return (
      <AppLayout>
        <LoadingState label="Memuat metrik administrator..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge variant="navy">
              <Shield className="h-3 w-3" /> Panel Administrator
            </Badge>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Dasbor & Analitik Sistem</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/subscriptions">
              <Button variant="outline" size="sm">
                <Crown className="h-4 w-4 text-amber-500" /> Langganan & Order
              </Button>
            </Link>
            <Link to="/admin/reports">
              <Button variant="outline" size="sm">
                <Flag className="h-4 w-4 text-amber-600" /> Laporan Soal ({data.openReports})
              </Button>
            </Link>
            <Link to="/admin/questions/new">
              <Button variant="indigo" size="sm">
                <Plus className="h-4 w-4" /> Tambah Soal
              </Button>
            </Link>
            <Link to="/admin/ai-generator">
              <Button variant="outline" size="sm">
                <Sparkles className="h-4 w-4" /> Generator AI
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: 'Total Pengguna', val: data.totalUsers, sub: `${data.activeUsers7d} aktif 7 hari terakhir` },
            { label: 'Bank Soal Terpublikasi', val: data.totalPublishedQuestions, sub: `${data.draftQuestions} draf menunggu tinjauan` },
            { label: 'Simulasi CAT Selesai', val: data.totalSimulations, sub: `${data.openReports} laporan konten terbuka` },
          ].map((m) => (
            <Card key={m.label}>
              <CardContent className="p-5">
                <p className="text-xs font-medium text-slate-500">{m.label}</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">{m.val}</p>
                <p className="mt-1 text-xs text-slate-500">{m.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Topik Tersulit bagi Pengguna</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {data.hardestTopics.length === 0 ? (
                <p className="text-xs text-slate-500">Belum ada data agregat topik.</p>
              ) : (
                data.hardestTopics.map((t, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
                    <div>
                      <Badge variant="navy">{t.subjectCode}</Badge>{' '}
                      <span className="font-semibold text-slate-900">{t.topicName}</span>
                    </div>
                    <span className="font-bold text-red-600">{t.avgAccuracy}% ({t.totalAttempts} percobaan)</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pengguna Terbaru</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {data.recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
                  <div>
                    <p className="font-semibold text-slate-900">{u.name}</p>
                    <p className="text-slate-500">{u.email}</p>
                  </div>
                  <Badge variant={u.role === 'ADMIN' ? 'navy' : 'neutral'}>{u.role}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

export function QuestionManagementPage() {
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importMsg, setImportMsg] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-questions', page, subject, status, search],
    queryFn: () =>
      apiFetch<{
        items: Array<{
          id: string;
          code: string;
          stem: string;
          difficulty: string;
          status: string;
          isAiGenerated: boolean;
          version: number;
          subject: { code: string };
          topic: { name: string };
        }>;
        pagination: { page: number; total: number; totalPages: number };
      }>(`/admin/questions?page=${page}&pageSize=20&subject=${subject}&status=${status}&q=${encodeURIComponent(search)}`),
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus soal ini secara permanen?')) return;
    await apiFetch(`/admin/questions/${id}`, { method: 'DELETE' });
    await refetch();
  };

  const handleExport = async () => {
    const all = await apiFetch<unknown[]>('/admin/questions/export');
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nippia-bank-soal-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    try {
      const parsed = JSON.parse(importText);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      const res = await apiFetch<{ imported: number }>('/admin/questions/import', {
        method: 'POST',
        body: JSON.stringify({ items }),
      });
      setImportMsg(`Berhasil mengimpor ${res.imported} soal.`);
      await refetch();
    } catch (err) {
      setImportMsg(err instanceof Error ? err.message : 'Format JSON impor tidak valid.');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manajemen Bank Soal</h1>
            <p className="text-sm text-slate-600">
              Total {data?.pagination.total ?? 0} soal tersimpan di PostgreSQL.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4" /> Impor JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" /> Ekspor JSON
            </Button>
            <Link to="/admin/questions/new">
              <Button variant="indigo" size="sm">
                <Plus className="h-4 w-4" /> Buat Soal Baru
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-wrap gap-3 p-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Cari kode atau teks soal..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Select className="w-36" value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value="">Semua Subtes</option>
              <option value="TWK">TWK</option>
              <option value="TIU">TIU</option>
              <option value="TKP">TKP</option>
            </Select>
            <Select className="w-40" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Semua Status</option>
              <option value="PUBLISHED">Terpublikasi</option>
              <option value="DRAFT">Draf</option>
              <option value="ARCHIVED">Diarsipkan</option>
            </Select>
          </CardContent>
        </Card>

        {isLoading ? (
          <LoadingState label="Memuat bank soal..." />
        ) : (
          <Card>
            <CardContent className="p-0 divide-y divide-slate-100">
              {(data?.items || []).map((q) => (
                <div key={q.id} className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="navy">{q.code}</Badge>
                      <Badge variant="indigo">{q.subject.code} • {q.topic.name}</Badge>
                      <Badge variant="neutral">{q.difficulty}</Badge>
                      <Badge variant={q.status === 'PUBLISHED' ? 'success' : 'warning'}>{q.status}</Badge>
                      {q.isAiGenerated && <Badge variant="indigo">Draf AI</Badge>}
                      <span className="text-[11px] text-slate-400">v{q.version}</span>
                    </div>
                    <p className="text-sm text-slate-800 line-clamp-2">{q.stem}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/admin/questions/${q.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit3 className="h-3.5 w-3.5" /> Edit
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(q.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {data && data.pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Sebelumnya
            </Button>
            <span className="px-3 py-1.5 text-xs font-medium text-slate-600">
              Halaman {page} dari {data.pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Berikutnya
            </Button>
          </div>
        )}
      </div>

      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="Impor Bank Soal (JSON)">
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            Tempelkan array JSON soal sesuai skema `questionCreateSchema` untuk diimpor ke database.
          </p>
          <Textarea
            rows={8}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='[{"subjectCode":"TWK","topicSlug":"pancasila","difficulty":"MEDIUM",...}]'
          />
          {importMsg && <p className="text-xs font-semibold text-indigo-700">{importMsg}</p>}
          <Button variant="indigo" onClick={handleImport}>
            Jalankan Impor
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
}

export function QuestionEditorPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const returnTo = searchParams.get('returnTo') || '/admin/questions';
  const defaultSubject = (searchParams.get('subject') as 'TWK' | 'TIU' | 'TKP' | null) || 'TWK';
  const defaultTopicSlug = searchParams.get('topicSlug') || 'pancasila';

  const { data: topics } = useQuery({
    queryKey: ['admin-topics'],
    queryFn: () => apiFetch<Array<{ slug: string; name: string; subject: { code: 'TWK' | 'TIU' | 'TKP' } }>>('/admin/topics'),
  });

  const { data: existingQuestion, isLoading: loadingExisting } = useQuery({
    queryKey: ['admin-question-detail', id],
    enabled: isEdit,
    queryFn: () => apiFetch<Record<string, any>>(`/admin/questions/${id}`),
  });

  const [subjectCode, setSubjectCode] = useState<'TWK' | 'TIU' | 'TKP'>(defaultSubject);
  const [topicSlug, setTopicSlug] = useState(defaultTopicSlug);
  const [questionType, setQuestionType] = useState('MULTIPLE_CHOICE');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('PUBLISHED');
  const [stem, setStem] = useState('');
  const [visualSpec, setVisualSpec] = useState<Record<string, unknown> | null>(null);
  const [explanation, setExplanation] = useState('');
  const [conceptSummary, setConceptSummary] = useState('');
  const [quickTrick, setQuickTrick] = useState('');
  const [commonMistakes, setCommonMistakes] = useState('');
  const [options, setOptions] = useState<
    Array<{
      optionKey: 'A' | 'B' | 'C' | 'D' | 'E';
      text: string;
      scoreValue: number;
      isCorrect: boolean;
      optionFeedback: string;
      visualSpec?: Record<string, unknown> | null;
    }>
  >([
    { optionKey: 'A', text: '', scoreValue: 5, isCorrect: true, optionFeedback: '', visualSpec: null },
    { optionKey: 'B', text: '', scoreValue: 0, isCorrect: false, optionFeedback: '', visualSpec: null },
    { optionKey: 'C', text: '', scoreValue: 0, isCorrect: false, optionFeedback: '', visualSpec: null },
    { optionKey: 'D', text: '', scoreValue: 0, isCorrect: false, optionFeedback: '', visualSpec: null },
    { optionKey: 'E', text: '', scoreValue: 0, isCorrect: false, optionFeedback: '', visualSpec: null },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit || !existingQuestion) return;
    if (existingQuestion.subject?.code) setSubjectCode(existingQuestion.subject.code);
    if (existingQuestion.topic?.slug) setTopicSlug(existingQuestion.topic.slug);
    if (existingQuestion.questionType) setQuestionType(existingQuestion.questionType);
    if (existingQuestion.difficulty) setDifficulty(existingQuestion.difficulty);
    if (existingQuestion.status) setStatus(existingQuestion.status);
    if (existingQuestion.stem) setStem(existingQuestion.stem);
    setVisualSpec(existingQuestion.visualSpec ?? null);
    if (existingQuestion.explanation) setExplanation(existingQuestion.explanation);
    setConceptSummary(existingQuestion.conceptSummary || '');
    setQuickTrick(existingQuestion.quickTrick || '');
    setCommonMistakes(existingQuestion.commonMistakes || '');
    if (Array.isArray(existingQuestion.options) && existingQuestion.options.length === 5) {
      setOptions(
        existingQuestion.options.map((o: any) => ({
          optionKey: o.optionKey,
          text: o.text,
          scoreValue: o.scoreValue,
          isCorrect: o.isCorrect,
          optionFeedback: o.optionFeedback || '',
          visualSpec: o.visualSpec ?? null,
        })),
      );
    }
  }, [isEdit, existingQuestion]);

  const filteredTopics = (topics || []).filter((t) => t.subject.code === subjectCode);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        subjectCode,
        topicSlug,
        questionType,
        difficulty,
        status,
        stem,
        ...(visualSpec ? { visualSpec } : {}),
        explanation,
        ...(conceptSummary ? { conceptSummary } : {}),
        quickTrick,
        ...(commonMistakes ? { commonMistakes } : {}),
        options: options.map((o) => ({
          optionKey: o.optionKey,
          text: o.text,
          scoreValue: o.scoreValue,
          isCorrect: o.isCorrect,
          optionFeedback: o.optionFeedback,
          ...(o.visualSpec ? { visualSpec: o.visualSpec } : {}),
        })),
      };
      if (isEdit) {
        await apiFetch(`/admin/questions/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/admin/questions', { method: 'POST', body: JSON.stringify(payload) });
      }
      navigate(returnTo);
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && loadingExisting) {
    return (
      <AppLayout>
        <LoadingState label="Memuat detail soal untuk diedit..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={() => navigate(returnTo)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Kembali
            </button>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              {isEdit ? `Edit Soal ${existingQuestion?.code ?? ''}` : 'Buat Soal Baru'}
            </h1>
          </div>
          {isEdit && existingQuestion?.packageCode && (
            <Badge variant="indigo">Paket: {existingQuestion.packageCode} • v{existingQuestion.version}</Badge>
          )}
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold">Subtes</label>
                  <Select
                    value={subjectCode}
                    onChange={(e) => {
                      const next = e.target.value as 'TWK' | 'TIU' | 'TKP';
                      setSubjectCode(next);
                      const firstT = (topics || []).find((t) => t.subject.code === next);
                      if (firstT) setTopicSlug(firstT.slug);
                    }}
                  >
                    <option value="TWK">TWK</option>
                    <option value="TIU">TIU</option>
                    <option value="TKP">TKP</option>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold">Topik</label>
                  <Select value={topicSlug} onChange={(e) => setTopicSlug(e.target.value)}>
                    {filteredTopics.map((t) => (
                      <option key={t.slug} value={t.slug}>
                        {t.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold">Kesulitan</label>
                  <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}>
                    <option value="EASY">Mudah</option>
                    <option value="MEDIUM">Sedang</option>
                    <option value="HARD">Sulit</option>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold">Status</label>
                  <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
                    <option value="PUBLISHED">Terpublikasi</option>
                    <option value="DRAFT">Draf</option>
                    <option value="ARCHIVED">Arsip</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold">Pertanyaan (Stem)</label>
                <Textarea rows={4} value={stem} onChange={(e) => setStem(e.target.value)} required />
              </div>

              {visualSpec && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-2">
                  <p className="text-xs font-semibold text-indigo-800">Pratinjau Gambar Figural Soal (SVG Dipertahankan)</p>
                  <FiguralRenderer spec={visualSpec as any} />
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-xs font-semibold">Pilihan Jawaban (A–E), Bobot Skor & Rasional Opsi</label>
                {options.map((opt, idx) => (
                  <div key={opt.optionKey} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
                    <div className="grid gap-2 sm:grid-cols-12 items-center">
                      <span className="sm:col-span-1 font-bold text-sm text-center">{opt.optionKey}</span>
                      <Input
                        className="sm:col-span-7"
                        placeholder={`Teks opsi ${opt.optionKey}`}
                        value={opt.text}
                        onChange={(e) => {
                          const copy = [...options];
                          copy[idx].text = e.target.value;
                          setOptions(copy);
                        }}
                        required
                      />
                      <Input
                        type="number"
                        min={0}
                        max={5}
                        className="sm:col-span-2"
                        value={opt.scoreValue}
                        onChange={(e) => {
                          const copy = [...options];
                          copy[idx].scoreValue = Number(e.target.value);
                          setOptions(copy);
                        }}
                      />
                      <label className="sm:col-span-2 flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={opt.isCorrect}
                          onChange={(e) => {
                            const copy = [...options];
                            copy[idx].isCorrect = e.target.checked;
                            setOptions(copy);
                          }}
                        />
                        Kunci/Terbaik
                      </label>
                    </div>
                    {opt.visualSpec && (
                      <div className="pl-8 max-w-[140px]">
                        <FiguralRenderer spec={opt.visualSpec as any} />
                      </div>
                    )}
                    <div className="sm:pl-8">
                      <Input
                        placeholder={`Rasional/penjelasan singkat opsi ${opt.optionKey} (opsional)`}
                        value={opt.optionFeedback}
                        onChange={(e) => {
                          const copy = [...options];
                          copy[idx].optionFeedback = e.target.value;
                          setOptions(copy);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold">Konsep & Landasan Utama</label>
                <Textarea rows={2} value={conceptSummary} onChange={(e) => setConceptSummary(e.target.value)} />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold">Pembahasan Lengkap</label>
                <Textarea rows={3} value={explanation} onChange={(e) => setExplanation(e.target.value)} required />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold">Trik Cepat</label>
                  <Input value={quickTrick} onChange={(e) => setQuickTrick(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold">Kesalahan Umum</label>
                  <Input value={commonMistakes} onChange={(e) => setCommonMistakes(e.target.value)} />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" variant="indigo" isLoading={saving}>
                  Simpan Perubahan Soal
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(returnTo)}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export function AiGeneratorPage() {
  const [subjectCode, setSubjectCode] = useState<'TWK' | 'TIU' | 'TKP'>('TWK');
  const [topicSlug, setTopicSlug] = useState('pancasila');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [count, setCount] = useState(2);
  const [generating, setGenerating] = useState(false);
  const [drafts, setDrafts] = useState<Array<{ id: string; code: string; stem: string }>>([]);

  const { data: topics } = useQuery({
    queryKey: ['admin-topics'],
    queryFn: () => apiFetch<Array<{ slug: string; name: string; subject: { code: 'TWK' | 'TIU' | 'TKP' } }>>('/admin/topics'),
  });

  const filteredTopics = (topics || []).filter((t) => t.subject.code === subjectCode);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await apiFetch<Array<{ id: string; code: string; stem: string }>>('/admin/ai-generate', {
        method: 'POST',
        body: JSON.stringify({ subjectCode, topicSlug, difficulty, count }),
      });
      setDrafts(res);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Badge variant="indigo">Alat Bantu Konten AI</Badge>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Generator Draf Soal AI</h1>
          <p className="mt-1 text-sm text-slate-600">
            Soal yang dihasilkan disimpan berstatus <strong>DRAFT</strong> untuk ditinjau editor sebelum publikasi.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleGenerate} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold">Subtes</label>
                <Select
                  value={subjectCode}
                  onChange={(e) => {
                    const next = e.target.value as 'TWK' | 'TIU' | 'TKP';
                    setSubjectCode(next);
                    const ft = (topics || []).find((t) => t.subject.code === next);
                    if (ft) setTopicSlug(ft.slug);
                  }}
                >
                  <option value="TWK">TWK</option>
                  <option value="TIU">TIU</option>
                  <option value="TKP">TKP</option>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Topik</label>
                <Select value={topicSlug} onChange={(e) => setTopicSlug(e.target.value)}>
                  {filteredTopics.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Tingkat Kesulitan</label>
                <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}>
                  <option value="EASY">Mudah</option>
                  <option value="MEDIUM">Sedang</option>
                  <option value="HARD">Sulit</option>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Jumlah Draf (1–5)</label>
                <Input type="number" min={1} max={5} value={count} onChange={(e) => setCount(Number(e.target.value))} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" variant="indigo" isLoading={generating}>
                  <Sparkles className="h-4 w-4" /> Hasilkan Draf Soal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {drafts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Draf Berhasil Dibuat ({drafts.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {drafts.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 text-sm">
                  <div>
                    <Badge variant="warning">{d.code}</Badge>
                    <p className="mt-1 text-slate-800">{d.stem}</p>
                  </div>
                  <Link to={`/admin/questions/${d.id}/edit`}>
                    <Button size="sm" variant="outline">
                      Tinjau & Publikasikan
                    </Button>
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

export function TopicManagementPage() {
  const [subjectFilter, setSubjectFilter] = useState<'ALL' | 'TWK' | 'TIU' | 'TKP'>('ALL');
  const { data: topics, isLoading } = useQuery({
    queryKey: ['admin-topics'],
    queryFn: () =>
      apiFetch<
        Array<{
          id: string;
          slug: string;
          name: string;
          category: string | null;
          description: string;
          subject: { code: string };
          _count: { questions: number };
        }>
      >('/admin/topics'),
  });

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingState label="Memuat topik..." />
      </AppLayout>
    );
  }

  const filteredTopics = (topics || []).filter(
    (t) => subjectFilter === 'ALL' || t.subject.code === subjectFilter,
  );

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manajemen Topik & Kisi-Kisi</h1>
            <p className="mt-1 text-sm text-slate-600">
              Klik salah satu jenis topik untuk melihat, mereview pembahasan, memverifikasi kunci jawaban, atau mengedit soal-soalnya.
            </p>
          </div>
          <div className="flex gap-1.5">
            {(['ALL', 'TWK', 'TIU', 'TKP'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSubjectFilter(s)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold cursor-pointer ${
                  subjectFilter === s
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {s === 'ALL' ? 'Semua' : s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTopics.map((t) => (
            <Link key={t.id} to={`/admin/topics/${t.slug}`} className="group block">
              <Card className="h-full transition-all group-hover:border-indigo-400 group-hover:shadow-md">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="navy">{t.subject.code}</Badge>
                      {t.category && <Badge variant="neutral">{t.category}</Badge>}
                    </div>
                    <p className="mt-1.5 text-sm font-bold text-slate-900 group-hover:text-indigo-700 truncate">
                      {t.name}
                    </p>
                    <p className="text-xs text-slate-500">Slug: {t.slug}</p>
                    <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600">
                      Lihat & review soal <ChevronRight className="h-3.5 w-3.5" />
                    </p>
                  </div>
                  <Badge variant="indigo" className="shrink-0">
                    {t._count.questions} soal
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

interface AdminQuestionFull {
  id: string;
  code: string;
  packageCode?: string;
  stem: string;
  visualSpec?: Record<string, unknown> | null;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isAiGenerated: boolean;
  version: number;
  explanation: string;
  conceptSummary?: string | null;
  stepByStep?: unknown;
  whyOthersWrong?: unknown;
  quickTrick?: string | null;
  commonMistakes?: string | null;
  studyTip?: string | null;
  subject: { code: 'TWK' | 'TIU' | 'TKP'; name?: string };
  topic: { slug: string; name: string; category?: string | null };
  subtopic?: { name: string } | null;
  options: Array<{
    optionKey: string;
    text: string;
    scoreValue: number;
    isCorrect: boolean;
    optionFeedback?: string | null;
    visualSpec?: Record<string, unknown> | null;
  }>;
  references?: Array<{ title: string; source: string; note?: string | null }>;
}

export function TopicQuestionsReviewPage() {
  const { topicSlug } = useParams<{ topicSlug: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [packageFilter, setPackageFilter] = useState('');
  const [diffFilter, setDiffFilter] = useState('');
  const [page, setPage] = useState(1);
  const [reviewQuestion, setReviewQuestion] = useState<AdminQuestionFull | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const { data: topics } = useQuery({
    queryKey: ['admin-topics'],
    queryFn: () =>
      apiFetch<
        Array<{
          id: string;
          slug: string;
          name: string;
          category: string | null;
          description: string;
          subject: { code: 'TWK' | 'TIU' | 'TKP'; name: string };
          _count: { questions: number };
        }>
      >('/admin/topics'),
  });

  const topicInfo = (topics || []).find((t) => t.slug === topicSlug);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-topic-questions', topicSlug, page, statusFilter, packageFilter, diffFilter, search],
    enabled: Boolean(topicSlug),
    queryFn: () =>
      apiFetch<{
        items: AdminQuestionFull[];
        pagination: { page: number; pageSize: number; total: number; totalPages: number };
      }>(
        `/admin/questions?topicSlug=${encodeURIComponent(topicSlug || '')}&page=${page}&pageSize=25&status=${statusFilter}&packageCode=${packageFilter}&difficulty=${diffFilter}&q=${encodeURIComponent(search)}`,
      ),
  });

  const handleQuickStatus = async (qId: string, nextStatus: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED') => {
    setStatusUpdatingId(qId);
    try {
      await apiFetch('/admin/questions/bulk-update', {
        method: 'POST',
        body: JSON.stringify({ ids: [qId], status: nextStatus }),
      });
      await refetch();
      if (reviewQuestion?.id === qId) {
        setReviewQuestion((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDelete = async (qId: string) => {
    if (!confirm('Hapus soal ini secara permanen?')) return;
    await apiFetch(`/admin/questions/${qId}`, { method: 'DELETE' });
    if (reviewQuestion?.id === qId) setReviewQuestion(null);
    await refetch();
  };

  const returnToPath = `/admin/topics/${topicSlug}`;

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link
              to="/admin/topics"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Manajemen Topik & Kisi-Kisi
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {topicInfo && <Badge variant="navy">{topicInfo.subject.code}</Badge>}
              {topicInfo?.category && <Badge variant="neutral">{topicInfo.category}</Badge>}
              <Badge variant="indigo">Total sesuai filter: {data?.pagination.total ?? 0} soal</Badge>
            </div>
            <h1 className="mt-1.5 text-2xl font-bold text-slate-900">
              {topicInfo?.name ?? topicSlug}
            </h1>
            {topicInfo?.description && (
              <p className="mt-1 text-sm text-slate-600">{topicInfo.description}</p>
            )}
          </div>

          <Link
            to={`/admin/questions/new?subject=${topicInfo?.subject.code ?? 'TWK'}&topicSlug=${topicSlug}&returnTo=${encodeURIComponent(returnToPath)}`}
          >
            <Button variant="indigo" size="sm">
              <Plus className="h-4 w-4" /> Tambah Soal di Topik Ini
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="flex flex-wrap gap-3 p-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Cari kode soal atau isi pertanyaan..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Select
              className="w-40"
              value={packageFilter}
              onChange={(e) => {
                setPackageFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Semua Paket</option>
              <option value="PAKET_1">Paket 1</option>
              <option value="PAKET_2">Paket 2</option>
              <option value="PAKET_3">Paket 3</option>
              <option value="PDF_FIGURAL">PDF Figural (90)</option>
            </Select>
            <Select
              className="w-36"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Semua Status</option>
              <option value="PUBLISHED">Terpublikasi</option>
              <option value="DRAFT">Draf</option>
              <option value="ARCHIVED">Arsip</option>
            </Select>
            <Select
              className="w-36"
              value={diffFilter}
              onChange={(e) => {
                setDiffFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Semua Level</option>
              <option value="EASY">Mudah</option>
              <option value="MEDIUM">Sedang</option>
              <option value="HARD">Sulit</option>
            </Select>
          </CardContent>
        </Card>

        {isLoading ? (
          <LoadingState label="Memuat daftar soal topik..." />
        ) : (data?.items ?? []).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-slate-500">
              Tidak ada soal yang sesuai filter pada topik ini.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {(data?.items ?? []).map((q) => {
              const bestOpt =
                q.subject.code === 'TKP'
                  ? [...q.options].sort((a, b) => b.scoreValue - a.scoreValue)[0]
                  : q.options.find((o) => o.isCorrect);

              return (
                <Card key={q.id} className="border-slate-200">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="navy">{q.code}</Badge>
                          {q.packageCode && <Badge variant="indigo">{q.packageCode}</Badge>}
                          <Badge variant="neutral">{q.difficulty}</Badge>
                          <Badge variant={q.status === 'PUBLISHED' ? 'success' : 'warning'}>{q.status}</Badge>
                          {q.subtopic?.name && <Badge variant="neutral">{q.subtopic.name}</Badge>}
                          {bestOpt && (
                            <Badge variant="success">
                              {q.subject.code === 'TKP'
                                ? `Skor 5: ${bestOpt.optionKey}`
                                : `Kunci: ${bestOpt.optionKey}`}
                            </Badge>
                          )}
                          <span className="text-[11px] text-slate-400">v{q.version}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-900 whitespace-pre-line leading-relaxed">
                          {q.stem}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <Button variant="indigo" size="sm" onClick={() => setReviewQuestion(q)}>
                          <Eye className="h-3.5 w-3.5" /> Review
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/questions/${q.id}/edit?returnTo=${encodeURIComponent(returnToPath)}`)
                          }
                        >
                          <Edit3 className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(q.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-red-600" />
                        </Button>
                      </div>
                    </div>

                    {q.visualSpec && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <FiguralRenderer spec={q.visualSpec as any} />
                      </div>
                    )}

                    {/* Compact Options Preview */}
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                      {q.options.map((opt) => {
                        const isBest = q.subject.code === 'TKP' ? opt.scoreValue === 5 : opt.isCorrect;
                        return (
                          <div
                            key={opt.optionKey}
                            className={`rounded-xl border p-2.5 text-xs ${
                              isBest ? 'border-emerald-300 bg-emerald-50/70' : 'border-slate-200 bg-slate-50/40'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                              <span>Opsi {opt.optionKey}</span>
                              {q.subject.code === 'TKP' ? (
                                <span className="text-[11px] text-indigo-700">Skor {opt.scoreValue}</span>
                              ) : isBest ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              ) : null}
                            </div>
                            {opt.visualSpec ? (
                              <div className="max-w-[110px]">
                                <FiguralRenderer spec={opt.visualSpec as any} />
                              </div>
                            ) : (
                              <p className="text-slate-700 line-clamp-3">{opt.text}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {data && data.pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Sebelumnya
            </Button>
            <span className="px-3 py-1.5 text-xs font-medium text-slate-600">
              Halaman {page} dari {data.pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Berikutnya
            </Button>
          </div>
        )}
      </div>

      {/* Full Review Modal */}
      <Modal
        open={Boolean(reviewQuestion)}
        onClose={() => setReviewQuestion(null)}
        title={`Review Soal ${reviewQuestion?.code ?? ''}`}
        maxWidth="max-w-4xl"
      >
        {reviewQuestion && (
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="navy">{reviewQuestion.code}</Badge>
                {reviewQuestion.packageCode && <Badge variant="indigo">{reviewQuestion.packageCode}</Badge>}
                <Badge variant="neutral">{reviewQuestion.difficulty}</Badge>
                <Badge variant={reviewQuestion.status === 'PUBLISHED' ? 'success' : 'warning'}>
                  {reviewQuestion.status}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {reviewQuestion.status !== 'PUBLISHED' && (
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={statusUpdatingId === reviewQuestion.id}
                    onClick={() => handleQuickStatus(reviewQuestion.id, 'PUBLISHED')}
                  >
                    Publikasikan Soal
                  </Button>
                )}
                {reviewQuestion.status === 'PUBLISHED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    isLoading={statusUpdatingId === reviewQuestion.id}
                    onClick={() => handleQuickStatus(reviewQuestion.id, 'DRAFT')}
                  >
                    Jadikan Draf
                  </Button>
                )}
                <Button
                  variant="indigo"
                  size="sm"
                  onClick={() => {
                    const targetId = reviewQuestion.id;
                    setReviewQuestion(null);
                    navigate(`/admin/questions/${targetId}/edit?returnTo=${encodeURIComponent(returnToPath)}`);
                  }}
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit Soal Ini
                </Button>
              </div>
            </div>

            <p className="text-base leading-relaxed text-slate-900 whitespace-pre-line">
              {reviewQuestion.stem}
            </p>
            {reviewQuestion.visualSpec && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <FiguralRenderer spec={reviewQuestion.visualSpec as any} />
              </div>
            )}

            <div className="space-y-2">
              {reviewQuestion.options.map((opt) => {
                const isBest =
                  reviewQuestion.subject.code === 'TKP' ? opt.scoreValue === 5 : opt.isCorrect;
                return (
                  <div
                    key={opt.optionKey}
                    className={`rounded-xl border p-3 text-sm ${
                      isBest ? 'border-emerald-400 bg-emerald-50/70' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <span className="font-bold text-slate-800">{opt.optionKey}.</span>
                        <div>
                          <p className="text-slate-900">{opt.text}</p>
                          {opt.visualSpec && (
                            <div className="mt-2 max-w-[140px]">
                              <FiguralRenderer spec={opt.visualSpec as any} />
                            </div>
                          )}
                          {opt.optionFeedback && (
                            <p className="mt-1 text-xs text-slate-600">{opt.optionFeedback}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant={isBest ? 'success' : 'default'}>
                        Skor {opt.scoreValue}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            <QuestionDiscussionPanel
              questionId={reviewQuestion.id}
              questionCode={reviewQuestion.code}
              subjectCode={reviewQuestion.subject.code}
              topicName={reviewQuestion.topic.name}
              topicSlug={reviewQuestion.topic.slug}
              options={reviewQuestion.options.map((o) => ({
                ...o,
                optionFeedback: o.optionFeedback ?? undefined,
              }))}
              explanation={reviewQuestion.explanation}
              conceptSummary={reviewQuestion.conceptSummary}
              stepByStep={reviewQuestion.stepByStep}
              whyOthersWrong={reviewQuestion.whyOthersWrong}
              quickTrick={reviewQuestion.quickTrick}
              commonMistakes={reviewQuestion.commonMistakes}
              studyTip={reviewQuestion.studyTip}
              references={reviewQuestion.references}
            />
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}

export function UserManagementPage() {
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () =>
      apiFetch<
        Array<{
          id: string;
          name: string;
          email: string;
          role: 'USER' | 'ADMIN';
          profile: { totalXp: number; levelName: string } | null;
          _count: { practiceSessions: number; examSessions: number };
        }>
      >('/admin/users'),
  });

  const toggleRole = async (id: string, current: 'USER' | 'ADMIN') => {
    const next = current === 'ADMIN' ? 'USER' : 'ADMIN';
    await apiFetch(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role: next }),
    });
    await refetch();
  };

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingState label="Memuat data pengguna..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" /> Manajemen Pengguna
        </h1>
        <Card>
          <CardContent className="p-0 divide-y divide-slate-100">
            {(users || []).map((u) => (
              <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {u.name} <Badge variant={u.role === 'ADMIN' ? 'navy' : 'neutral'}>{u.role}</Badge>
                  </p>
                  <p className="text-xs text-slate-500">
                    {u.email} • {u.profile?.totalXp ?? 0} XP ({u.profile?.levelName ?? 'Pemula'}) •{' '}
                    {u._count.practiceSessions} latihan • {u._count.examSessions} simulasi
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => toggleRole(u.id, u.role)}>
                  Ubah ke {u.role === 'ADMIN' ? 'USER' : 'ADMIN'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export function ExamAndScoringConfigPage() {
  const { data: configs, isLoading, refetch } = useQuery({
    queryKey: ['admin-configs'],
    queryFn: () =>
      apiFetch<
        Array<{
          id: string;
          name: string;
          year: number;
          isActive: boolean;
          sourceReference: string;
          durationMinutes: number;
          twkQuestionCount: number;
          tiuQuestionCount: number;
          tkpQuestionCount: number;
          passingGrades: Array<{
            formationType: string;
            twkThreshold: number;
            tiuThreshold: number;
            tkpThreshold: number;
            sourceDocument: string;
          }>;
        }>
      >('/admin/configs'),
  });

  const [name, setName] = useState('Konfigurasi SKD Pembaruan');
  const [year, setYear] = useState(2026);
  const [twkThreshold, setTwkThreshold] = useState(65);
  const [tiuThreshold, setTiuThreshold] = useState(80);
  const [tkpThreshold, setTkpThreshold] = useState(166);
  const [sourceRef, setSourceRef] = useState('KepmenPAN-RB Terbaru (Terverifikasi Admin)');
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/admin/configs', {
        method: 'POST',
        body: JSON.stringify({
          name,
          year,
          sourceReference: sourceRef,
          twkThreshold,
          tiuThreshold,
          tkpThreshold,
          passingSourceDocument: sourceRef,
          isActive: true,
        }),
      });
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="h-5 w-5 text-indigo-600" /> Konfigurasi Ujian & Penilaian Terversi
          </h1>
          <p className="text-sm text-slate-600">
            Atur jumlah soal, bobot skor, durasi, dan nilai ambang batas (passing grade) per tahun seleksi.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Buat & Aktifkan Versi Konfigurasi Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-3">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama konfigurasi" required />
              <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} placeholder="Tahun" required />
              <Input value={sourceRef} onChange={(e) => setSourceRef(e.target.value)} placeholder="Sumber referensi resmi" required />
              <Input type="number" value={twkThreshold} onChange={(e) => setTwkThreshold(Number(e.target.value))} placeholder="Ambang TWK" />
              <Input type="number" value={tiuThreshold} onChange={(e) => setTiuThreshold(Number(e.target.value))} placeholder="Ambang TIU" />
              <Input type="number" value={tkpThreshold} onChange={(e) => setTkpThreshold(Number(e.target.value))} placeholder="Ambang TKP" />
              <div className="sm:col-span-3">
                <Button type="submit" variant="indigo" isLoading={saving}>
                  Simpan & Aktifkan Konfigurasi
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {isLoading ? (
          <LoadingState label="Memuat konfigurasi..." />
        ) : (
          <div className="space-y-3">
            {(configs || []).map((c) => (
              <Card key={c.id}>
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="navy">Tahun {c.year}</Badge>
                      <span className="font-bold text-slate-900">{c.name}</span>
                    </div>
                    <Badge variant={c.isActive ? 'success' : 'neutral'}>
                      {c.isActive ? 'Aktif' : 'Arsip'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">
                    Distribusi: TWK {c.twkQuestionCount} • TIU {c.tiuQuestionCount} • TKP {c.tkpQuestionCount} ({c.durationMinutes} menit)
                  </p>
                  <p className="text-xs text-slate-500">Sumber: {c.sourceReference}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export function QualityReviewPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-quality'],
    queryFn: () =>
      apiFetch<{
        duplicates: Array<{ prefix: string; codes: string[] }>;
        missingExplanations: Array<{ id: string; code: string }>;
        inconsistentKeys: Array<{ id: string; code: string; issue: string }>;
        aiDrafts: Array<{ id: string; code: string; stem: string }>;
        openReports: Array<{ id: string; reason: string; details: string | null; question: { code: string } }>;
      }>('/admin/quality-check'),
  });

  if (isLoading || !data) {
    return (
      <AppLayout>
        <LoadingState label="Menjalankan audit kualitas konten..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Kontrol Kualitas & Tinjauan Konten</h1>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-slate-500">Potensi Duplikat</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{data.duplicates.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-slate-500">Pembahasan Kurang Lengkap</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{data.missingExplanations.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-slate-500">Kunci Jawaban Tidak Konsisten</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{data.inconsistentKeys.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-indigo-600" /> Draf AI Menunggu Tinjauan ({data.aiDrafts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {data.aiDrafts.length === 0 ? (
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Tidak ada draf AI tertunda.
              </p>
            ) : (
              data.aiDrafts.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
                  <span><strong>{d.code}</strong>: {d.stem.slice(0, 120)}...</span>
                  <Link to={`/admin/questions/${d.id}/edit`}>
                    <Button size="sm" variant="outline">Tinjau</Button>
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-600" /> Laporan Pengguna ({data.openReports.length})
            </CardTitle>
            <Link to="/admin/reports">
              <Button size="sm" variant="outline">Kelola Semua Laporan</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {data.openReports.length === 0 ? (
              <p className="text-xs text-slate-500">Tidak ada laporan terbuka.</p>
            ) : (
              data.openReports.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
                  <div>
                    <Badge variant="warning">{r.question.code}</Badge>{' '}
                    <span className="font-semibold">{r.reason}</span> — {r.details}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await apiFetch(`/admin/reports/${r.id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({ status: 'RESOLVED' }),
                      });
                      await refetch();
                    }}
                  >
                    Tandai Selesai
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

type ReportStatus = 'OPEN' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';

interface AdminReportQuestionOption {
  optionKey: string;
  text: string;
  scoreValue: number;
  isCorrect: boolean;
  optionFeedback?: string | null;
  visualSpec?: Record<string, unknown> | null;
}

interface AdminReportItem {
  id: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; email: string };
  question: {
    id: string;
    code: string;
    stem: string;
    status: string;
    visualSpec?: Record<string, unknown> | null;
    explanation: string;
    conceptSummary?: string | null;
    stepByStep?: unknown;
    whyOthersWrong?: unknown;
    quickTrick?: string | null;
    commonMistakes?: string | null;
    studyTip?: string | null;
    subject: { code: 'TWK' | 'TIU' | 'TKP'; name: string };
    topic: { id: string; name: string; slug: string };
    subtopic?: { name: string } | null;
    options: AdminReportQuestionOption[];
    references?: Array<{ title: string; source: string; note?: string | null }>;
  };
}

const REPORT_STATUS_META: Record<
  ReportStatus,
  { label: string; badge: 'warning' | 'indigo' | 'success' | 'neutral' }
> = {
  OPEN: { label: 'Terbuka', badge: 'warning' },
  REVIEWED: { label: 'Ditinjau', badge: 'indigo' },
  RESOLVED: { label: 'Selesai', badge: 'success' },
  DISMISSED: { label: 'Diabaikan', badge: 'neutral' },
};

export function ReportManagementPage() {
  const [statusFilter, setStatusFilter] = useState<'ALL' | ReportStatus>('OPEN');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [previewReport, setPreviewReport] = useState<AdminReportItem | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-reports', statusFilter, subjectFilter, search, page],
    queryFn: () =>
      apiFetch<{
        items: AdminReportItem[];
        counts: { ALL: number; OPEN: number; REVIEWED: number; RESOLVED: number; DISMISSED: number };
        pagination: { page: number; pageSize: number; total: number; totalPages: number };
      }>(
        `/admin/reports?status=${encodeURIComponent(statusFilter)}&subjectCode=${encodeURIComponent(
          subjectFilter,
        )}&q=${encodeURIComponent(search)}&page=${page}&pageSize=20`,
      ),
  });

  const handleUpdateStatus = async (reportId: string, nextStatus: ReportStatus) => {
    setUpdatingId(reportId);
    try {
      await apiFetch(`/admin/reports/${reportId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      if (previewReport?.id === reportId) {
        setPreviewReport({ ...previewReport, status: nextStatus });
      }
      await refetch();
    } finally {
      setUpdatingId(null);
    }
  };

  const counts = data?.counts ?? { ALL: 0, OPEN: 0, REVIEWED: 0, RESOLVED: 0, DISMISSED: 0 };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge variant="navy">
              <Flag className="h-3 w-3" /> Moderasi & Validasi Bank Soal
            </Badge>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Laporan Kesalahan Soal</h1>
            <p className="mt-1 text-sm text-slate-600">
              Kelola laporan kesalahan soal dari peserta, tinjau isi soal beserta kunci jawabannya, dan perbaiki langsung.
            </p>
          </div>
          <Link to="/admin/questions">
            <Button variant="outline" size="sm">Kelola Bank Soal</Button>
          </Link>
        </div>

        {/* Status Summary Cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { key: 'OPEN' as const, label: 'Perlu Ditindaklanjuti', value: counts.OPEN, tone: 'text-amber-700' },
            { key: 'REVIEWED' as const, label: 'Sedang Ditinjau', value: counts.REVIEWED, tone: 'text-indigo-700' },
            { key: 'RESOLVED' as const, label: 'Selesai Diperbaiki', value: counts.RESOLVED, tone: 'text-emerald-700' },
            { key: 'DISMISSED' as const, label: 'Diabaikan', value: counts.DISMISSED, tone: 'text-slate-600' },
          ].map((stat) => (
            <button
              key={stat.key}
              type="button"
              onClick={() => {
                setStatusFilter(stat.key);
                setPage(1);
              }}
              className={`text-left rounded-2xl border bg-white p-4 transition-all cursor-pointer ${
                statusFilter === stat.key
                  ? 'border-indigo-500 ring-2 ring-indigo-500/15'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className="text-xs font-medium text-slate-500">{stat.label}</p>
              <p className={`mt-1 text-2xl font-bold ${stat.tone}`}>{stat.value}</p>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap gap-1.5">
            {(['OPEN', 'REVIEWED', 'RESOLVED', 'DISMISSED', 'ALL'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? `Semua (${counts.ALL})` : `${REPORT_STATUS_META[st].label} (${counts[st]})`}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value);
                setPage(1);
              }}
              className="w-32 h-9 text-xs"
            >
              <option value="">Semua Subtes</option>
              <option value="TWK">TWK</option>
              <option value="TIU">TIU</option>
              <option value="TKP">TKP</option>
            </Select>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari kode soal, alasan, pelapor..."
                className="pl-9 h-9 w-60 text-xs"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <LoadingState label="Memuat daftar laporan soal..." />
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            title="Tidak ada laporan pada filter ini"
            description="Semua laporan pada kategori ini sudah ditangani atau belum ada laporan masuk."
          />
        ) : (
          <div className="space-y-4">
            {data.items.map((r) => {
              const meta = REPORT_STATUS_META[r.status] ?? { label: r.status, badge: 'neutral' as const };
              return (
                <Card key={r.id}>
                  <CardContent className="p-5 space-y-3.5">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={meta.badge}>{meta.label}</Badge>
                          <Badge variant="navy">{r.question.subject.code}</Badge>
                          <Badge variant="indigo">{r.question.topic.name}</Badge>
                          <Badge variant="neutral">{r.question.code}</Badge>
                          <Badge variant={r.question.status === 'PUBLISHED' ? 'success' : 'warning'}>
                            {r.question.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500">
                          Dilaporkan oleh <strong className="text-slate-700">{r.user.name}</strong> ({r.user.email}) •{' '}
                          {new Date(r.createdAt).toLocaleString('id-ID')}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => setPreviewReport(r)}>
                          <Eye className="h-3.5 w-3.5" /> Tinjau Soal
                        </Button>
                        <Link to={`/admin/questions/${r.question.id}/edit?returnTo=/admin/reports`}>
                          <Button size="sm" variant="secondary">
                            <Edit3 className="h-3.5 w-3.5" /> Edit Soal
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <div className="rounded-xl bg-rose-50/60 border border-rose-200/80 p-3.5 space-y-1">
                      <p className="text-xs font-bold text-rose-900">Alasan: {r.reason}</p>
                      <p className="text-xs text-rose-800">
                        {r.details || <span className="italic text-rose-600">Tidak ada keterangan tambahan dari pelapor.</span>}
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 line-clamp-2">{r.question.stem}</p>

                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                      {r.status !== 'REVIEWED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updatingId === r.id}
                          onClick={() => handleUpdateStatus(r.id, 'REVIEWED')}
                        >
                          Tandai Ditinjau
                        </Button>
                      )}
                      {r.status !== 'DISMISSED' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={updatingId === r.id}
                          onClick={() => handleUpdateStatus(r.id, 'DISMISSED')}
                        >
                          Abaikan
                        </Button>
                      )}
                      {r.status !== 'RESOLVED' && (
                        <Button
                          size="sm"
                          variant="indigo"
                          disabled={updatingId === r.id}
                          onClick={() => handleUpdateStatus(r.id, 'RESOLVED')}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Tandai Selesai
                        </Button>
                      )}
                      {(r.status === 'RESOLVED' || r.status === 'DISMISSED') && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updatingId === r.id}
                          onClick={() => handleUpdateStatus(r.id, 'OPEN')}
                        >
                          Buka Kembali
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                <span>
                  Halaman {data.pagination.page} dari {data.pagination.totalPages} ({data.pagination.total} laporan)
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page >= data.pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Berikutnya
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Question Preview Modal */}
        <Modal
          open={Boolean(previewReport)}
          onClose={() => setPreviewReport(null)}
          title={previewReport ? `Tinjau Laporan • ${previewReport.question.code}` : 'Tinjau Laporan'}
          maxWidth="max-w-3xl"
        >
          {previewReport && (
            <div className="space-y-4">
              <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 text-xs space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-rose-900">{previewReport.reason}</span>
                  <Badge variant={REPORT_STATUS_META[previewReport.status].badge}>
                    {REPORT_STATUS_META[previewReport.status].label}
                  </Badge>
                </div>
                {previewReport.details && <p className="text-rose-800">{previewReport.details}</p>}
                <p className="text-[11px] text-rose-700">
                  Pelapor: {previewReport.user.name} ({previewReport.user.email})
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="navy">{previewReport.question.subject.code}</Badge>
                  <Badge variant="indigo">{previewReport.question.topic.name}</Badge>
                  {previewReport.question.subtopic?.name && (
                    <Badge variant="neutral">{previewReport.question.subtopic.name}</Badge>
                  )}
                </div>
                <p className="text-sm font-medium leading-relaxed text-slate-900">
                  {previewReport.question.stem}
                </p>
                {previewReport.question.visualSpec && (
                  <FiguralRenderer spec={previewReport.question.visualSpec} />
                )}
              </div>

              <div className="space-y-2">
                {previewReport.question.options.map((opt) => (
                  <div
                    key={opt.optionKey}
                    className={`rounded-xl border p-3 text-xs space-y-1 ${
                      opt.isCorrect
                        ? 'border-emerald-300 bg-emerald-50/60'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span>Opsi {opt.optionKey}</span>
                      <Badge variant={opt.isCorrect ? 'success' : 'neutral'}>
                        {previewReport.question.subject.code === 'TKP'
                          ? `${opt.scoreValue} poin`
                          : opt.isCorrect
                            ? 'Benar (+5)'
                            : '0 poin'}
                      </Badge>
                    </div>
                    {opt.visualSpec && <FiguralRenderer spec={opt.visualSpec} compact />}
                    <p className="text-slate-700">{opt.text}</p>
                  </div>
                ))}
              </div>

              <QuestionDiscussionPanel
                questionId={previewReport.question.id}
                questionCode={previewReport.question.code}
                subjectCode={previewReport.question.subject.code}
                topicName={previewReport.question.topic.name}
                topicSlug={previewReport.question.topic.slug}
                options={previewReport.question.options.map((o) => ({
                  optionKey: o.optionKey,
                  text: o.text,
                  scoreValue: o.scoreValue,
                  isCorrect: o.isCorrect,
                  optionFeedback: o.optionFeedback ?? undefined,
                }))}
                explanation={previewReport.question.explanation}
                conceptSummary={previewReport.question.conceptSummary}
                stepByStep={previewReport.question.stepByStep}
                whyOthersWrong={previewReport.question.whyOthersWrong}
                quickTrick={previewReport.question.quickTrick}
                commonMistakes={previewReport.question.commonMistakes}
                studyTip={previewReport.question.studyTip}
                references={previewReport.question.references}
              />

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <Link to={`/admin/questions/${previewReport.question.id}/edit?returnTo=/admin/reports`}>
                  <Button size="sm" variant="secondary">
                    <Edit3 className="h-3.5 w-3.5" /> Edit Soal Ini
                  </Button>
                </Link>
                <div className="flex flex-wrap gap-2">
                  {previewReport.status !== 'DISMISSED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updatingId === previewReport.id}
                      onClick={() => handleUpdateStatus(previewReport.id, 'DISMISSED')}
                    >
                      Abaikan
                    </Button>
                  )}
                  {previewReport.status !== 'RESOLVED' && (
                    <Button
                      size="sm"
                      variant="indigo"
                      disabled={updatingId === previewReport.id}
                      onClick={() => handleUpdateStatus(previewReport.id, 'RESOLVED')}
                    >
                      Tandai Selesai
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
}

interface AdminSubscriptionsPayload {
  summary: {
    activeProCount: number;
    pendingOrdersCount: number;
    paidOrdersCount: number;
    totalRevenueIdr: number;
  };
  plans: Array<{
    id: string;
    code: string;
    name: string;
    priceIdr: number;
    originalIdr: number | null;
    durationDays: number;
    isActive: boolean;
  }>;
  orders: Array<{
    id: string;
    orderCode: string;
    amountIdr: number;
    paymentMethod: string;
    status: 'PENDING' | 'PAID' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
    paymentProofNote: string | null;
    rejectionReason: string | null;
    createdAt: string;
    user: { id: string; name: string; email: string };
    plan: { id: string; code: string; name: string; durationDays: number };
    verifiedBy?: { id: string; name: string } | null;
  }>;
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    isPro: boolean;
    activeSubscription: {
      id: string;
      expiresAt: string;
      source: string;
      plan: { name: string; code: string };
    } | null;
  }>;
}

export function SubscriptionManagementPage() {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'PAID' | 'REJECTED'>('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [grantDays, setGrantDays] = useState(30);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planPriceDraft, setPlanPriceDraft] = useState(29000);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-subscriptions', statusFilter, userSearch],
    queryFn: () =>
      apiFetch<AdminSubscriptionsPayload>(
        `/admin/subscriptions?status=${statusFilter}&q=${encodeURIComponent(userSearch)}`,
      ),
  });

  const formatIdr = (v: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);

  const handleOrderAction = async (orderId: string, action: 'APPROVE' | 'REJECT') => {
    setBusyId(orderId);
    setNotice(null);
    try {
      await apiFetch(`/admin/subscriptions/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          action,
          ...(action === 'REJECT' ? { rejectionReason: 'Bukti pembayaran belum valid.' } : {}),
        }),
      });
      await refetch();
      setNotice(action === 'APPROVE' ? 'Order disetujui dan Nippia Pro diaktifkan.' : 'Order ditolak.');
    } finally {
      setBusyId(null);
    }
  };

  const handleGrantPro = async (userId: string) => {
    setBusyId(userId);
    setNotice(null);
    try {
      await apiFetch('/admin/subscriptions/grant', {
        method: 'POST',
        body: JSON.stringify({ userId, durationDays: grantDays }),
      });
      await refetch();
      setNotice(`Berhasil mengaktifkan / memperpanjang Nippia Pro (${grantDays} hari).`);
    } finally {
      setBusyId(null);
    }
  };

  const handleRevokePro = async (userId: string) => {
    setBusyId(userId);
    setNotice(null);
    try {
      await apiFetch('/admin/subscriptions/revoke', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
      await refetch();
      setNotice('Status langganan Pro pengguna dinonaktifkan.');
    } finally {
      setBusyId(null);
    }
  };

  const handleSavePlanPrice = async (planId: string) => {
    setBusyId(planId);
    try {
      await apiFetch(`/admin/subscriptions/plans/${planId}`, {
        method: 'PATCH',
        body: JSON.stringify({ priceIdr: planPriceDraft }),
      });
      setEditingPlanId(null);
      await refetch();
      setNotice('Harga paket berhasil diperbarui.');
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading || !data) {
    return (
      <AppLayout>
        <LoadingState label="Memuat data langganan & transaksi Pro..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge variant="navy">
              <Crown className="h-3 w-3 text-amber-400" /> Billing & Langganan Pro
            </Badge>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Kelola Langganan & Order Pro</h1>
            <p className="mt-1 text-sm text-slate-600">
              Verifikasi pembayaran manual, atur harga paket, serta aktivasi atau cabut akses Nippia Pro pengguna.
            </p>
          </div>
        </div>

        {notice && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-900">
            {notice}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500">Pelanggan Pro Aktif</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{data.summary.activeProCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500">Order Pending</p>
              <p className="mt-1 text-2xl font-extrabold text-amber-600">{data.summary.pendingOrdersCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500">Order Lunas (PAID)</p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-700">{data.summary.paidOrdersCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500">Total Pendapatan</p>
              <p className="mt-1 text-2xl font-extrabold text-indigo-700">
                {formatIdr(data.summary.totalRevenueIdr)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Plans Config */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daftar Paket Langganan</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {data.plans.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{p.name}</span>
                    <Badge variant="neutral">{p.durationDays} hari</Badge>
                  </div>
                  <p className="mt-1 text-lg font-extrabold text-indigo-700">{formatIdr(p.priceIdr)}</p>
                </div>
                {editingPlanId === p.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="w-28 h-8"
                      value={planPriceDraft}
                      onChange={(e) => setPlanPriceDraft(Number(e.target.value))}
                    />
                    <Button size="sm" variant="indigo" onClick={() => handleSavePlanPrice(p.id)}>
                      Simpan
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingPlanId(null)}>
                      Batal
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingPlanId(p.id);
                      setPlanPriceDraft(p.priceIdr);
                    }}
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Ubah Harga
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Order Verification Table */}
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">Daftar Order Langganan</CardTitle>
            <div className="flex gap-1.5">
              {(['ALL', 'PENDING', 'PAID', 'REJECTED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold cursor-pointer ${
                    statusFilter === st ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {data.orders.length === 0 ? (
              <EmptyState title="Belum ada transaksi" description="Order langganan akan tampil di sini." />
            ) : (
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-2.5 pr-4">Kode</th>
                    <th className="py-2.5 pr-4">Pengguna</th>
                    <th className="py-2.5 pr-4">Paket & Nominal</th>
                    <th className="py-2.5 pr-4">Metode & Bukti</th>
                    <th className="py-2.5 pr-4">Status</th>
                    <th className="py-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.orders.map((ord) => (
                    <tr key={ord.id}>
                      <td className="py-3 pr-4 font-mono text-xs font-bold">{ord.orderCode}</td>
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-slate-900">{ord.user.name}</p>
                        <p className="text-xs text-slate-500">{ord.user.email}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-slate-800">{ord.plan.name}</p>
                        <p className="text-xs text-indigo-700 font-bold">{formatIdr(ord.amountIdr)}</p>
                      </td>
                      <td className="py-3 pr-4 text-xs">
                        <p className="font-semibold text-slate-700">{ord.paymentMethod}</p>
                        {ord.paymentProofNote && (
                          <p className="mt-0.5 text-slate-500 max-w-xs truncate" title={ord.paymentProofNote}>
                            {ord.paymentProofNote}
                          </p>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={
                            ord.status === 'PAID'
                              ? 'success'
                              : ord.status === 'PENDING'
                                ? 'warning'
                                : ord.status === 'REJECTED'
                                  ? 'danger'
                                  : 'neutral'
                          }
                        >
                          {ord.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        {ord.status === 'PENDING' && (
                          <div className="flex justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="indigo"
                              isLoading={busyId === ord.id}
                              onClick={() => handleOrderAction(ord.id, 'APPROVE')}
                            >
                              Setujui & Aktifkan
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              isLoading={busyId === ord.id}
                              onClick={() => handleOrderAction(ord.id, 'REJECT')}
                            >
                              Tolak
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Manual Grant / Revoke Pro per User */}
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">Aktivasi / Pencabutan Pro Pengguna Manual</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  className="pl-8 h-9 w-56"
                  placeholder="Cari nama atau email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-600">Durasi Grant:</span>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  className="w-20 h-9"
                  value={grantDays}
                  onChange={(e) => setGrantDays(Number(e.target.value))}
                />
                <span className="text-slate-500">hari</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-2.5 pr-4">Pengguna</th>
                  <th className="py-2.5 pr-4">Role</th>
                  <th className="py-2.5 pr-4">Status Paket</th>
                  <th className="py-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.users.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-slate-900">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant="neutral">{u.role}</Badge>
                    </td>
                    <td className="py-3 pr-4">
                      {u.isPro ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <ProBadge size="xs" />
                          {u.activeSubscription && (
                            <span className="text-xs text-slate-500">
                              s/d{' '}
                              {new Date(u.activeSubscription.expiresAt).toLocaleDateString('id-ID', {
                                dateStyle: 'medium',
                              })}
                            </span>
                          )}
                        </div>
                      ) : (
                        <Badge variant="neutral">FREE</Badge>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {u.role !== 'ADMIN' && (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="indigo"
                            isLoading={busyId === u.id}
                            onClick={() => handleGrantPro(u.id)}
                          >
                            {u.isPro ? `Perpanjang +${grantDays}h` : `Aktifkan Pro ${grantDays}h`}
                          </Button>
                          {u.isPro && (
                            <Button
                              size="sm"
                              variant="outline"
                              isLoading={busyId === u.id}
                              onClick={() => handleRevokePro(u.id)}
                            >
                              Cabut Pro
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
