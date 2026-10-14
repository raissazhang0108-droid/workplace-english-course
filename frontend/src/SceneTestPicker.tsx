import { useState } from "react";
import { ArrowRight, Bell, CheckCircle2, LockKeyhole, RotateCcw } from "lucide-react";
import { clozeBlanks } from "./lib/weatherQuiz";
import { loadClozeHistory } from "./lib/weatherQuizStorage";
import { sceneTests, type SceneCategory, type SceneLessonId } from "./lib/sceneTests";
import { loadSceneTestProgress, type SceneTestProgress } from "./lib/sceneTestProgress";

const filters: Array<"全部" | SceneCategory> = ["全部", "日常沟通", "会议沟通", "面试英语"];
const categoryClass: Record<SceneCategory, string> = {
  "日常沟通": "daily",
  "会议沟通": "meetings",
  "面试英语": "interviews",
};

export default function SceneTestPicker({ onWeatherQuiz, onLesson }: { onWeatherQuiz: () => void; onLesson: (id: SceneLessonId) => void }) {
  const [notifiedScenes, setNotifiedScenes] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("scene-test-notifications");
      return saved ? JSON.parse(saved) as Record<string, boolean> : {};
    } catch {
      return {};
    }
  });
  const [filter, setFilter] = useState<(typeof filters)[number]>("全部");
  const [testProgress] = useState<SceneTestProgress>(() => {
    const saved = loadSceneTestProgress(typeof window === "undefined" ? null : window.localStorage);
    if (saved.weather?.cloze) return saved;
    try {
      const history = loadClozeHistory(typeof window === "undefined" ? null : window.localStorage);
      const latest = history.status === "loaded" ? history.attempts.at(-1) : undefined;
      return latest ? { ...saved, weather: { ...saved.weather, cloze: { done: true, score: `${latest.score}/${clozeBlanks.length}` } } } : saved;
    } catch {
      return saved;
    }
  });

  function registerNotification(id: string) {
    const next = { ...notifiedScenes, [id]: true };
    setNotifiedScenes(next);
    try {
      localStorage.setItem("scene-test-notifications", JSON.stringify(next));
    } catch {
      // Keep this page session's notification state even if storage is unavailable.
    }
  }

  const filteredScenes = sceneTests.filter(scene => filter === "全部" || scene.category === filter);
  const availableScenes = filteredScenes.filter(scene => scene.tests.some(test => test.status === "available"));
  const upcomingScenes = filteredScenes.filter(scene => !scene.tests.some(test => test.status === "available"));

  function renderScene(scene: typeof sceneTests[number]) {
    const className = categoryClass[scene.category];
    const availableTests = scene.tests.filter(test => test.status === "available");
    const sceneComplete = availableTests.length > 0 && availableTests.every(test => testProgress[scene.id]?.[test.type]?.done);
    const hasAvailableTest = availableTests.length > 0;
    return <article className={`scene-test-card ${hasAvailableTest ? "available" : "unavailable"} ${className}`} key={scene.id}>
      <div className="scene-test-copy">
        <span className={`scene-test-category ${className}`}>{scene.category}</span>
        <h2>{scene.scene}{sceneComplete && <span className="scene-test-scene-complete">已完成</span>}</h2>
        <p className="scene-test-situation">{scene.description}</p>
        {hasAvailableTest
          ? <div className="scene-test-type-grid">{scene.tests.map(test => {
              const progress = testProgress[scene.id]?.[test.type];
              const isComingSoon = test.status === "coming_soon";
              return <section className={`scene-test-type-card ${isComingSoon ? "coming-soon" : "available"}`} key={test.type} aria-label={`${scene.scene} · ${test.label}`}>
                <h3>{test.label}</h3>
                <p className="scene-test-type-meta">{test.count} 题 · 约 {test.minutes} 分钟 <span>{test.difficulty}</span></p>
                <p className="scene-test-type-skills">{test.skills.join(" · ")}</p>
                {isComingSoon
                  ? <span className="scene-test-type-status">即将上线</span>
                  : progress?.done
                    ? <div className="scene-test-type-actions"><span className="scene-test-type-done"><CheckCircle2 size={13}/>{`已完成 · ${progress.score ?? "已完成"}`}</span><button type="button" className="scene-test-type-retry" onClick={onWeatherQuiz}>再做一次 <RotateCcw size={13}/></button></div>
                    : <button type="button" className="scene-test-type-start" onClick={onWeatherQuiz}>开始 <ArrowRight size={14}/></button>}
              </section>;
            })}</div>
          : <div className="scene-test-upcoming-actions">
              <span className="scene-test-status"><LockKeyhole size={12}/>即将上线</span>
              <button className="scene-test-notify" type="button" onClick={() => registerNotification(scene.id)} disabled={notifiedScenes[scene.id]}>
                {notifiedScenes[scene.id] ? "已登记" : <><Bell size={13}/>通知我</>}
              </button>
            </div>}
        {hasAvailableTest && <button className="scene-test-course-link" type="button" onClick={() => onLesson(scene.courseLink.lessonId)}>先复习课程 <ArrowRight size={13}/></button>}
      </div>
    </article>;
  }

  return <section className="scene-test-picker">
    <div className="scene-test-heading">
      <span>LISTEN & PRACTICE · TESTS</span>
      <h1>实战核心输出-小测验</h1>
      <p>
        选一个职场场景，约 5 分钟，测测你能不能
        <span className="scene-test-emphasis">脱口而出</span>。
      </p>
    </div>
    <div className="scene-test-filters" role="group" aria-label="筛选测试场景">
      {filters.map(item => <button type="button" key={item} className={filter === item ? "selected" : ""} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}
    </div>
    {availableScenes.length > 0 && <section className="scene-test-group" aria-labelledby="scene-test-available-title">
      <h2 className="scene-test-group-title" id="scene-test-available-title">已经上线</h2>
      <div className="scene-test-list">{availableScenes.map(renderScene)}</div>
    </section>}
    {upcomingScenes.length > 0 && <section className="scene-test-group" aria-labelledby="scene-test-upcoming-title">
      <h2 className="scene-test-group-title" id="scene-test-upcoming-title">即将开放</h2>
      <div className="scene-test-list">{upcomingScenes.map(renderScene)}</div>
    </section>}
    {filteredScenes.length === 0 && <p className="scene-test-empty">当前分类暂无测试场景。</p>}
  </section>;
}
