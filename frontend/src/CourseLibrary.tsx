import { type ReactNode, useState } from "react";
import { ArrowRight, BriefcaseBusiness, Coffee, CloudSun, Headphones, MessageCircle, Presentation } from "lucide-react";
import { extraLessons } from "./data/extraLessons";

type LessonId = "intro" | "coffee" | "weather" | "meeting" | "interview";

type CourseLibraryProps = {
  completed: boolean;
  completion: Record<LessonId, boolean>;
  onOpen: (view: "course" | "listening") => void;
  onLesson: (id: LessonId) => void;
  sectionTitle?: string;
  showCaption?: boolean;
};

const interviewQuote = extraLessons.interview.dialogue.find(line =>
  line.who === "Jenny" &&
  line.en.startsWith("My core expertise is designing and implementing scalable test automation frameworks from scratch.")
);

if (!interviewQuote) {
  throw new Error("Could not find the featured interview dialogue line for the course card.");
}

const interviewPreviewLine = `${interviewQuote.en.split(". ")[0]}.`;

function SmallTalkCard({ theme, title, subtitle, coreOutput, stats, completed, actionLabel, onAction, icon }: {
  theme: "intro" | "coffee" | "weather";
  title: string;
  subtitle: string;
  coreOutput: string;
  stats: string[];
  completed: boolean;
  actionLabel: string;
  onAction: () => void;
  icon: ReactNode;
}) {
  return <article className="home-course-card structured-course-card">
    <div className={`course-preview structured-course-preview extra-preview ${theme}`}>
      <div className="structured-course-copy"><span className="preview-label">日常沟通 · SMALL TALK</span><h3>{title}</h3><p>{subtitle}</p></div>
      {icon}
    </div>
    <div className="course-card-content structured-course-content">
      <span className="course-example-label">实战核心输出 (Core Output)：</span>
      <blockquote className="course-example-quote">{coreOutput}</blockquote>
      <p className="structured-course-meta">{stats.join(" · ")}</p>
      <div className="structured-course-actions"><span className={`course-status ${completed ? "complete" : ""}`}>{completed ? "✓ 已学完 · 可复习" : "尚未开始"}</span><button className="course-primary-action" onClick={onAction}>{actionLabel}<ArrowRight size={16}/></button></div>
    </div>
  </article>;
}

export default function CourseLibrary({ completed, completion, onOpen, onLesson, sectionTitle = "课程与练习", showCaption = true }: CourseLibraryProps) {
  const [filter, setFilter] = useState("全部课程");

  const courseCounts: Record<string, number> = {
    "全部课程": Object.keys(extraLessons).length + 2,
    "Small Talk": 3,
    "职场会议": 1,
    "面试通关": 1,
    "听力跟读": 1
  };

  return <section className="home-library">
    <div className="home-section-title"><h2>{sectionTitle}</h2>{showCaption && <span>让每一次沟通，都更有把握</span>}</div>
    <div className="home-filters" role="tablist" aria-label="课程分类">{["全部课程", "Small Talk", "职场会议", "面试通关", "听力跟读"].map(item => <button role="tab" key={item} aria-selected={filter === item} onClick={() => setFilter(item)}>{item}<span>{courseCounts[item]}</span></button>)}</div>
    <div className={`home-course-grid${filter === "Small Talk" ? " home-course-grid-small-talk" : ""}`} role="tabpanel" aria-label={`${filter}课程`}>
      {(filter === "全部课程" || filter === "面试通关") && <article className="home-course-card structured-course-card"><div className="course-preview structured-course-preview extra-preview interview"><div className="structured-course-copy"><span className="preview-label">面试英语 · INTERVIEWS</span><h3>面试自我介绍</h3><p>用 5 步结构讲清你的经历、优势和代表项目</p></div><BriefcaseBusiness size={34} aria-hidden="true"/></div><div className="course-card-content structured-course-content"><span className="course-example-label">实战核心输出 (Core Output)：</span><blockquote className="course-example-quote">{interviewPreviewLine}</blockquote><p className="structured-course-meta">A2–B1 · 约 15 分钟 · {extraLessons.interview.dialogue.length} 句对话 · 3 道小测验</p><div className="structured-course-actions"><span className={`course-status ${completion.interview ? "complete" : ""}`}>{completion.interview ? "✓ 已学完 · 可复习" : "尚未开始"}</span><button className="course-primary-action" aria-label={`${completion.interview ? "复习" : "学习"}面试自我介绍`} onClick={() => onLesson("interview")}>{completion.interview ? "复习课程" : "开始学习"}<ArrowRight size={16}/></button></div></div></article>}
      {(filter === "全部课程" || filter === "职场会议") && <article className="home-course-card structured-course-card"><div className="course-preview structured-course-preview extra-preview meeting"><div className="structured-course-copy"><span className="preview-label">会议沟通 · MEETINGS</span><h3>英文会议·开场</h3><p>从感谢出席到明确议程，练好会议开场</p></div><Presentation size={34} aria-hidden="true"/></div><div className="course-card-content structured-course-content"><span className="course-example-label">实战核心输出 (Core Output)：</span><blockquote className="course-example-quote">{extraLessons.meeting.dialogue[0].en}</blockquote><p className="structured-course-meta">A2–B1 · 约 15 分钟 · {extraLessons.meeting.dialogue.length} 句对话 · 3 道小测验</p><div className="structured-course-actions"><span className={`course-status ${completion.meeting ? "complete" : ""}`}>{completion.meeting ? "✓ 已学完 · 可复习" : "尚未开始"}</span><button className="course-primary-action" aria-label={`${completion.meeting ? "复习" : "学习"}英文会议·开场`} onClick={() => onLesson("meeting")}>{completion.meeting ? "复习课程" : "开始学习"}<ArrowRight size={16}/></button></div></div></article>}
      {(filter === "全部课程" || filter === "Small Talk") && (
        <SmallTalkCard theme="intro" title="新员工自我介绍" subtitle="Quick Intro · 自然开启第一次团队对话" coreOutput="Hi everyone, I'm David. I just joined the team." stats={["A2–B1", "约 15 分钟", "8 句对话", "3 道小测验"]} completed={completed} actionLabel={completed ? "复习课程" : "开始学习"} onAction={() => onOpen("course")} icon={<MessageCircle size={34} aria-hidden="true" />} />
      )}
      {(filter === "全部课程" || filter === "Small Talk") && (["coffee", "weather"] as const).map(id => {
        const lesson = extraLessons[id];
        const coreOutput = id === "coffee" ? "Would you be open to a coffee chat?" : "How's the weather looking today?";
        const icon = id === "coffee" ? <Coffee size={34} aria-hidden="true"/> : <CloudSun size={36} aria-hidden="true"/>;
        return <SmallTalkCard
          key={id}
          theme={id}
          title={lesson.title}
          subtitle={lesson.english}
          coreOutput={coreOutput}
          stats={["A2–B1", "约 15 分钟", `${lesson.dialogue.length} 句对话`, "3 道小测验"]}
          completed={completion[id]}
          actionLabel={completion[id] ? "复习课程" : "开始学习"}
          onAction={() => onLesson(id)}
          icon={icon}
        />;
      })}
      {(filter === "全部课程" || filter === "听力跟读") && <article className="home-course-card"><div className="course-preview audio-preview"><img src="/listening-player-background.jpg" alt="听力播放器背景"/><span className="audio-label"><Headphones size={14}/> LISTEN & PRACTICE</span></div><div className="course-card-content"><span className="course-type coral"><Headphones size={13}/> 听力跟读</span><h3>用英语祝贺好消息</h3><p>Celebrate Good News · 和别人分享喜悦</p><div className="home-course-meta"><span>原声听力</span><span>同步字幕</span><span>9 分 18 秒</span></div><button onClick={() => onOpen("listening")}>开始听力练习<ArrowRight size={17}/></button></div></article>}
    </div>
  </section>;
}
