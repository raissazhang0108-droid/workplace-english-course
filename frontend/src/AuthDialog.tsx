import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { LegacyAttempt } from "./lib/accountApi";
import "./auth-dialog.css";

export interface AccountSnapshot {
  email: string;
  completedCourses: string[];
}

interface AuthDialogProps {
  anonymousLearnerId: string;
  completedCourses: string[];
  legacyAttempts: LegacyAttempt[];
  onClose: () => void;
  onAuthenticated: (account: AccountSnapshot) => void;
}

async function readAccountResponse(response: Response): Promise<AccountSnapshot> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error("服务器返回了无法读取的数据，请稍后重试。");
  }
  if (!response.ok) {
    const detail = body && typeof body === "object" && "detail" in body
      && typeof body.detail === "string"
      ? body.detail
      : "操作未成功，请稍后重试。";
    throw new Error(detail);
  }
  if (!body || typeof body !== "object" || !("email" in body)
    || typeof body.email !== "string" || !("completedCourses" in body)
    || !Array.isArray(body.completedCourses)
    || !body.completedCourses.every((course) => typeof course === "string")) {
    throw new Error("服务器返回的账号资料格式不正确。");
  }
  return { email: body.email, completedCourses: body.completedCourses };
}

export default function AuthDialog({
  anonymousLearnerId,
  completedCourses,
  legacyAttempts,
  onClose,
  onAuthenticated,
}: AuthDialogProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`/api/auth/${mode === "register" ? "register" : "login"}`, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          email,
          password,
          anonymousLearnerId,
          completedCourses,
          legacyAttempts,
        }),
      });
      onAuthenticated(await readAccountResponse(response));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "暂时无法连接账号服务，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button type="button" className="auth-close" aria-label="关闭登录窗口" onClick={onClose}><X size={18}/></button>
        <div className="auth-eyebrow">ENGLISH AT WORK</div>
        <h2 id="auth-title">{mode === "register" ? "创建学习账号" : "欢迎回来"}</h2>
        <p className="auth-description">登录后同步课程进度和测验记录，换设备也能继续学习。</p>
        <div className="auth-tabs" role="tablist" aria-label="账号操作">
          <button type="button" role="tab" aria-selected={mode === "login"} onClick={() => { setMode("login"); setError(""); }}>登录</button>
          <button type="button" role="tab" aria-selected={mode === "register"} onClick={() => { setMode("register"); setError(""); }}>注册</button>
        </div>
        <form onSubmit={(event) => void submit(event)}>
          <label htmlFor="auth-email">邮箱</label>
          <input id="auth-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)}/>
          <label htmlFor="auth-password">密码</label>
          <input id="auth-password" type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} required minLength={mode === "register" ? 8 : 1} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)}/>
          {mode === "register" && <small className="auth-hint">密码至少 8 位。</small>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? "正在处理..." : mode === "register" ? "创建账号" : "登录"}
          </button>
        </form>
        <button type="button" className="auth-guest" onClick={onClose}>继续以游客身份学习</button>
      </section>
    </div>
  );
}
