import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../ui';

export interface QuestionDiscussionProps {
  questionId: string;
  questionCode: string;
  subjectCode: 'TWK' | 'TIU' | 'TKP';
  topicName: string;
  topicSlug: string;
  selectedKey?: string | null;
  options: Array<{
    optionKey: string;
    text: string;
    scoreValue?: number;
    isCorrect?: boolean;
    optionFeedback?: string;
  }>;
  explanation?: string;
  conceptSummary?: string | null;
  stepByStep?: string[] | unknown;
  whyOthersWrong?: Record<string, string> | unknown;
  quickTrick?: string | null;
  commonMistakes?: string | null;
  studyTip?: string | null;
  references?: Array<{ title: string; source: string; note?: string | null }>;
}

export function QuestionDiscussionPanel(props: QuestionDiscussionProps) {
  const [trickOpen, setTrickOpen] = useState(true);
  const steps = Array.isArray(props.stepByStep) ? (props.stepByStep as string[]) : [];
  const distractorMap =
    props.whyOthersWrong && typeof props.whyOthersWrong === 'object'
      ? (props.whyOthersWrong as Record<string, string>)
      : {};

  const bestOption =
    props.options.find((o) => o.isCorrect) ??
    [...props.options].sort((a, b) => (b.scoreValue ?? 0) - (a.scoreValue ?? 0))[0];

  return (
    <div className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <h4 className="text-sm font-bold text-slate-900">
            Pembahasan Komprehensif ({props.questionCode})
          </h4>
          {bestOption && (
            <Badge variant="success">
              {props.subjectCode === 'TKP'
                ? `Skor Tertinggi (5): Opsi ${bestOption.optionKey}`
                : `Jawaban Benar: Opsi ${bestOption.optionKey}`}
            </Badge>
          )}
        </div>
      </div>

      {/* 1. Konsep Inti */}
      {props.conceptSummary && (
        <div className="rounded-xl bg-white p-4 border border-slate-200/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
            Konsep & Landasan Utama
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">{props.conceptSummary}</p>
        </div>
      )}

      {/* 2. Langkah Penalaran */}
      {steps.length > 0 && (
        <div className="rounded-xl bg-white p-4 border border-slate-200/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Penalaran Langkah demi Langkah
          </p>
          <ol className="mt-2 space-y-1.5 text-sm text-slate-700 list-decimal pl-5">
            {steps.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ol>
        </div>
      )}

      {/* 3. Alasan Benar */}
      {props.explanation && (
        <div className="rounded-xl bg-emerald-50/60 p-4 border border-emerald-200/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
            {props.subjectCode === 'TKP'
              ? 'Mengapa Opsi Skor 5 Paling Mencerminkan Kompetensi'
              : 'Mengapa Jawaban Ini Benar'}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-emerald-950">{props.explanation}</p>
        </div>
      )}

      {/* 4. Analisis Semua Opsi (khususnya bobot 1-5 TKP & pengecoh TWK/TIU) */}
      <div className="rounded-xl bg-white p-4 border border-slate-200/70">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2.5">
          {props.subjectCode === 'TKP'
            ? 'Rincian Bobot & Rasional Setiap Opsi (Skala 1–5)'
            : 'Analisis Opsi Lainnya (Pengecoh)'}
        </p>
        <div className="space-y-2">
          {props.options.map((opt) => {
            const detail = opt.optionFeedback || distractorMap[opt.optionKey];
            const isChosen = props.selectedKey === opt.optionKey;
            return (
              <div
                key={opt.optionKey}
                className={`rounded-lg border px-3 py-2 text-xs ${
                  opt.isCorrect
                    ? 'border-emerald-200 bg-emerald-50/50 text-emerald-950'
                    : isChosen
                      ? 'border-amber-200 bg-amber-50/50 text-amber-950'
                      : 'border-slate-100 bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 font-semibold">
                  <span>
                    Opsi {opt.optionKey} {isChosen ? '(Pilihan Anda)' : ''}
                  </span>
                  {props.subjectCode === 'TKP' ? (
                    <Badge variant={opt.scoreValue === 5 ? 'success' : 'neutral'}>
                      Bobot: {opt.scoreValue ?? 0} poin
                    </Badge>
                  ) : opt.isCorrect ? (
                    <Badge variant="success">Benar (+5)</Badge>
                  ) : (
                    <Badge variant="neutral">0 poin</Badge>
                  )}
                </div>
                {detail && <p className="mt-1 leading-relaxed">{detail}</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Quick Trick (Expand/Collapse) */}
      {props.quickTrick && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 overflow-hidden">
          <button
            type="button"
            onClick={() => setTrickOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-indigo-950 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Trik Cepat Menjawab
            </span>
            {trickOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {trickOpen && (
            <div className="border-t border-indigo-100 px-4 py-3 text-sm text-indigo-950">
              {props.quickTrick}
            </div>
          )}
        </div>
      )}

      {/* 6. Kesalahan Umum & Tip Materi */}
      <div className="grid gap-3 md:grid-cols-2">
        {props.commonMistakes && (
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3.5 text-xs text-amber-950">
            <div className="flex items-center gap-1.5 font-semibold mb-1">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              Kesalahan yang Sering Terjadi
            </div>
            <p className="leading-relaxed">{props.commonMistakes}</p>
          </div>
        )}
        {props.studyTip && (
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-700">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1">
              <Lightbulb className="h-3.5 w-3.5 text-indigo-600" />
              Materi & Latihan Terkait
            </div>
            <p className="leading-relaxed">{props.studyTip}</p>
            <Link
              to={`/practice/topic/${props.topicSlug}`}
              className="mt-2 inline-flex items-center gap-1 font-semibold text-indigo-600 hover:underline"
            >
              Latih Topik {props.topicName} →
            </Link>
          </div>
        )}
      </div>

      {/* 7. Referensi & Disclaimer */}
      {props.references && props.references.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            <span>
              Referensi: {props.references.map((r) => `${r.title} (${r.source})`).join(' • ')}
            </span>
          </div>
          <span className="italic">
            Soal latihan orisinal Nippia (bukan soal resmi BKN).
          </span>
        </div>
      )}
    </div>
  );
}
