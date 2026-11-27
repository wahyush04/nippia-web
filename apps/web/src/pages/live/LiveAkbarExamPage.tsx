import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  PauseCircle,
  Send,
  Wifi,
  WifiOff,
} from 'lucide-react';
import type { SubjectCode } from '@nippia/shared';
import { apiFetch, ApiError } from '../../lib/api';
import { createLiveEventSocket, formatDurationHms } from '../../lib/liveSocket';
import { Badge, Button, Card, CardContent, LoadingState, Modal, ProgressBar } from '../../components/ui';
import { NippiaLogo } from '../../components/ui/NippiaLogo';
import { FiguralRenderer } from '../../components/skd/FiguralRenderer';
import { ReportQuestionButton } from '../../components/skd/ReportQuestionButton';

interface LiveExamQuestion {
  questionId: string;
  questionOrder: number;
  subjectCode: SubjectCode;
  topicName: string;
  questionType: string;
  stem: string;
  visualSpec: Record<string, unknown> | null;
  options: Array<{
    optionKey: 'A' | 'B' | 'C' | 'D' | 'E';
    text: string;
    visualSpec: Record<string, unknown> | null;
  }>;
  savedAnswer: {
    selectedOption: 'A' | 'B' | 'C' | 'D' | 'E' | null;
    isFlagged: boolean;
    answerRevision: number;
    answeredAt: string;
  } | null;
}

interface AnswerStateEntry {
  selectedOption: 'A' | 'B' | 'C' | 'D' | 'E' | null;
  isFlagged: boolean;
  answerRevision: number;
  pendingSync?: boolean;
}

export function LiveCatExamPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerStateEntry>>({});
  const [remainingSec, setRemainingSec] = useState<number>(6000);
  const [isPaused, setIsPaused] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [socketConnected, setSocketConnected] = useState(false);
  const [syncWarning, setSyncWarning] = useState<string | null>(null);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const serverOffsetRef = useRef(0);
  const deadlineMsRef = useRef<number | null>(null);
  const submissionTokenRef = useRef<string>(`sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  const pendingQueueRef = useRef<Record<string, AnswerStateEntry>>({});
  const debounceTimersRef = useRef<Record<string, number>>({});

  const storageKey = `nippia_live_backup_${eventId}`;

  const { data, isLoading, error } = useQuery({
    queryKey: ['live-exam-payload', eventId],
    queryFn: () => apiFetch<Record<string, any>>(`/live-events/${eventId}/exam`),
    enabled: Boolean(eventId),
    retry: 1,
  });

  const questions: LiveExamQuestion[] = useMemo(() => data?.questions ?? [], [data]);

  // Redirect automatically if session already submitted
  useEffect(() => {
    if (!data?.session) return;
    if (['SUBMITTED', 'TIME_EXPIRED'].includes(data.session.sessionStatus)) {
      sessionStorage.removeItem(storageKey);
      navigate(`/live-events/${eventId}/result`, { replace: true });
    }
  }, [data, eventId, navigate, storageKey]);

  // Initialize answers + timing + recover unsynced local backup if newer revision
  useEffect(() => {
    if (!data) return;

    if (data.timing) {
      serverOffsetRef.current = data.timing.serverNowMs - Date.now();
      deadlineMsRef.current = data.timing.deadlineAt ? new Date(data.timing.deadlineAt).getTime() : null;
      setRemainingSec(data.timing.remainingSeconds ?? 0);
      setIsPaused(Boolean(data.timing.isPaused));
    }

    let localBackup: Record<string, AnswerStateEntry> = {};
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) localBackup = JSON.parse(raw);
    } catch {
      localBackup = {};
    }

    const merged: Record<string, AnswerStateEntry> = {};
    const toFlush: Array<[string, AnswerStateEntry]> = [];

    for (const q of (data.questions ?? []) as LiveExamQuestion[]) {
      const srv = q.savedAnswer;
      const loc = localBackup[q.questionId];
      if (loc && (!srv || loc.answerRevision > srv.answerRevision)) {
        merged[q.questionId] = loc;
        toFlush.push([q.questionId, loc]);
      } else if (srv) {
        merged[q.questionId] = {
          selectedOption: srv.selectedOption,
          isFlagged: srv.isFlagged,
          answerRevision: srv.answerRevision,
          pendingSync: false,
        };
      }
    }

    setAnswers(merged);
    if (toFlush.length > 0 && eventId) {
      toFlush.forEach(([qId, entry]) => {
        void apiFetch(`/live-events/${eventId}/answers/${qId}`, {
          method: 'PUT',
          body: JSON.stringify({
            selectedOption: entry.selectedOption,
            isFlagged: entry.isFlagged,
            answerRevision: entry.answerRevision,
          }),
        }).catch(() => {});
      });
    }
  }, [data, eventId, storageKey]);

  // Submit handler
  const handleConfirmSubmit = useCallback(async () => {
    if (!eventId || submitting) return;
    setSubmitting(true);
    try {
      await apiFetch(`/live-events/${eventId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ submissionToken: submissionTokenRef.current }),
      });
      sessionStorage.removeItem(storageKey);
      navigate(`/live-events/${eventId}/result`, { replace: true });
    } catch (err) {
      setSyncWarning(err instanceof ApiError ? err.message : 'Gagal mengirim ujian. Mencoba ulang...');
      setSubmitting(false);
    }
  }, [eventId, navigate, storageKey, submitting]);

  // Server-authoritative 1-second timer tick
  useEffect(() => {
    const id = window.setInterval(() => {
      if (isPaused || !deadlineMsRef.current) return;
      const estServerNow = Date.now() + serverOffsetRef.current;
      const diff = Math.max(0, Math.floor((deadlineMsRef.current - estServerNow) / 1000));
      setRemainingSec(diff);
      if (diff === 0 && !submitting && data?.session?.sessionStatus === 'IN_PROGRESS') {
        void handleConfirmSubmit();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [isPaused, data, submitting, handleConfirmSubmit]);

  // Flush pending offline answers when connection recovers
  const flushPendingAnswers = useCallback(async () => {
    if (!eventId) return;
    const entries = Object.entries(pendingQueueRef.current);
    if (entries.length === 0) return;

    for (const [qId, entry] of entries) {
      try {
        const res = await apiFetch<{
          answerRevision: number;
          selectedOption: 'A' | 'B' | 'C' | 'D' | 'E' | null;
          isFlagged: boolean;
        }>(`/live-events/${eventId}/answers/${qId}`, {
          method: 'PUT',
          body: JSON.stringify({
            selectedOption: entry.selectedOption,
            isFlagged: entry.isFlagged,
            answerRevision: entry.answerRevision,
          }),
        });
        delete pendingQueueRef.current[qId];
        setAnswers((prev) => ({
          ...prev,
          [qId]: {
            selectedOption: res.selectedOption,
            isFlagged: res.isFlagged,
            answerRevision: res.answerRevision,
            pendingSync: false,
          },
        }));
        setSyncWarning(null);
      } catch (err) {
        if (err instanceof ApiError && err.code === 'EXAM_TIME_EXPIRED') {
          navigate(`/live-events/${eventId}/result`, { replace: true });
          return;
        }
        setSyncWarning('Koneksi tidak stabil. Jawaban sementara diamankan di perangkat dan akan disinkronkan ulang.');
      }
    }
  }, [eventId, navigate]);

  // Online/offline listeners + browser visibility ping + beforeunload guard
  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
      void flushPendingAnswers();
    };
    const onOffline = () => {
      setIsOnline(false);
      setSyncWarning('Koneksi terputus! Jawaban terbaru disimpan sementara hingga koneksi kembali.');
    };
    const onVisibility = () => {
      if (!eventId) return;
      if (document.visibilityState === 'visible') {
        // Re-sync timing cleanly after tab resume
        void apiFetch<Record<string, any>>(`/live-events/${eventId}/session`)
          .then((s) => {
            if (s.timing) {
              serverOffsetRef.current = s.timing.serverNowMs - Date.now();
              deadlineMsRef.current = s.timing.deadlineAt ? new Date(s.timing.deadlineAt).getTime() : null;
              setRemainingSec(s.timing.remainingSeconds ?? 0);
              setIsPaused(Boolean(s.timing.isPaused));
            }
          })
          .catch(() => {});
      }
      void apiFetch(`/live-events/${eventId}/visibility-ping`, {
        method: 'POST',
        body: JSON.stringify({ visible: document.visibilityState === 'visible' }),
      }).catch(() => {});
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [eventId, flushPendingAnswers]);

  // WebSocket real-time synchronization
  useEffect(() => {
    if (!eventId) return;
    const socket = createLiveEventSocket(eventId);
    if (!socket) return;

    socket.on('connect', () => {
      setSocketConnected(true);
      void flushPendingAnswers();
    });
    socket.on('disconnect', () => setSocketConnected(false));

    socket.on('live_event:countdown', (payload: any) => {
      if (payload.serverNowMs) serverOffsetRef.current = payload.serverNowMs - Date.now();
      if (payload.deadlineAt) deadlineMsRef.current = new Date(payload.deadlineAt).getTime();
      if (typeof payload.isPaused === 'boolean') setIsPaused(payload.isPaused);
    });

    socket.on('live_event:exam_paused', (payload: any) => {
      setIsPaused(true);
      if (payload.remainingSeconds !== undefined) setRemainingSec(payload.remainingSeconds);
    });

    socket.on('live_event:exam_resumed', (payload: any) => {
      setIsPaused(false);
      if (payload.serverNowMs) serverOffsetRef.current = payload.serverNowMs - Date.now();
      if (payload.deadlineAt) deadlineMsRef.current = new Date(payload.deadlineAt).getTime();
      if (payload.remainingSeconds !== undefined) setRemainingSec(payload.remainingSeconds);
    });

    socket.on('live_event:exam_deadline_updated', (payload: any) => {
      if (payload.deadlineAt) deadlineMsRef.current = new Date(payload.deadlineAt).getTime();
      if (payload.remainingSeconds !== undefined) setRemainingSec(payload.remainingSeconds);
    });

    socket.on('live_event:exam_submitted', () => {
      sessionStorage.removeItem(storageKey);
      navigate(`/live-events/${eventId}/result`, { replace: true });
    });

    const pingId = window.setInterval(() => {
      if (socket.connected) socket.emit('live_event:ping_activity', { eventId });
    }, 12000);

    return () => {
      window.clearInterval(pingId);
      socket.disconnect();
    };
  }, [eventId, flushPendingAnswers, navigate, storageKey]);

  const persistAnswer = useCallback(
    (questionId: string, selectedOption: 'A' | 'B' | 'C' | 'D' | 'E' | null, isFlagged: boolean) => {
      if (!eventId || isPaused) return;

      let nextRev = 1;
      setAnswers((prev) => {
        const cur = prev[questionId];
        nextRev = (cur?.answerRevision ?? 0) + 1;
        const entry: AnswerStateEntry = {
          selectedOption,
          isFlagged,
          answerRevision: nextRev,
          pendingSync: true,
        };
        const updated = { ...prev, [questionId]: entry };
        pendingQueueRef.current[questionId] = entry;
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {
          // ignore storage quota
        }
        return updated;
      });

      // Debounce rapid clicks on the same question (180ms)
      if (debounceTimersRef.current[questionId]) {
        window.clearTimeout(debounceTimersRef.current[questionId]);
      }

      debounceTimersRef.current[questionId] = window.setTimeout(async () => {
        const target = pendingQueueRef.current[questionId];
        if (!target) return;
        try {
          const res = await apiFetch<{
            answerRevision: number;
            selectedOption: 'A' | 'B' | 'C' | 'D' | 'E' | null;
            isFlagged: boolean;
            staleIgnored?: boolean;
          }>(`/live-events/${eventId}/answers/${questionId}`, {
            method: 'PUT',
            body: JSON.stringify({
              selectedOption: target.selectedOption,
              isFlagged: target.isFlagged,
              answerRevision: target.answerRevision,
            }),
          });
          if (pendingQueueRef.current[questionId]?.answerRevision === target.answerRevision) {
            delete pendingQueueRef.current[questionId];
          }
          setAnswers((prev) => {
            const latest = prev[questionId];
            if (latest && latest.answerRevision > target.answerRevision) return prev;
            return {
              ...prev,
              [questionId]: {
                selectedOption: res.selectedOption,
                isFlagged: res.isFlagged,
                answerRevision: res.answerRevision,
                pendingSync: false,
              },
            };
          });
          setSyncWarning(null);
        } catch (err) {
          if (err instanceof ApiError && err.code === 'EXAM_TIME_EXPIRED') {
            navigate(`/live-events/${eventId}/result`, { replace: true });
          } else {
            setSyncWarning(
              err instanceof ApiError
                ? err.message
                : 'Gagal menyinkronkan ke server. Tersimpan aman di perangkat dan akan dikirim ulang.',
            );
          }
        }
      }, 180);
    },
    [eventId, isPaused, navigate, storageKey],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <LoadingState label="Memuat lembar ujian CAT Live Akbar..." />
      </div>
    );
  }

  if (error || !data || questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
            <p className="text-base font-bold text-slate-900">Tidak Dapat Memuat Ujian</p>
            <p className="text-sm text-slate-600">
              {error instanceof ApiError ? error.message : 'Sesi ujian belum tersedia atau belum dimulai.'}
            </p>
            <Button variant="indigo" onClick={() => navigate(`/live-events/${eventId}/waiting-room`)}>
              Kembali ke Ruang Tunggu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentIdx] ?? questions[0]!;
  const currentAns = answers[currentQ.questionId];

  const answeredCount = questions.filter((q) => Boolean(answers[q.questionId]?.selectedOption)).length;
  const flaggedCount = questions.filter((q) => Boolean(answers[q.questionId]?.isFlagged)).length;
  const unansweredCount = questions.length - answeredCount;
  const progressPct = Math.round((answeredCount / questions.length) * 100);

  const jumpToSubject = (subj: SubjectCode) => {
    const idx = questions.findIndex((q) => q.subjectCode === subj);
    if (idx >= 0) setCurrentIdx(idx);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950 text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <NippiaLogo variant="mark" onDark size="sm" />
            <div>
              <p className="text-xs font-bold text-indigo-300">NIPPIA LIVE AKBAR</p>
              <p className="text-sm font-bold text-white truncate max-w-[220px] sm:max-w-md">
                {data.event.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`hidden sm:flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                isOnline && socketConnected
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              }`}
            >
              {isOnline && socketConnected ? (
                <>
                  <Wifi className="h-3.5 w-3.5" /> Tersinkron
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5" /> {isOnline ? 'Polling Aktif' : 'Offline Backup'}
                </>
              )}
            </div>

            <div
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 font-mono text-base font-extrabold ${
                isPaused
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-400/30'
                  : remainingSec <= 300
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 text-amber-300'
              }`}
            >
              {isPaused ? <PauseCircle className="h-4 w-4" /> : <Clock className="h-4 w-4 text-indigo-300" />}
              <span>{isPaused ? 'DIJEDA' : formatDurationHms(remainingSec)}</span>
            </div>

            <Button variant="danger" size="sm" onClick={() => setSubmitModalOpen(true)}>
              <Send className="h-3.5 w-3.5" /> Selesai
            </Button>
          </div>
        </div>
      </header>

      {/* Alerts: Pause or Reconnect Warning */}
      {isPaused && (
        <div className="bg-amber-500 text-white px-4 py-2.5 text-center text-sm font-semibold">
          Ujian sedang DIJEDA sementara oleh Host/Operator. Timer dihentikan hingga dilanjutkan kembali.
        </div>
      )}
      {syncWarning && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs font-medium text-amber-900">
          {syncWarning}
        </div>
      )}

      {/* Main CAT Workspace */}
      <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 grid gap-6 lg:grid-cols-12 items-start">
        {/* Question Card Area */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1.5">
              {(['TWK', 'TIU', 'TKP'] as SubjectCode[]).map((subj) => (
                <button
                  key={subj}
                  type="button"
                  onClick={() => jumpToSubject(subj)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                    currentQ.subjectCode === subj
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>
            <span className="text-xs font-medium text-slate-600">
              Progres: {answeredCount}/{questions.length} ({progressPct}%)
            </span>
          </div>

          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="navy">Soal No. {currentQ.questionOrder}</Badge>
                  <Badge variant="indigo">{currentQ.subjectCode}</Badge>
                  <span className="text-xs text-slate-500">{currentQ.topicName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isPaused}
                    onClick={() =>
                      persistAnswer(
                        currentQ.questionId,
                        currentAns?.selectedOption ?? null,
                        !(currentAns?.isFlagged ?? false),
                      )
                    }
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                      currentAns?.isFlagged
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Flag className="h-3.5 w-3.5" />
                    {currentAns?.isFlagged ? 'Ditandai Ragu-ragu' : 'Tandai Ragu-ragu'}
                  </button>
                  <ReportQuestionButton
                    questionId={currentQ.questionId}
                    questionCode={`LIVE-${currentQ.questionOrder}`}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-base leading-relaxed text-slate-900 whitespace-pre-line">
                  {currentQ.stem}
                </p>
                {currentQ.visualSpec && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <FiguralRenderer spec={currentQ.visualSpec as any} />
                  </div>
                )}
              </div>

              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((opt) => {
                  const selected = currentAns?.selectedOption === opt.optionKey;
                  return (
                    <button
                      key={opt.optionKey}
                      type="button"
                      disabled={isPaused}
                      onClick={() =>
                        persistAnswer(
                          currentQ.questionId,
                          selected ? null : opt.optionKey,
                          currentAns?.isFlagged ?? false,
                        )
                      }
                      className={`w-full rounded-xl border p-3.5 text-left transition-colors flex items-start gap-3 cursor-pointer ${
                        selected
                          ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-600/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                          selected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {opt.optionKey}
                      </span>
                      <div className="flex-1 space-y-2">
                        <span className="block text-sm text-slate-800 leading-relaxed">{opt.text}</span>
                        {opt.visualSpec && (
                          <div className="max-w-[160px]">
                            <FiguralRenderer spec={opt.visualSpec as any} />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <Button
                  variant="outline"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                >
                  <ChevronLeft className="h-4 w-4" /> Sebelumnya
                </Button>
                <span className="text-xs text-slate-500">
                  {currentAns?.pendingSync ? 'Menyimpan...' : currentAns?.selectedOption ? 'Tersimpan di server' : 'Belum dijawab'}
                </span>
                {currentIdx < questions.length - 1 ? (
                  <Button variant="indigo" onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}>
                    Berikutnya <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="danger" onClick={() => setSubmitModalOpen(true)}>
                    Kumpulkan Ujian <Send className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sticky Navigation Grid */}
        <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Navigasi Nomor Soal ({questions.length})</span>
                  <span>{progressPct}%</span>
                </div>
                <ProgressBar value={progressPct} />
              </div>

              <div className="grid max-h-[380px] grid-cols-6 gap-1.5 overflow-y-auto p-1.5 pr-2">
                {questions.map((q, idx) => {
                  const st = answers[q.questionId];
                  const isActive = idx === currentIdx;
                  const isAnswered = Boolean(st?.selectedOption);
                  const isFlagged = Boolean(st?.isFlagged);

                  let cls = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
                  if (isFlagged) cls = 'bg-amber-400 text-amber-950';
                  else if (isAnswered) cls = 'bg-emerald-600 text-white';

                  return (
                    <button
                      key={q.questionId}
                      type="button"
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${cls} ${
                        isActive ? 'ring-2 ring-indigo-600 ring-offset-1' : ''
                      }`}
                    >
                      {q.questionOrder}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-emerald-600" />
                  <span>Terjawab ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-slate-200" />
                  <span>Kosong ({unansweredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-amber-400" />
                  <span>Ragu-ragu ({flaggedCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded border-2 border-indigo-600" />
                  <span>Aktif</span>
                </div>
              </div>

              <Button variant="danger" className="w-full" onClick={() => setSubmitModalOpen(true)}>
                <CheckCircle2 className="h-4 w-4" /> Kumpulkan Ujian Sekarang
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Submit Confirmation Modal */}
      <Modal
        open={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title="Konfirmasi Pengumpulan Ujian Live Akbar"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Setelah dikumpulkan, seluruh jawaban terkunci secara permanen dan tidak dapat diubah lagi.
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-emerald-50 p-3">
              <p className="text-lg font-bold text-emerald-700">{answeredCount}</p>
              <p className="text-xs text-emerald-700">Terjawab</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3">
              <p className="text-lg font-bold text-amber-700">{flaggedCount}</p>
              <p className="text-xs text-amber-700">Ragu-ragu</p>
            </div>
            <div className="rounded-xl bg-slate-100 p-3">
              <p className="text-lg font-bold text-slate-700">{unansweredCount}</p>
              <p className="text-xs text-slate-600">Belum Dijawab</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setSubmitModalOpen(false)}>
              Lanjutkan Mengerjakan
            </Button>
            <Button variant="danger" isLoading={submitting} onClick={handleConfirmSubmit}>
              Ya, Kumpulkan Ujian
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
