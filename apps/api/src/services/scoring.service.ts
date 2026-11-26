import type { SubjectCode } from '@nippia/shared';

export interface ScoringRuleConfig {
  id: string;
  name: string;
  year: number;
  isOfficialStyle: boolean;
  sourceReference: string;
  durationMinutes: number;
  disabilityMins: number;
  twkQuestionCount: number;
  tiuQuestionCount: number;
  tkpQuestionCount: number;
  twkCorrectPoints: number;
  twkWrongPoints: number;
  tiuCorrectPoints: number;
  tiuWrongPoints: number;
  tkpMinPoints: number;
  tkpMaxPoints: number;
  unansweredPoints: number;
  version: number;
}

export interface PassingGradeRule {
  formationType: string;
  year: number;
  twkThreshold: number;
  tiuThreshold: number;
  tkpThreshold: number;
  totalThreshold: number | null;
  sourceDocument: string;
}

export interface AnswerEvaluationInput {
  questionId: string;
  subjectCode: SubjectCode;
  selectedKey: string | null;
  options: Array<{
    optionKey: string;
    scoreValue: number;
    isCorrect: boolean;
  }>;
}

export interface EvaluatedAnswerResult {
  questionId: string;
  subjectCode: SubjectCode;
  selectedKey: string | null;
  isCorrect: boolean;
  scoreEarned: number;
  maxScore: number;
}

export interface ExamScoreSummary {
  twkScore: number;
  tiuScore: number;
  tkpScore: number;
  totalScore: number;
  twkMaxScore: number;
  tiuMaxScore: number;
  tkpMaxScore: number;
  totalMaxScore: number;
  twkCorrect: number;
  twkWrong: number;
  twkUnanswered: number;
  tiuCorrect: number;
  tiuWrong: number;
  tiuUnanswered: number;
  tkpAnswered: number;
  tkpUnanswered: number;
  tkpScore5Count: number;
  twkPassed: boolean | null;
  tiuPassed: boolean | null;
  tkpPassed: boolean | null;
  overallPassed: boolean | null;
  readinessLabel: string;
  isOfficialStyle: boolean;
  configYear: number;
  configName: string;
  passingGradeSource: string | null;
}

/**
 * Evaluates a single answer strictly against the active scoring configuration.
 * Never assumes every TKP option is worth 5 points; uses individual option weights.
 */
export function evaluateSingleAnswer(
  input: AnswerEvaluationInput,
  config: ScoringRuleConfig,
): EvaluatedAnswerResult {
  const { questionId, subjectCode, selectedKey, options } = input;

  if (!selectedKey) {
    const maxScore =
      subjectCode === 'TWK'
        ? config.twkCorrectPoints
        : subjectCode === 'TIU'
          ? config.tiuCorrectPoints
          : Math.max(...options.map((o) => o.scoreValue), config.tkpMaxPoints);

    return {
      questionId,
      subjectCode,
      selectedKey: null,
      isCorrect: false,
      scoreEarned: config.unansweredPoints,
      maxScore,
    };
  }

  const chosen = options.find((o) => o.optionKey === selectedKey);
  if (!chosen) {
    return {
      questionId,
      subjectCode,
      selectedKey: null,
      isCorrect: false,
      scoreEarned: config.unansweredPoints,
      maxScore:
        subjectCode === 'TWK'
          ? config.twkCorrectPoints
          : subjectCode === 'TIU'
            ? config.tiuCorrectPoints
            : config.tkpMaxPoints,
    };
  }

  if (subjectCode === 'TWK') {
    const scoreEarned = chosen.isCorrect ? config.twkCorrectPoints : config.twkWrongPoints;
    return {
      questionId,
      subjectCode,
      selectedKey,
      isCorrect: chosen.isCorrect,
      scoreEarned,
      maxScore: config.twkCorrectPoints,
    };
  }

  if (subjectCode === 'TIU') {
    const scoreEarned = chosen.isCorrect ? config.tiuCorrectPoints : config.tiuWrongPoints;
    return {
      questionId,
      subjectCode,
      selectedKey,
      isCorrect: chosen.isCorrect,
      scoreEarned,
      maxScore: config.tiuCorrectPoints,
    };
  }

  // TKP: weighted scale (e.g. 1..5 per option)
  const highestOptionScore = Math.max(...options.map((o) => o.scoreValue), 1);
  const clampedScore = Math.max(0, Math.min(config.tkpMaxPoints, chosen.scoreValue));
  return {
    questionId,
    subjectCode,
    selectedKey,
    isCorrect: clampedScore === highestOptionScore,
    scoreEarned: clampedScore,
    maxScore: highestOptionScore,
  };
}

/**
 * Aggregates evaluated answers into full SKD scoring summary and compares against passing grade rules.
 */
export function calculateExaminationSummary(
  answers: EvaluatedAnswerResult[],
  config: ScoringRuleConfig,
  passingGrade?: PassingGradeRule | null,
): ExamScoreSummary {
  let twkScore = 0;
  let tiuScore = 0;
  let tkpScore = 0;
  let twkMaxScore = 0;
  let tiuMaxScore = 0;
  let tkpMaxScore = 0;

  let twkCorrect = 0;
  let twkWrong = 0;
  let twkUnanswered = 0;
  let tiuCorrect = 0;
  let tiuWrong = 0;
  let tiuUnanswered = 0;
  let tkpAnswered = 0;
  let tkpUnanswered = 0;
  let tkpScore5Count = 0;

  for (const ans of answers) {
    if (ans.subjectCode === 'TWK') {
      twkScore += ans.scoreEarned;
      twkMaxScore += ans.maxScore;
      if (!ans.selectedKey) twkUnanswered++;
      else if (ans.isCorrect) twkCorrect++;
      else twkWrong++;
    } else if (ans.subjectCode === 'TIU') {
      tiuScore += ans.scoreEarned;
      tiuMaxScore += ans.maxScore;
      if (!ans.selectedKey) tiuUnanswered++;
      else if (ans.isCorrect) tiuCorrect++;
      else tiuWrong++;
    } else {
      tkpScore += ans.scoreEarned;
      tkpMaxScore += ans.maxScore;
      if (!ans.selectedKey) tkpUnanswered++;
      else {
        tkpAnswered++;
        if (ans.scoreEarned === ans.maxScore) tkpScore5Count++;
      }
    }
  }

  const totalScore = twkScore + tiuScore + tkpScore;
  const totalMaxScore = twkMaxScore + tiuMaxScore + tkpMaxScore;

  // Scale check: if exam is a smaller mini simulation, passing grade is marked proportional or skipped cleanly
  const isFullScale =
    answers.filter((a) => a.subjectCode === 'TWK').length === config.twkQuestionCount &&
    answers.filter((a) => a.subjectCode === 'TIU').length === config.tiuQuestionCount &&
    answers.filter((a) => a.subjectCode === 'TKP').length === config.tkpQuestionCount;

  let twkPassed: boolean | null = null;
  let tiuPassed: boolean | null = null;
  let tkpPassed: boolean | null = null;
  let overallPassed: boolean | null = null;

  if (passingGrade && isFullScale) {
    twkPassed = twkScore >= passingGrade.twkThreshold;
    tiuPassed = tiuScore >= passingGrade.tiuThreshold;
    tkpPassed = tkpScore >= passingGrade.tkpThreshold;
    const totalOk = passingGrade.totalThreshold ? totalScore >= passingGrade.totalThreshold : true;
    overallPassed = twkPassed && tiuPassed && tkpPassed && totalOk;
  } else if (passingGrade && totalMaxScore > 0) {
    // Proportional estimate for non-standard/mini simulations
    const twkRatio = twkMaxScore > 0 ? twkScore / twkMaxScore : 0;
    const tiuRatio = tiuMaxScore > 0 ? tiuScore / tiuMaxScore : 0;
    const tkpRatio = tkpMaxScore > 0 ? tkpScore / tkpMaxScore : 0;
    const reqTwk = passingGrade.twkThreshold / (config.twkQuestionCount * config.twkCorrectPoints);
    const reqTiu = passingGrade.tiuThreshold / (config.tiuQuestionCount * config.tiuCorrectPoints);
    const reqTkp = passingGrade.tkpThreshold / (config.tkpQuestionCount * config.tkpMaxPoints);
    twkPassed = twkRatio >= reqTwk;
    tiuPassed = tiuRatio >= reqTiu;
    tkpPassed = tkpRatio >= reqTkp;
    overallPassed = twkPassed && tiuPassed && tkpPassed;
  }

  const pct = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
  let readinessLabel = 'Perlu Penguatan Dasar';
  if (overallPassed && pct >= 78) readinessLabel = 'Sangat Siap (Kompetitif)';
  else if (overallPassed) readinessLabel = 'Memenuhi Ambang Batas (Siap)';
  else if (pct >= 55) readinessLabel = 'Mendekati Ambang Batas';

  return {
    twkScore,
    tiuScore,
    tkpScore,
    totalScore,
    twkMaxScore,
    tiuMaxScore,
    tkpMaxScore,
    totalMaxScore,
    twkCorrect,
    twkWrong,
    twkUnanswered,
    tiuCorrect,
    tiuWrong,
    tiuUnanswered,
    tkpAnswered,
    tkpUnanswered,
    tkpScore5Count,
    twkPassed,
    tiuPassed,
    tkpPassed,
    overallPassed,
    readinessLabel,
    isOfficialStyle: config.isOfficialStyle && isFullScale,
    configYear: config.year,
    configName: config.name,
    passingGradeSource: passingGrade?.sourceDocument ?? null,
  };
}
