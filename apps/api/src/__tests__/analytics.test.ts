import { describe, it, expect } from 'vitest';
import { classifyMastery, getLevelForXp, MASTERY_THRESHOLDS } from '@nippia/shared';

describe('Learning Analytics & Mastery Classification', () => {
  it('never classifies a topic as weak when sample size is below minimum threshold', () => {
    expect(classifyMastery(0, 1)).toBe('INSUFFICIENT_DATA');
    expect(classifyMastery(25, 2)).toBe('INSUFFICIENT_DATA');
    expect(classifyMastery(40, MASTERY_THRESHOLDS.MIN_SAMPLES - 1)).toBe('INSUFFICIENT_DATA');
  });

  it('classifies mastery accurately once minimum sample threshold is met', () => {
    expect(classifyMastery(90, 5)).toBe('MASTERED');
    expect(classifyMastery(85, 10)).toBe('MASTERED');
    expect(classifyMastery(75, 5)).toBe('GOOD');
    expect(classifyMastery(55, 8)).toBe('DEVELOPING');
    expect(classifyMastery(42, 7)).toBe('NEEDS_IMPROVEMENT');
  });

  it('computes progressive user XP levels from Pemula to SKD Master', () => {
    expect(getLevelForXp(0).name).toBe('Pemula');
    expect(getLevelForXp(500).name).toBe('Pembelajar');
    expect(getLevelForXp(1500).name).toBe('Menengah');
    expect(getLevelForXp(3500).name).toBe('Mahir');
    expect(getLevelForXp(7000).name).toBe('Ahli');
    expect(getLevelForXp(12500).name).toBe('SKD Master');
  });
});
