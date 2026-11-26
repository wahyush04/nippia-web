import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BookMarked,
  BookOpen,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Play,
  RotateCw,
  Search,
  Send,
  Sparkles,
} from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { AppLayout } from '../../components/layout/AppLayout';
import { MarkdownView } from '../../components/ui/MarkdownView';
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
  Textarea,
} from '../../components/ui';

export function AiTutorPage() {
  const [searchParams] = useSearchParams();
  const contextQuestionId = searchParams.get('questionId') ?? undefined;
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messageInput, setMessageInput] = useState(
    contextQuestionId ? 'Tolong jelaskan soal ini dengan bahasa yang lebih sederhana dan tunjukkan trik cepatnya.' : '',
  );
  const [sending, setSending] = useState(false);

  const { data: convs, isLoading, refetch } = useQuery({
    queryKey: ['ai-conversations'],
    queryFn: () =>
      apiFetch<
        Array<{
          id: string;
          title: string;
          contextId: string | null;
          messages: Array<{ id: string; role: string; content: string; citations?: Array<{ label: string; source: string }> }>;
        }>
      >('/analytics/ai/conversations'),
  });

  const activeConv = convs?.find((c) => c.id === conversationId) ?? convs?.[0];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || sending) return;
    setSending(true);
    try {
      const res = await apiFetch<{ conversationId: string }>('/analytics/ai/ask', {
        method: 'POST',
        body: JSON.stringify({
          message: messageInput.trim(),
          conversationId: activeConv?.id && !contextQuestionId ? activeConv.id : conversationId,
          questionId: contextQuestionId,
        }),
      });
      setConversationId(res.conversationId);
      setMessageInput('');
      await refetch();
    } finally {
      setSending(false);
    }
  };

  return (
    <AppLayout>
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bot className="h-4 w-4 text-indigo-600" />
                Riwayat Tutor AI
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setConversationId(undefined);
                  setMessageInput('');
                }}
              >
                Obrolan Baru
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="rounded-xl bg-indigo-50 p-3 text-xs text-indigo-950">
                <p className="font-semibold">Tutor AI Terpandu Sumber Platform</p>
                <p className="mt-1">
                  Menggunakan bank soal & materi terverifikasi Nippia sebagai sumber utama tanpa mengarang regulasi.
                </p>
              </div>
              <div className="space-y-1.5 pt-2">
                {(convs || []).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setConversationId(c.id)}
                    className={`w-full rounded-xl border p-2.5 text-left text-xs cursor-pointer ${
                      activeConv?.id === c.id
                        ? 'border-indigo-500 bg-indigo-50/70 font-semibold text-indigo-900'
                        : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <p className="truncate">{c.title}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{c.messages.length} pesan</p>
                  </button>
                ))}
              </div>
              <div className="pt-2 space-y-1.5">
                <p className="text-[11px] font-semibold uppercase text-slate-400">Contoh Pertanyaan:</p>
                {[
                  'Apa kelemahan belajar saya saat ini?',
                  'Jelaskan aturan silogisme dan kontraposisi',
                  'Ringkas pasal kunci UUD 1945',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setMessageInput(prompt)}
                    className="block w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-left text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-8 flex flex-col min-h-[540px]">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Asisten Belajar Pribadi SKD Master
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between p-5 space-y-4">
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[420px] pr-1">
              {isLoading ? (
                <LoadingState label="Memuat percakapan..." />
              ) : !activeConv || activeConv.messages.length === 0 ? (
                <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-600">
                  Tanyakan konsep TWK, rumus TIU, strategi TKP, atau minta evaluasi kelemahan Anda.
                </div>
              ) : (
                activeConv.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-2xl p-4 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'ml-8 bg-slate-900 text-white whitespace-pre-wrap'
                        : 'mr-4 border border-slate-200 bg-slate-50 text-slate-800'
                    }`}
                  >
                    {m.role === 'user' ? (
                      <p>{m.content}</p>
                    ) : (
                      <MarkdownView content={m.content} />
                    )}
                    {m.citations && m.citations.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-200 pt-2">
                        {m.citations.map((cit, i) => (
                          <Badge key={i} variant="neutral">
                            {cit.label} • {cit.source}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSend} className="flex gap-2 border-t border-slate-100 pt-3">
              <Input
                placeholder="Tulis pertanyaan Anda kepada Tutor AI..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <Button type="submit" variant="indigo" isLoading={sending}>
                <Send className="h-4 w-4" />
                Kirim
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export function StudyPlannerPage() {
  const [dailyMinutes, setDailyMinutes] = useState(45);
  const [targetScore, setTargetScore] = useState(400);
  const [generating, setGenerating] = useState(false);

  const { data: plan, isLoading, refetch } = useQuery({
    queryKey: ['study-planner'],
    queryFn: () =>
      apiFetch<{
        id: string;
        title: string;
        dailyMinutes: number;
        targetScore: number;
        tasks: Array<{
          id: string;
          scheduledDate: string;
          dayLabel: string;
          taskType: string;
          subjectCode: string | null;
          title: string;
          description: string;
          questionCount: number;
          isCompleted: boolean;
        }>;
      }>('/analytics/planner'),
  });

  const handleRegenerate = async () => {
    setGenerating(true);
    try {
      await apiFetch('/analytics/planner/generate', {
        method: 'POST',
        body: JSON.stringify({ dailyMinutes, targetScore }),
      });
      await refetch();
    } finally {
      setGenerating(false);
    }
  };

  const toggleTask = async (taskId: string, isCompleted: boolean) => {
    await apiFetch(`/analytics/planner/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ isCompleted: !isCompleted }),
    });
    await refetch();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge variant="indigo">Jadwal Belajar Adaptif</Badge>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Perencana Belajar Cerdas</h1>
            <p className="mt-1 text-sm text-slate-600">
              Jadwal otomatis 14 hari yang menyesuaikan prioritas topik terlemah dan milestone simulasi CAT.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3">
            <Input
              type="number"
              className="w-24 h-9"
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(Number(e.target.value))}
              title="Menit per hari"
            />
            <span className="text-xs text-slate-500">mnt/hari</span>
            <Input
              type="number"
              className="w-24 h-9"
              value={targetScore}
              onChange={(e) => setTargetScore(Number(e.target.value))}
              title="Target skor"
            />
            <Button variant="indigo" size="sm" onClick={handleRegenerate} isLoading={generating}>
              Susun Ulang Jadwal
            </Button>
          </div>
        </div>

        {isLoading ? (
          <LoadingState label="Memuat jadwal belajar..." />
        ) : !plan ? (
          <EmptyState title="Belum Ada Rencana Belajar" description="Klik Susun Ulang Jadwal untuk membuat rencana." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {plan.tasks.map((t) => (
              <Card key={t.id} className={t.isCompleted ? 'opacity-70 bg-slate-50' : ''}>
                <CardContent className="flex items-start justify-between gap-3 p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="indigo">
                        <CalendarDays className="h-3 w-3" /> {t.dayLabel}, {t.scheduledDate}
                      </Badge>
                      {t.subjectCode && <Badge variant="navy">{t.subjectCode}</Badge>}
                    </div>
                    <h3 className={`text-sm font-bold text-slate-900 ${t.isCompleted ? 'line-through' : ''}`}>
                      {t.title}
                    </h3>
                    <p className="text-xs text-slate-600">{t.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleTask(t.id, t.isCompleted)}
                    className={`rounded-xl border p-2 cursor-pointer ${
                      t.isCompleted
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export function ErrorNotebookPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'active' | 'mastered'>('active');
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [startingReview, setStartingReview] = useState(false);

  const { data: items, isLoading, refetch } = useQuery({
    queryKey: ['error-notebook', filter],
    queryFn: () =>
      apiFetch<
        Array<{
          id: string;
          lastSelectedKey: string | null;
          wrongCount: number;
          reviewStage: number;
          isMastered: boolean;
          personalNote: string | null;
          nextReviewAt: string;
          question: {
            id: string;
            code: string;
            stem: string;
            explanation: string;
            subject: { code: string };
            topic: { name: string };
            options: Array<{ optionKey: string; text: string; isCorrect: boolean; scoreValue: number }>;
          };
        }>
      >(`/practice/error-notebook?status=${filter}`),
  });

  const handleSaveNote = async (id: string) => {
    await apiFetch(`/practice/error-notebook/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ personalNote: noteDrafts[id] ?? '' }),
    });
    await refetch();
  };

  const handleToggleMastered = async (id: string, isMastered: boolean) => {
    await apiFetch(`/practice/error-notebook/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isMastered: !isMastered }),
    });
    await refetch();
  };

  const handlePracticeErrors = async () => {
    setStartingReview(true);
    try {
      const res = await apiFetch<{ sessionId: string }>('/practice/error-review/start', {
        method: 'POST',
      });
      navigate(`/practice/session/${res.sessionId}`);
    } finally {
      setStartingReview(false);
    }
  };

  const stages = ['H+1', 'H+3', 'H+7', 'H+14'];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge variant="indigo">Spaced Repetition (1 • 3 • 7 • 14 Hari)</Badge>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Buku Kesalahan</h1>
            <p className="mt-1 text-sm text-slate-600">
              Soal yang pernah keliru otomatis dicatat agar dapat Anda ulang hingga benar-benar dikuasai.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="indigo" onClick={handlePracticeErrors} isLoading={startingReview}>
              <Play className="h-4 w-4" /> Latih Ulang Soal Salah
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          {[
            { id: 'active' as const, label: 'Perlu Diulang' },
            { id: 'mastered' as const, label: 'Sudah Dikuasai' },
            { id: 'all' as const, label: 'Semua' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold cursor-pointer ${
                filter === tab.id ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <LoadingState label="Memuat catatan kesalahan..." />
        ) : !items || items.length === 0 ? (
          <EmptyState
            title="Buku Kesalahan Bersih!"
            description="Belum ada soal pada filter ini. Teruskan latihan atau simulasi Anda."
          />
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const correctOpt = item.question.options.find((o) => o.isCorrect);
              return (
                <Card key={item.id}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="navy">{item.question.subject.code}</Badge>
                        <Badge variant="indigo">{item.question.topic.name}</Badge>
                        <Badge variant="warning">Salah {item.wrongCount}× • Tahap {stages[Math.min(item.reviewStage, 3)]}</Badge>
                      </div>
                      <Button
                        size="sm"
                        variant={item.isMastered ? 'secondary' : 'outline'}
                        onClick={() => handleToggleMastered(item.id, item.isMastered)}
                      >
                        {item.isMastered ? 'Tandai Perlu Ulang' : 'Tandai Sudah Dikuasai'}
                      </Button>
                    </div>
                    <p className="text-sm font-medium text-slate-900">{item.question.stem}</p>
                    <div className="rounded-xl bg-emerald-50/60 border border-emerald-200 p-3 text-xs text-emerald-950">
                      <p className="font-semibold">
                        Pilihan Terakhir: {item.lastSelectedKey || '-'} | Jawaban Terbaik:{' '}
                        {correctOpt?.optionKey} — {correctOpt?.text}
                      </p>
                      <p className="mt-1">{item.question.explanation}</p>
                    </div>
                    <div className="flex gap-2">
                      <Textarea
                        rows={2}
                        className="min-h-[56px] text-xs"
                        placeholder="Tambahkan catatan pribadi mengapa Anda keliru di soal ini..."
                        value={noteDrafts[item.id] ?? item.personalNote ?? ''}
                        onChange={(e) => setNoteDrafts({ ...noteDrafts, [item.id]: e.target.value })}
                      />
                      <Button variant="outline" size="sm" onClick={() => handleSaveNote(item.id)}>
                        Simpan Catatan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  hint: string | null;
  isMastered: boolean;
  reviewCount: number;
  topic: { name: string; subject: { code: string } };
}

export function FlashcardsPage() {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState<'ALL' | 'TWK' | 'TIU' | 'TKP'>('ALL');
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [exitingCard, setExitingCard] = useState<{
    card: FlashcardItem;
    wasFlipped: boolean;
    indexLabel: string;
    nonce: number;
  } | null>(null);
  const [enteringFromBackId, setEnteringFromBackId] = useState<string | null>(null);

  const { data: cards, isLoading, refetch } = useQuery({
    queryKey: ['flashcards'],
    queryFn: () => apiFetch<FlashcardItem[]>('/dashboard/flashcards'),
  });

  const allCards = cards || [];
  const list = allCards.filter(
    (c) => subjectFilter === 'ALL' || c.topic.subject.code === subjectFilter,
  );
  const safeIdx = list.length > 0 ? idx % list.length : 0;
  const card = list[safeIdx];

  const triggerFlip = () => {
    setIsFlipping(true);
    setFlipped((f) => !f);
    setTimeout(() => setIsFlipping(false), 720);
  };

  const animateNext = () => {
    if (list.length <= 1) return;
    const current = list[safeIdx];
    const indexLabel = `${String(safeIdx + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`;
    setExitingCard({ card: current, wasFlipped: flipped, indexLabel, nonce: Date.now() });
    setFlipped(false);
    setTilt({ rx: 0, ry: 0 });
    setIdx((prev) => (prev + 1) % list.length);
    setTimeout(() => setExitingCard(null), 650);
  };

  const animatePrev = () => {
    if (list.length <= 1) return;
    const prevIdx = (safeIdx - 1 + list.length) % list.length;
    const incoming = list[prevIdx];
    setFlipped(false);
    setTilt({ rx: 0, ry: 0 });
    setEnteringFromBackId(incoming.id);
    setIdx(prevIdx);
    setTimeout(() => setEnteringFromBackId(null), 650);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        triggerFlip();
      } else if (e.code === 'ArrowRight') {
        animateNext();
      } else if (e.code === 'ArrowLeft') {
        animatePrev();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.length, safeIdx, flipped]);

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingState label="Memuat kartu hafalan..." />
      </AppLayout>
    );
  }

  const handleReview = async (isMastered: boolean) => {
    if (!card || submittingReview) return;
    setSubmittingReview(true);
    try {
      await apiFetch(`/dashboard/flashcards/${card.id}/review`, {
        method: 'POST',
        body: JSON.stringify({ isMastered }),
      });
      animateNext();
      await refetch();
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rx: Number((-y * 7).toFixed(2)),
      ry: Number((x * 7).toFixed(2)),
    });
  };

  const masteredCount = allCards.filter((c) => c.isMastered).length;
  const visibleStackCount = Math.min(3, list.length);
  const stackCards = Array.from({ length: visibleStackCount }, (_, offset) => {
    const itemIdx = (safeIdx + offset) % list.length;
    return {
      item: list[itemIdx],
      offset,
      itemIdx,
    };
  });

  const renderCardFaces = (
    item: FlashcardItem,
    isCardFlipped: boolean,
    indexText: string,
    isInteractive: boolean,
  ) => (
    <div
      className={`flashcard-body relative min-h-[300px] sm:min-h-[320px] w-full ${
        isCardFlipped ? 'is-flipped' : ''
      }`}
    >
      {/* FRONT FACE (Pertanyaan) */}
      <div className="flashcard-face absolute inset-0 flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-[0_18px_40px_-18px_rgba(15,23,42,0.22)]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="navy">
              {item.topic.subject.code} • {item.topic.name}
            </Badge>
            {item.isMastered && <Badge variant="success">Hafal</Badge>}
          </div>
          <span className="text-xs font-semibold text-slate-400">{indexText}</span>
        </div>

        <div className="my-auto py-4 text-center space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-600">
            Pertanyaan — Sisi Depan
          </p>
          <p className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">{item.front}</p>
          {item.hint && (
            <div className="inline-block rounded-full bg-slate-100 px-3.5 py-1 text-xs text-slate-600">
              Petunjuk: {item.hint}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400">
          <RotateCw className="h-3.5 w-3.5" />
          <span>{isInteractive ? 'Klik kartu untuk membalik ke jawaban' : 'Kartu berikutnya dalam tumpukan'}</span>
        </div>
      </div>

      {/* BACK FACE (Jawaban / Konsep) */}
      <div className="flashcard-face flashcard-face-back absolute inset-0 flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 text-white shadow-[0_22px_45px_-16px_rgba(30,58,138,0.45)]">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 px-2.5 py-0.5 text-xs font-semibold text-indigo-200">
            {item.topic.subject.code} • {item.topic.name}
          </span>
          <span className="text-xs font-semibold text-slate-400">{indexText}</span>
        </div>

        <div className="my-auto py-4 text-center space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-400">
            Jawaban & Konsep Inti — Sisi Belakang
          </p>
          <p className="text-lg sm:text-xl font-bold text-white leading-relaxed">{item.back}</p>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400">
          <RotateCw className="h-3.5 w-3.5" />
          <span>Klik lagi untuk kembali ke pertanyaan</span>
        </div>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge variant="indigo">
              <Layers className="h-3.5 w-3.5" /> Pengulangan Aktif 3D
            </Badge>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Kartu Hafalan (Flashcards)</h1>
            <p className="mt-1 text-sm text-slate-600">
              Hafalkan pasal UUD 1945, rumus cepat TIU, dan prinsip kompetensi TKP.
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1">
            {(['ALL', 'TWK', 'TIU', 'TKP'] as const).map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => {
                  setSubjectFilter(sub);
                  setIdx(0);
                  setFlipped(false);
                  setExitingCard(null);
                }}
                className={`rounded-lg px-3 py-1 text-xs font-semibold cursor-pointer ${
                  subjectFilter === sub ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {sub === 'ALL' ? 'Semua' : sub}
              </button>
            ))}
          </div>
        </div>

        {/* Mastery mini-bar */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-600">
          <span>
            Dikuasai: <strong className="text-emerald-700">{masteredCount}</strong> / {allCards.length} kartu
          </span>
          <span className="hidden sm:inline text-slate-400">
            Pintasan: Klik kartu /{' '}
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold">
              Spasi
            </kbd>{' '}
            untuk balik •{' '}
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold">
              ←
            </kbd>{' '}
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold">
              →
            </kbd>{' '}
            pindah kartu
          </span>
        </div>

        {card ? (
          <div className="space-y-5">
            {/* 3D Interactive Stacked Deck Stage */}
            <div className="relative pt-2 pb-6">
              <div className="flashcard-scene relative min-h-[340px] sm:min-h-[360px]">
                {/* Render stacked cards in reverse so offset 0 sits on top */}
                {[...stackCards].reverse().map(({ item, offset, itemIdx }) => {
                  const isFront = offset === 0;
                  const zIdx = 30 - offset * 10;
                  const translateY = offset * 14;
                  const scale = 1 - offset * 0.04;
                  const indexText = `${String(itemIdx + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`;
                  const isEntering = isFront && enteringFromBackId === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={isFront ? triggerFlip : undefined}
                      onMouseMove={isFront ? handleMouseMove : undefined}
                      onMouseLeave={isFront ? () => setTilt({ rx: 0, ry: 0 }) : undefined}
                      className={`absolute inset-x-0 top-0 select-none ${
                        isFront ? 'cursor-pointer' : 'pointer-events-none'
                      } ${isEntering ? 'flashcard-bring-front' : ''}`}
                      style={{
                        zIndex: zIdx,
                        transform: isFront
                          ? `translate3d(0, 0, 0) scale(1) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`
                          : `translate3d(0, ${translateY}px, ${-offset * 25}px) scale(${scale})`,
                        transition: isFront
                          ? 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1), opacity 350ms ease'
                          : 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1), opacity 350ms ease',
                        opacity: offset === 2 ? 0.85 : 1,
                      }}
                    >
                      {renderCardFaces(item, isFront ? flipped : false, indexText, isFront)}
                    </div>
                  );
                })}

                {/* Exiting card animating in 3D arc to the very back of the deck */}
                {exitingCard && (
                  <div
                    key={`exit-${exitingCard.card.id}-${exitingCard.nonce}`}
                    className="flashcard-send-back absolute inset-x-0 top-0 select-none"
                  >
                    {renderCardFaces(
                      exitingCard.card,
                      exitingCard.wasFlipped,
                      exitingCard.indexLabel,
                      false,
                    )}
                  </div>
                )}
              </div>

              {/* Realistic Floor Shadow beneath the floating 3D card */}
              <div
                className={`flashcard-floor-shadow mx-auto mt-1 h-4 w-4/5 rounded-full ${
                  isFlipping || exitingCard ? 'is-flipping' : ''
                }`}
              />
            </div>

            {/* Tactile Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={animatePrev} title="Kartu Sebelumnya">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={triggerFlip}>
                  <RotateCw className="h-4 w-4" /> Balik Kartu
                </Button>
                <Button variant="outline" size="sm" onClick={animateNext} title="Kartu Berikutnya (Pindah ke Belakang)">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => handleReview(false)}
                  isLoading={submittingReview}
                >
                  Perlu Ulang
                </Button>
                <Button
                  variant="indigo"
                  onClick={() => handleReview(true)}
                  isLoading={submittingReview}
                >
                  Sudah Hafal ✓
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState title="Belum ada flashcard" description="Flashcard tidak tersedia pada filter ini." />
        )}
      </div>
    </AppLayout>
  );
}

export function StudyMaterialsPage() {
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');

  const { data: materials, isLoading } = useQuery({
    queryKey: ['study-materials', search, subject],
    queryFn: () =>
      apiFetch<
        Array<{
          id: string;
          title: string;
          summary: string;
          contentMd: string;
          keyPoints: string[];
          formulas: string[];
          readMinutes: number;
          subject: { code: string };
          topic: { name: string } | null;
        }>
      >(`/dashboard/materials?q=${encodeURIComponent(search)}&subject=${encodeURIComponent(subject)}`),
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge variant="indigo">
              <BookOpen className="h-3.5 w-3.5" /> Pustaka Ringkas SKD
            </Badge>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Pusat Materi Belajar</h1>
            <p className="mt-1 text-sm text-slate-600">
              Ringkasan konsep TWK, rumus cepat TIU, dan prinsip kompetensi TKP terverifikasi.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9 w-56"
                placeholder="Cari materi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
              {['', 'TWK', 'TIU', 'TKP'].map((s) => (
                <button
                  key={s || 'ALL'}
                  onClick={() => setSubject(s)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                    subject === s ? 'bg-slate-900 text-white' : 'text-slate-600'
                  }`}
                >
                  {s || 'Semua'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <LoadingState label="Memuat pusat materi..." />
        ) : !materials || materials.length === 0 ? (
          <EmptyState title="Materi tidak ditemukan" description="Coba kata kunci lain." />
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {materials.map((m) => (
              <Card key={m.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="navy">{m.subject.code}</Badge>
                      {m.topic && <Badge variant="indigo">{m.topic.name}</Badge>}
                    </div>
                    <span className="text-xs text-slate-500">{m.readMinutes} mnt baca</span>
                  </div>
                  <CardTitle className="mt-2">{m.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3.5 text-sm text-slate-700">
                  <p className="leading-relaxed text-slate-600">{m.summary}</p>
                  <div className="rounded-xl bg-slate-50/90 p-4 border border-slate-200/80">
                    <MarkdownView content={m.contentMd} />
                  </div>
                  {Array.isArray(m.keyPoints) && m.keyPoints.length > 0 && (
                    <div className="rounded-xl bg-emerald-50/60 border border-emerald-200/70 p-3.5 space-y-1.5">
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">
                        Poin Kunci Ingatan
                      </p>
                      <ul className="space-y-1 pl-4 list-disc text-xs text-emerald-950">
                        {m.keyPoints.map((kp, i) => (
                          <li key={i}>{kp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(m.formulas) && m.formulas.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.formulas.map((f) => (
                        <Badge key={f} variant="indigo">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
