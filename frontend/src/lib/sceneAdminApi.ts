export interface SceneDialogueLine {
  speaker: string;
  role: string;
  en: string;
  zh: string;
  phrases: string[];
}

export interface SceneVocabularyItem {
  en: string;
  zh: string;
  example: string;
}

export interface ScenePhraseItem {
  en: string;
  zh: string;
}

export interface SceneWordingExample {
  ordinary: string;
  natural: string;
  explanation: string;
}

export interface SceneLessonRecord {
  id: string;
  courseKey: string;
  title: string;
  englishTitle: string;
  category: string;
  subtitle: string;
  level: string;
  durationMinutes: number;
  sceneLabel: string;
  description: string[];
  formula: string[];
  speakers: string;
  dialogue: SceneDialogueLine[];
  vocabulary: SceneVocabularyItem[];
  quickPhrases: ScenePhraseItem[];
  wordingExamples: SceneWordingExample[];
  practice: string;
  createdAt: string;
  updatedAt: string;
}

export type SceneLessonPayload = Omit<SceneLessonRecord, "id" | "createdAt" | "updatedAt">;

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => null) as { detail?: unknown } | null;
  if (!response.ok) {
    const detail = typeof body?.detail === "string" ? body.detail : "保存场景课程失败，请稍后重试。";
    throw new Error(detail);
  }
  return body as T;
}

export async function listScenes(): Promise<SceneLessonRecord[]> {
  const response = await fetch("/api/scenes", { credentials: "same-origin" });
  const body = await parseResponse<{ scenes: SceneLessonRecord[] }>(response);
  return body.scenes;
}

export async function createScene(payload: SceneLessonPayload): Promise<SceneLessonRecord> {
  const response = await fetch("/api/scenes", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
    body: JSON.stringify(payload),
  });
  return parseResponse<SceneLessonRecord>(response);
}

export async function updateScene(id: string, payload: SceneLessonPayload): Promise<SceneLessonRecord> {
  const response = await fetch(`/api/scenes/${encodeURIComponent(id)}`, {
    method: "PUT",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
    body: JSON.stringify(payload),
  });
  return parseResponse<SceneLessonRecord>(response);
}

export async function deleteScene(id: string): Promise<void> {
  const response = await fetch(`/api/scenes/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "same-origin",
    headers: { "X-Requested-With": "XMLHttpRequest" },
  });
  await parseResponse<void>(response);
}
