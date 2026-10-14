import type { AccountSnapshot } from "../AuthDialog";
import { loadClozeHistory, type ClozeAttempt } from "./weatherQuizStorage";

export type LegacyAttempt = Pick<ClozeAttempt, "completedAt" | "answers">;

async function readResponse<T>(response: Response): Promise<T> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error("账号服务器返回了无法读取的数据。");
  }
  if (!response.ok) {
    const detail = body && typeof body === "object" && "detail" in body
      && typeof body.detail === "string"
      ? body.detail
      : "账号操作未成功，请稍后重试。";
    throw new Error(detail);
  }
  return body as T;
}

function parseAccount(value: unknown): AccountSnapshot {
  if (!value || typeof value !== "object" || !("email" in value)
    || typeof value.email !== "string" || !("completedCourses" in value)
    || !Array.isArray(value.completedCourses)
    || !value.completedCourses.every((course) => typeof course === "string")) {
    throw new Error("账号服务器返回的资料格式不正确。");
  }
  return { email: value.email, completedCourses: value.completedCourses };
}

export async function loadCurrentAccount(): Promise<AccountSnapshot | null> {
  const response = await fetch("/api/auth/me", { credentials: "same-origin" });
  if (response.status === 401) return null;
  return parseAccount(await readResponse<unknown>(response));
}

export async function saveAccountCourses(completedCourses: string[]): Promise<string[]> {
  const response = await fetch("/api/progress", {
    method: "PUT",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify({ completedCourses }),
  });
  const body = await readResponse<{ completedCourses: unknown }>(response);
  if (!Array.isArray(body.completedCourses)
    || !body.completedCourses.every((course) => typeof course === "string")) {
    throw new Error("账号服务器返回的课程进度格式不正确。");
  }
  return body.completedCourses;
}

export async function logoutAccount(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "same-origin",
    headers: { "X-Requested-With": "XMLHttpRequest" },
  });
  if (!response.ok) {
    await readResponse(response);
    throw new Error("退出登录失败，请稍后重试。");
  }
}

export function loadLegacyAttempts(): LegacyAttempt[] {
  try {
    const result = loadClozeHistory(window.localStorage);
    return result.status === "loaded"
      ? result.attempts.map(({ completedAt, answers }) => ({ completedAt, answers }))
      : [];
  } catch {
    return [];
  }
}

export async function importLegacyAttempts(attempts: LegacyAttempt[]): Promise<void> {
  if (attempts.length === 0) return;
  const response = await fetch("/api/auth/import-attempts", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify(attempts),
  });
  await readResponse<{ imported: number }>(response);
}

export function parseAccountSnapshot(value: unknown): AccountSnapshot {
  return parseAccount(value);
}
