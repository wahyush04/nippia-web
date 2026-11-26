import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Edit3,
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
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
          <div className="flex gap-2">
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
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: topics } = useQuery({
    queryKey: ['admin-topics'],
    queryFn: () => apiFetch<Array<{ slug: string; name: string; subject: { code: 'TWK' | 'TIU' | 'TKP' } }>>('/admin/topics'),
  });

  const { data: existingList } = useQuery({
    queryKey: ['admin-question-single', id],
    enabled: isEdit,
    queryFn: () =>
      apiFetch<{ items: Array<Record<string, unknown>> }>(`/admin/questions?pageSize=100`),
  });

  const [subjectCode, setSubjectCode] = useState<'TWK' | 'TIU' | 'TKP'>('TWK');
  const [topicSlug, setTopicSlug] = useState('pancasila');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('PUBLISHED');
  const [stem, setStem] = useState('');
  const [explanation, setExplanation] = useState('');
  const [quickTrick, setQuickTrick] = useState('');
  const [options, setOptions] = useState([
    { optionKey: 'A' as const, text: '', scoreValue: 5, isCorrect: true, optionFeedback: '' },
    { optionKey: 'B' as const, text: '', scoreValue: 0, isCorrect: false, optionFeedback: '' },
    { optionKey: 'C' as const, text: '', scoreValue: 0, isCorrect: false, optionFeedback: '' },
    { optionKey: 'D' as const, text: '', scoreValue: 0, isCorrect: false, optionFeedback: '' },
    { optionKey: 'E' as const, text: '', scoreValue: 0, isCorrect: false, optionFeedback: '' },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit || !existingList) return;
    const found = existingList.items.find((x) => x.id === id) as {
      subject?: { code: 'TWK' | 'TIU' | 'TKP' };
      topic?: { slug: string };
      difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
      status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
      stem?: string;
      explanation?: string;
      quickTrick?: string;
      options?: typeof options;
    } | undefined;
    if (found) {
      if (found.subject?.code) setSubjectCode(found.subject.code);
      if (found.topic?.slug) setTopicSlug(found.topic.slug);
      if (found.difficulty) setDifficulty(found.difficulty);
      if (found.status) setStatus(found.status);
      if (found.stem) setStem(found.stem);
      if (found.explanation) setExplanation(found.explanation);
      if (found.quickTrick) setQuickTrick(found.quickTrick);
      if (found.options && found.options.length === 5) {
        setOptions(
          found.options.map((o) => ({
            optionKey: o.optionKey,
            text: o.text,
            scoreValue: o.scoreValue,
            isCorrect: o.isCorrect,
            optionFeedback: o.optionFeedback || '',
          })),
        );
      }
    }
  }, [isEdit, existingList, id]);

  const filteredTopics = (topics || []).filter((t) => t.subject.code === subjectCode);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        subjectCode,
        topicSlug,
        difficulty,
        status,
        stem,
        explanation,
        quickTrick,
        options,
      };
      if (isEdit) {
        await apiFetch(`/admin/questions/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/admin/questions', { method: 'POST', body: JSON.stringify(payload) });
      }
      navigate('/admin/questions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {isEdit ? 'Edit Soal & Pembahasan' : 'Buat Soal Baru'}
        </h1>
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
                <Textarea value={stem} onChange={(e) => setStem(e.target.value)} required />
              </div>

              <div className="space-y-2.5">
                <label className="block text-xs font-semibold">Pilihan Jawaban (A–E) & Bobot Skor</label>
                {options.map((opt, idx) => (
                  <div key={opt.optionKey} className="grid gap-2 sm:grid-cols-12 items-center">
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
                    <label className="sm:col-span-2 flex items-center gap-1.5 text-xs">
                      <input
                        type="checkbox"
                        checked={opt.isCorrect}
                        onChange={(e) => {
                          const copy = [...options];
                          copy[idx].isCorrect = e.target.checked;
                          setOptions(copy);
                        }}
                      />
                      Terbaik
                    </label>
                  </div>
                ))}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold">Pembahasan Lengkap</label>
                <Textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} required />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold">Trik Cepat</label>
                <Input value={quickTrick} onChange={(e) => setQuickTrick(e.target.value)} />
              </div>

              <div className="flex gap-2">
                <Button type="submit" variant="indigo" isLoading={saving}>
                  Simpan Soal
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/admin/questions')}>
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
  const { data: topics, isLoading } = useQuery({
    queryKey: ['admin-topics'],
    queryFn: () =>
      apiFetch<
        Array<{
          id: string;
          slug: string;
          name: string;
          category: string | null;
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

  return (
    <AppLayout>
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-slate-900">Manajemen Topik & Kisi-Kisi</h1>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(topics || []).map((t) => (
            <Card key={t.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="navy">{t.subject.code}</Badge>
                    {t.category && <Badge variant="neutral">{t.category}</Badge>}
                  </div>
                  <p className="mt-1.5 text-sm font-bold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">Slug: {t.slug}</p>
                </div>
                <Badge variant="indigo">{t._count.questions} soal</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-600" /> Laporan Pengguna ({data.openReports.length})
            </CardTitle>
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
