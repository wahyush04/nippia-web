import { describe, it, expect } from 'vitest';
import {
  calculateExaminationSummary,
  evaluateSingleAnswer,
  type PassingGradeRule,
  type ScoringRuleConfig,
} from '../services/scoring.service.js';

const BASE_CONFIG: ScoringRuleConfig = {
  id: 'cfg-2026',
  name: 'SKD 2026',
  year: 2026,
  isOfficialStyle: true,
  sourceReference: 'Test Config',
  durationMinutes: 100,
  disabilityMins: 130,
  twkQuestionCount: 30,
  tiuQuestionCount: 35,
  tkpQuestionCount: 45,
  twkCorrectPoints: 5,
  twkWrongPoints: 0,
  tiuCorrectPoints: 5,
  tiuWrongPoints: 0,
  tkpMinPoints: 1,
  tkpMaxPoints: 5,
  unansweredPoints: 0,
  version: 1,
};

const BASE_PASSING: PassingGradeRule = {
  formationType: 'UMUM',
  year: 2026,
  twkThreshold: 65,
  tiuThreshold: 80,
  tkpThreshold: 166,
  totalThreshold: 311,
  sourceDocument: 'Test Passing Grade',
};

describe('Dynamic SKD Scoring Engine', () => {
  it('scores TWK and TIU binary answers correctly (5 correct, 0 wrong, 0 empty)', () => {
    const options = [
      { optionKey: 'A', scoreValue: 0, isCorrect: false },
      { optionKey: 'B', scoreValue: 5, isCorrect: true },
      { optionKey: 'C', scoreValue: 0, isCorrect: false },
      { optionKey: 'D', scoreValue: 0, isCorrect: false },
      { optionKey: 'E', scoreValue: 0, isCorrect: false },
    ];

    const correct = evaluateSingleAnswer(
      { questionId: 'q1', subjectCode: 'TWK', selectedKey: 'B', options },
      BASE_CONFIG,
    );
    expect(correct.scoreEarned).toBe(5);
    expect(correct.isCorrect).toBe(true);

    const wrong = evaluateSingleAnswer(
      { questionId: 'q1', subjectCode: 'TIU', selectedKey: 'A', options },
      BASE_CONFIG,
    );
    expect(wrong.scoreEarned).toBe(0);
    expect(wrong.isCorrect).toBe(false);

    const empty = evaluateSingleAnswer(
      { questionId: 'q1', subjectCode: 'TWK', selectedKey: null, options },
      BASE_CONFIG,
    );
    expect(empty.scoreEarned).toBe(0);
    expect(empty.selectedKey).toBeNull();
  });

  it('scores TKP using individual option weights (1-5) and 0 when unanswered', () => {
    const tkpOptions = [
      { optionKey: 'A', scoreValue: 2, isCorrect: false },
      { optionKey: 'B', scoreValue: 5, isCorrect: true },
      { optionKey: 'C', scoreValue: 1, isCorrect: false },
      { optionKey: 'D', scoreValue: 4, isCorrect: false },
      { optionKey: 'E', scoreValue: 3, isCorrect: false },
    ];

    expect(
      evaluateSingleAnswer({ questionId: 'tkp1', subjectCode: 'TKP', selectedKey: 'C', options: tkpOptions }, BASE_CONFIG)
        .scoreEarned,
    ).toBe(1);
    expect(
      evaluateSingleAnswer({ questionId: 'tkp1', subjectCode: 'TKP', selectedKey: 'D', options: tkpOptions }, BASE_CONFIG)
        .scoreEarned,
    ).toBe(4);
    expect(
      evaluateSingleAnswer({ questionId: 'tkp1', subjectCode: 'TKP', selectedKey: 'B', options: tkpOptions }, BASE_CONFIG)
        .isCorrect,
    ).toBe(true);
    expect(
      evaluateSingleAnswer({ questionId: 'tkp1', subjectCode: 'TKP', selectedKey: null, options: tkpOptions }, BASE_CONFIG)
        .scoreEarned,
    ).toBe(0);
  });

  it('computes full 110-question SKD summary and passing grade status accurately', () => {
    const answers = [];
    // 20 TWK correct (100 >= 65)
    for (let i = 0; i < 30; i++) {
      answers.push({
        questionId: `twk-${i}`,
        subjectCode: 'TWK' as const,
        selectedKey: i < 20 ? 'A' : 'B',
        isCorrect: i < 20,
        scoreEarned: i < 20 ? 5 : 0,
        maxScore: 5,
      });
    }
    // 15 TIU correct (75 < 80 -> fails TIU!)
    for (let i = 0; i < 35; i++) {
      answers.push({
        questionId: `tiu-${i}`,
        subjectCode: 'TIU' as const,
        selectedKey: i < 15 ? 'A' : 'B',
        isCorrect: i < 15,
        scoreEarned: i < 15 ? 5 : 0,
        maxScore: 5,
      });
    }
    // 45 TKP with score 4 each (180 >= 166)
    for (let i = 0; i < 45; i++) {
      answers.push({
        questionId: `tkp-${i}`,
        subjectCode: 'TKP' as const,
        selectedKey: 'D',
        isCorrect: false,
        scoreEarned: 4,
        maxScore: 5,
      });
    }

    const summary = calculateExaminationSummary(answers, BASE_CONFIG, BASE_PASSING);
    expect(summary.twkScore).toBe(100);
    expect(summary.tiuScore).toBe(75);
    expect(summary.tkpScore).toBe(180);
    expect(summary.totalScore).toBe(355);
    expect(summary.twkPassed).toBe(true);
    expect(summary.tiuPassed).toBe(false);
    expect(summary.tkpPassed).toBe(true);
    expect(summary.overallPassed).toBe(false);
    expect(summary.isOfficialStyle).toBe(true);
  });
});
