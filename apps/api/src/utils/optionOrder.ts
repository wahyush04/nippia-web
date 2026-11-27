import crypto from 'node:crypto';

export const BASE_OPTION_KEYS: Array<'A' | 'B' | 'C' | 'D' | 'E'> = ['A', 'B', 'C', 'D', 'E'];

/**
 * Deterministically shuffles option keys A-E for a given seed + question ID.
 */
export function seededShuffleKeys(seedInput: string): Array<'A' | 'B' | 'C' | 'D' | 'E'> {
  const keys = [...BASE_OPTION_KEYS];
  const hash = crypto.createHash('sha256').update(seedInput).digest();
  for (let i = keys.length - 1; i > 0; i--) {
    const byte = hash[i % hash.length]!;
    const j = byte % (i + 1);
    [keys[i], keys[j]] = [keys[j]!, keys[i]!];
  }
  return keys;
}

/**
 * Builds an optionKey display order map (questionId -> array of 5 original option keys).
 */
export function buildOptionOrderMap(
  questionIds: string[],
  seed: string,
  randomize: boolean,
): Record<string, Array<'A' | 'B' | 'C' | 'D' | 'E'>> {
  const map: Record<string, Array<'A' | 'B' | 'C' | 'D' | 'E'>> = {};
  for (const qId of questionIds) {
    map[qId] = randomize ? seededShuffleKeys(`${seed}:${qId}`) : [...BASE_OPTION_KEYS];
  }
  return map;
}

/**
 * Translates a user-selected display option key (A-E) back to the original DB optionKey.
 */
export function displayKeyToOriginal(
  optionOrderMap: Record<string, string[]> | null | undefined,
  questionId: string,
  displayKey: string | null,
): string | null {
  if (!displayKey) return null;
  const order = optionOrderMap?.[questionId];
  if (!order || order.length !== 5) return displayKey;
  const idx = BASE_OPTION_KEYS.indexOf(displayKey as 'A' | 'B' | 'C' | 'D' | 'E');
  if (idx === -1) return displayKey;
  return order[idx] ?? displayKey;
}

/**
 * Translates an original DB optionKey (A-E) to the displayed optionKey for this session.
 */
export function originalKeyToDisplay(
  optionOrderMap: Record<string, string[]> | null | undefined,
  questionId: string,
  originalKey: string | null,
): string | null {
  if (!originalKey) return null;
  const order = optionOrderMap?.[questionId];
  if (!order || order.length !== 5) return originalKey;
  const idx = order.indexOf(originalKey);
  if (idx === -1) return originalKey;
  return BASE_OPTION_KEYS[idx] ?? originalKey;
}

export interface RawQuestionOption {
  optionKey: string;
  text: string;
  visualSpec?: unknown;
  scoreValue: number;
  isCorrect: boolean;
  optionFeedback?: string | null;
}

/**
 * Reorders a question's 5 options into shuffled display order A-E.
 */
export function remapOptionsForDisplay(
  options: RawQuestionOption[],
  optionOrderMap: Record<string, string[]> | null | undefined,
  questionId: string,
  includeDetail: boolean,
) {
  const order = optionOrderMap?.[questionId];
  if (!order || order.length !== 5 || options.length !== 5) {
    return options.map((o) => ({
      optionKey: o.optionKey,
      text: o.text,
      visualSpec: o.visualSpec,
      ...(includeDetail
        ? {
            scoreValue: o.scoreValue,
            isCorrect: o.isCorrect,
            optionFeedback: o.optionFeedback ?? undefined,
          }
        : {}),
    }));
  }

  const byOrigKey = new Map(options.map((o) => [o.optionKey, o]));
  return BASE_OPTION_KEYS.map((displayKey, idx) => {
    const origKey = order[idx] ?? displayKey;
    const opt = byOrigKey.get(origKey) ?? options[idx]!;
    return {
      optionKey: displayKey,
      text: opt.text,
      visualSpec: opt.visualSpec,
      ...(includeDetail
        ? {
            scoreValue: opt.scoreValue,
            isCorrect: opt.isCorrect,
            optionFeedback: opt.optionFeedback ?? undefined,
          }
        : {}),
    };
  });
}

/**
 * Remaps distractor analysis object keys from original A-E keys to displayed A-E keys.
 */
export function remapWhyOthersWrong(
  whyOthersWrong: unknown,
  optionOrderMap: Record<string, string[]> | null | undefined,
  questionId: string,
): unknown {
  if (!whyOthersWrong || typeof whyOthersWrong !== 'object' || Array.isArray(whyOthersWrong)) {
    return whyOthersWrong;
  }
  const order = optionOrderMap?.[questionId];
  if (!order || order.length !== 5) return whyOthersWrong;

  const source = whyOthersWrong as Record<string, string>;
  const remapped: Record<string, string> = {};
  for (let idx = 0; idx < BASE_OPTION_KEYS.length; idx++) {
    const displayKey = BASE_OPTION_KEYS[idx]!;
    const origKey = order[idx]!;
    if (origKey in source && source[origKey] !== undefined) {
      remapped[displayKey] = source[origKey];
    }
  }
  return remapped;
}

/**
 * Rewrites explicit option key references ("Opsi B") in explanation text to match display keys.
 */
export function remapOptionMentions(
  text: string | null | undefined,
  optionOrderMap: Record<string, string[]> | null | undefined,
  questionId: string,
): string | null | undefined {
  if (!text) return text;
  const order = optionOrderMap?.[questionId];
  if (!order || order.length !== 5) return text;
  return text.replace(/\b(Opsi|opsi)\s+([A-E])\b/g, (_match, prefix: string, origKey: string) => {
    const displayKey = originalKeyToDisplay(optionOrderMap, questionId, origKey) ?? origKey;
    return `${prefix} ${displayKey}`;
  });
}

export function remapStepByStep(
  stepByStep: unknown,
  optionOrderMap: Record<string, string[]> | null | undefined,
  questionId: string,
): unknown {
  if (!Array.isArray(stepByStep)) return stepByStep;
  return stepByStep.map((s) =>
    typeof s === 'string' ? remapOptionMentions(s, optionOrderMap, questionId) : s,
  );
}
