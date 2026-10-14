import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Sparkles } from "lucide-react";
import {
  clozeBlanks,
  rainyDialogueRows,
} from "./lib/weatherQuiz";
import {
  loadClozeHistory,
  type ClozeAttempt,
} from "./lib/weatherQuizStorage";
import { saveSceneTestProgress } from "./lib/sceneTestProgress";
import { sceneTests } from "./lib/sceneTests";
import { loadServerHistory, submitServerAttempt } from "./lib/weatherQuizApi";
import "./weather-quiz.css";

function getBrowserStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function loadLegacyHistory(): { attempts: ClozeAttempt[]; notice: string } {
  const loaded = loadClozeHistory(getBrowserStorage());
  if (loaded.status === "loaded") return { attempts: loaded.attempts, notice: "" };
  if (loaded.status === "unavailable") {
    return { attempts: [], notice: "浏览器本机存储不可用；旧的本机成绩无法显示。" };
  }
  return { attempts: [], notice: "旧的本机成绩格式异常；本次练习不受影响。" };
}

export default function WeatherQuiz({ onBack }: { onBack: () => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ClozeAttempt | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [legacy] = useState(loadLegacyHistory);
  const [serverHistory, setServerHistory] = useState<ClozeAttempt[]>([]);
  const [notice, setNotice] = useState(legacy.notice);
  const [submissionError, setSubmissionError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    loadServerHistory()
      .then((attempts) => {
        if (!active) return;
        setServerHistory(attempts);
        setNotice(legacy.notice);
      })
      .catch((error: unknown) => {
        if (!active) return;
        const message = error instanceof Error ? error.message : "未知错误";
        setNotice(`暂时无法读取服务器上的历史成绩：${message}`);
      });
    return () => { active = false; };
  }, [legacy.notice]);

  async function submitAnswers() {
    const answerList = clozeBlanks.map((blank) => answers[blank.id] ?? "");
    setSubmitting(true);
    setSubmissionError("");
    try {
      const attempt = await submitServerAttempt(answerList);
      setResult(attempt);
      try {
        saveSceneTestProgress(window.localStorage, "weather", "cloze", {
          done: true,
          score: `${attempt.score}/${clozeBlanks.length}`,
        });
      } catch {
        // The existing quiz result is still shown if local progress storage is unavailable.
      }
      setServerHistory((history) => [attempt, ...history].slice(0, 10));
      setNotice(legacy.notice);
    } catch (error) {
      const message = error instanceof Error ? error.message : "未知错误";
      setSubmissionError(`成绩未能保存，请检查后端服务后重试。${message}`);
    } finally {
      setSubmitting(false);
    }
  }

  function retry() {
    setAnswers({});
    setResult(null);
    setPageIndex(0);
    setSubmissionError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const row = rainyDialogueRows[pageIndex];
  const history = [...serverHistory, ...legacy.attempts].sort(
    (left, right) => Date.parse(right.completedAt) - Date.parse(left.completedAt),
  ).slice(0, 10);
  const filledCount = Object.values(answers).filter((answer) => answer.trim()).length;
  const canContinueToTranslate = sceneTests
    .find((scene) => scene.id === "weather")
    ?.tests.some((test) => test.type === "translate" && test.status === "available") ?? false;
  const progressStep = result ? clozeBlanks.length : filledCount;
  return (
    <section className="weather-quiz">

      <header className="weather-quiz-heading">
        <div className="weather-quiz-kicker"><Sparkles size={15} /> SMALL TALK · WEATHER CHALLENGE</div>
        <h1>7.1.1 天气不好 <span>Rainy-day cloze</span></h1>
        <p>每页一句，根据中文补全英文；答案会保留，最后统一检查。</p>
        <div className="weather-quiz-metrics">
          <span>☁️ 阴雨天气</span><span>{clozeBlanks.length} 个填空</span><span>{rainyDialogueRows.length} 句对话</span>
        </div>
      </header>

      {notice && <p className="weather-quiz-notice" role="status">{notice}</p>}
      {submissionError && <p className="weather-quiz-notice" role="alert">{submissionError}</p>}

      <div className="weather-quiz-progress" aria-label="填空进度">
        <div><strong>天气闯关</strong><span>{result ? "答案已提交" : `${filledCount} / ${clozeBlanks.length} 已填写`}</span></div>
        <div className="weather-quiz-progress-track"><i className={`weather-quiz-progress-value progress-${progressStep}`} /></div>
      </div>

      <form onSubmit={(event) => { event.preventDefault(); if (!result && !submitting) void submitAnswers(); }}>
        <nav className="weather-quiz-pagination" aria-label="对话句子翻页">
          <button type="button" className="weather-quiz-page-button" disabled={pageIndex === 0} onClick={() => setPageIndex((index) => index - 1)}>← 上一句</button>
          <span aria-label="句子进度">{pageIndex + 1} / {rainyDialogueRows.length}</span>
          <button type="button" className="weather-quiz-page-button" disabled={pageIndex === rainyDialogueRows.length - 1} onClick={() => setPageIndex((index) => index + 1)}>下一句 →</button>
        </nav>

        <p className="weather-quiz-scroll-hint">手机上可左右滑动查看英文和中文。</p>
        <div className="weather-quiz-table-wrap weather-quiz-sentence-wrap">
          <table className="weather-quiz-table">
            <thead><tr><th scope="col">讲话人</th><th scope="col">英文 · 填入灰框中的词</th><th scope="col">中文</th></tr></thead>
            <tbody>
              <tr key={pageIndex}>
                <th scope="row"><span className={`weather-quiz-speaker ${row.speaker.toLowerCase()}`}>{row.speaker}</span></th>
                <td className="weather-quiz-english">
                  {row.english.map((segment, segmentIndex) => {
                    if (typeof segment === "string") return <span key={`text-${segmentIndex}`}>{segment}</span>;
                    const index = clozeBlanks.findIndex((blank) => blank.id === segment.id);
                    const correct = result?.correctness[index];
                    const answerLength = segment.answer.length;
                    const inputSize = answerLength <= 4 ? "short" : answerLength <= 7 ? "medium" : answerLength <= 10 ? "long" : "extra-long";
                    return (
                      <span className={`weather-quiz-blank ${result ? correct ? "is-correct" : "is-incorrect" : ""}`} key={segment.id}>
                        <input
                          aria-label={`第 ${index + 1} 空，${row.speaker} 的英文对话`}
                          autoComplete="off"
                          disabled={Boolean(result) || submitting}
                          className={`weather-quiz-input-${inputSize}`}
                          value={result?.answers[index] ?? answers[segment.id] ?? ""}
                          onChange={(event) => setAnswers((current) => ({ ...current, [segment.id]: event.target.value }))}
                        />
                        {result && (
                          <span className="weather-quiz-answer-review">
                            {correct ? <><Check size={13} /> 正确</> : "错误"}
                            <span>你的答案：{result.answers[index].trim() || "（未作答）"}</span>
                            <span>标准答案：{segment.answer}</span>
                          </span>
                        )}
                      </span>
                    );
                  })}
                </td>
                <td className="weather-quiz-chinese">{row.chinese}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {(result || pageIndex === rainyDialogueRows.length - 1) && (
          <div className="weather-quiz-actions">
            {result ? (
            <>
              <p className="weather-quiz-score" role="status" aria-live="polite">
                🎉 答对 <strong>{result.score} / {clozeBlanks.length}</strong> 题
              </p>
              <button type="button" className="weather-quiz-submit" onClick={retry}>再闯一次 <RotateCcw size={16} /></button>
            </>
            ) : (
              <button type="submit" className="weather-quiz-submit" disabled={submitting}>
                {submitting ? "正在保存..." : submissionError ? "重试提交" : "检查全部答案"} <Check size={17} />
              </button>
            )}
          </div>
        )}
      </form>

      {result && canContinueToTranslate && <p className="weather-quiz-next-challenge">继续挑战：中翻英 <ArrowRight size={15}/></p>}

      {history.length > 0 && (
        <section className="weather-quiz-history" aria-label="最近练习记录">
          <h2>最近练习 <span>最多保留 10 次 · 本机旧记录与服务器记录</span></h2>
          <ol>{history.map((attempt) => (
            <li key={attempt.completedAt}>
              <time dateTime={attempt.completedAt}>{new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(attempt.completedAt))}</time>
              <strong>{attempt.score} / {clozeBlanks.length}</strong>
            </li>
          ))}</ol>
        </section>
      )}
    </section>
  );
}
