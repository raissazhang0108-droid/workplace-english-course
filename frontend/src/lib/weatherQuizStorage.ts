import { clozeBlanks } from "./weatherQuiz";

const HISTORY_KEY = "weather-rainy-cloze-history-v1";
const HISTORY_LIMIT = 10;

export interface ClozeAttempt {
  completedAt: string;
  answers: string[];
  correctness: boolean[];
  score: number;
}

interface ClozeHistory {
  schemaVersion: 1;
  attempts: ClozeAttempt[];
}

export type HistoryReadResult =
  | { status: "loaded"; attempts: ClozeAttempt[] }
  | { status: "unavailable" }
  | { status: "corrupt" };

export type HistorySaveResult =
  | { status: "saved"; attempts: ClozeAttempt[] }
  | { status: "unavailable" }
  | { status: "corrupt" }
  | { status: "failed" };

function isAttempt(value: unknown): value is ClozeAttempt {
  if (!value || typeof value !== "object") return false;
  const attempt = value as Partial<ClozeAttempt>;
  return typeof attempt.completedAt === "string"
    && !Number.isNaN(Date.parse(attempt.completedAt))
    && Array.isArray(attempt.answers)
    && attempt.answers.length === clozeBlanks.length
    && attempt.answers.every((answer) => typeof answer === "string")
    && Array.isArray(attempt.correctness)
    && attempt.correctness.length === clozeBlanks.length
    && attempt.correctness.every((correct) => typeof correct === "boolean")
    && Number.isInteger(attempt.score)
    && attempt.score! >= 0
    && attempt.score! <= clozeBlanks.length;
}

function isHistory(value: unknown): value is ClozeHistory {
  if (!value || typeof value !== "object") return false;
  const history = value as Partial<ClozeHistory>;
  return history.schemaVersion === 1
    && Array.isArray(history.attempts)
    && history.attempts.every(isAttempt);
}

export function loadClozeHistory(storage: Storage | null): HistoryReadResult {
  if (!storage) return { status: "unavailable" };
  let raw: string | null;
  try {
    raw = storage.getItem(HISTORY_KEY);
  } catch {
    return { status: "unavailable" };
  }
  if (raw === null) return { status: "loaded", attempts: [] };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isHistory(parsed)) return { status: "corrupt" };
    return { status: "loaded", attempts: parsed.attempts.slice(-HISTORY_LIMIT) };
  } catch {
    return { status: "corrupt" };
  }
}

export function saveClozeAttempt(
  storage: Storage | null,
  attempt: ClozeAttempt,
): HistorySaveResult {
  if (!storage) return { status: "unavailable" };
  try {
    const loaded = loadClozeHistory(storage);
    if (loaded.status !== "loaded") return loaded;
    const attempts = [...loaded.attempts, attempt].slice(-HISTORY_LIMIT);
    storage.setItem(HISTORY_KEY, JSON.stringify({ schemaVersion: 1, attempts }));
    return { status: "saved", attempts };
  } catch {
    return { status: "failed" };
  }
}

export const clozeHistoryStorageKey = HISTORY_KEY;
