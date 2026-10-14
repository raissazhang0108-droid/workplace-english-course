import type { ClozeAttempt } from "./weatherQuizStorage";

const LEARNER_ID_KEY = "english-course-anonymous-learner-id-v1";

interface AttemptResponse extends ClozeAttempt {
  id: string;
}

interface HistoryResponse {
  attempts: AttemptResponse[];
}

export function getAnonymousLearnerId(): string {
  let storedId: string | null;
  try {
    storedId = window.localStorage.getItem(LEARNER_ID_KEY);
  } catch {
    throw new Error("浏览器无法保存匿名学习编号，请允许本网站使用本地存储后重试。");
  }
  if (storedId) return storedId;

  const createdId = window.crypto.randomUUID();
  try {
    window.localStorage.setItem(LEARNER_ID_KEY, createdId);
  } catch {
    throw new Error("浏览器无法保存匿名学习编号，请允许本网站使用本地存储后重试。");
  }
  return createdId;
}

export function rotateAnonymousLearnerId(): void {
  try {
    window.localStorage.setItem(LEARNER_ID_KEY, window.crypto.randomUUID());
  } catch {
    throw new Error("浏览器无法更新匿名学习编号；账号仍可使用，但退出后新记录可能无法合并。");
  }
}

async function readResponse<T>(response: Response): Promise<T> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error("成绩服务器返回了无法读取的数据，请稍后重试。");
  }
  if (!response.ok) {
    const detailValue = body && typeof body === "object" && "detail" in body
      ? body.detail
      : undefined;
    const detail = typeof detailValue === "string"
      ? detailValue
      : detailValue === undefined ? "请求未成功" : JSON.stringify(detailValue);
    throw new Error(`成绩服务器出错：${detail}`);
  }
  return body as T;
}

export async function loadServerHistory(): Promise<ClozeAttempt[]> {
  const learnerId = getAnonymousLearnerId();
  const response = await fetch(`/api/attempts?learnerId=${encodeURIComponent(learnerId)}`, {
    credentials: "same-origin",
  });
  const body = await readResponse<HistoryResponse>(response);
  return body.attempts;
}

export async function submitServerAttempt(answers: string[]): Promise<ClozeAttempt> {
  const learnerId = getAnonymousLearnerId();
  const response = await fetch("/api/attempts", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify({ learnerId, answers }),
  });
  return readResponse<AttemptResponse>(response);
}
