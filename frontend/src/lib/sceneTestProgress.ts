import type { SceneTestType } from "./sceneTests";

export interface SceneTestProgressEntry {
  done: boolean;
  score?: string;
}

export type SceneTestProgress = Record<string, Partial<Record<SceneTestType, SceneTestProgressEntry>>>;

const STORAGE_KEY = "scene-test-progress-v1";

function isProgress(value: unknown): value is SceneTestProgress {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).every((scene) => {
    if (!scene || typeof scene !== "object" || Array.isArray(scene)) return false;
    return Object.entries(scene).every(([type, entry]) =>
      (type === "cloze" || type === "translate")
      && Boolean(entry)
      && typeof entry === "object"
      && typeof (entry as SceneTestProgressEntry).done === "boolean"
      && ((entry as SceneTestProgressEntry).score === undefined || typeof (entry as SceneTestProgressEntry).score === "string"),
    );
  });
}

export function loadSceneTestProgress(storage: Storage | null): SceneTestProgress {
  if (!storage) return {};
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return isProgress(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function saveSceneTestProgress(
  storage: Storage | null,
  sceneId: string,
  testType: SceneTestType,
  progress: SceneTestProgressEntry,
): boolean {
  if (!storage) return false;
  try {
    const current = loadSceneTestProgress(storage);
    const next = {
      ...current,
      [sceneId]: { ...current[sceneId], [testType]: progress },
    };
    storage.setItem(STORAGE_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export const sceneTestProgressStorageKey = STORAGE_KEY;
