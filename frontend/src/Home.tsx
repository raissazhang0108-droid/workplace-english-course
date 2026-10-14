import { useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Clock3, MessageCircle, RefreshCw, Sparkles } from "lucide-react";
import CourseLibrary from "./CourseLibrary";
import { extraLessons } from "./data/extraLessons";

const expressions = [
  ["I'm still getting up to speed.", "我还在熟悉情况。", "刚加入团队时，坦诚表达自己的学习状态。"],
  ["Feel free to loop me in.", "欢迎随时把我拉进来。", "主动参与项目讨论，让同事感受到你的合作意愿。"],
  ["Looking forward to working with you.", "期待与你合作。", "用一句自然的表达，为自我介绍收尾。"]
];

export default function Home({ completed, completion, onOpen, onLesson }: { completed: boolean; completion: Record<"intro" | "coffee" | "weather" | "meeting" | "interview", boolean>; onOpen: (view: "course" | "listening") => void; onLesson: (id: "intro" | "coffee" | "weather" | "meeting" | "interview") => void }) {
  const [expression, setExpression] = useState(0);
  const phrase = expressions[expression];
  return <div className="learning-home">
    <header className="home-heading"><div><div className="home-eyebrow">YOUR EVERYDAY ENGLISH</div><h1>职场英语</h1><p>从一句自我介绍开始，把英语用进每一天的工作。</p></div><span className="home-heading-label"><Sparkles size={16}/> 学一点，用一点</span></header>

    <div className="home-overview" aria-label="课程概览"><div><BookOpen size={20}/><span><strong>{Object.keys(extraLessons).length + 2}</strong> 个学习内容</span></div><div><MessageCircle size={20}/><span><strong>{8 + Object.values(extraLessons).reduce((total, lesson) => total + lesson.dialogue.length, 0)}</strong> 句场景对话</span></div><div><CheckCircle2 size={20}/><span><strong>{Object.values(completion).filter(Boolean).length}</strong> / {Object.keys(completion).length} 场景课已完成</span></div></div>

    <section className="home-next"><div className="home-section-title"><h2>{completed ? "温故知新" : "从这里开始"}</h2><span>SMALL STEPS, REAL PROGRESS</span></div><div className="next-content"><span className="next-icon"><MessageCircle size={30}/></span><div className="next-copy"><span className="home-overline">职场场景课 · SMALL TALK</span><h3>新员工自我介绍</h3><p>介绍你的角色、负责范围，以及合作意愿。</p><div className="home-course-meta"><span><Clock3 size={13}/> 15 分钟</span><span>A2–B1</span><span>{completed ? "已完成 · 可复习" : "双语对话 + 练习"}</span></div></div><button className="primary-button" onClick={() => onOpen("course")}>{completed ? "复习本课" : "进入学习"}<ArrowRight size={17}/></button></div></section>

    <CourseLibrary completed={completed} completion={completion} onOpen={onOpen} onLesson={onLesson}/>

    <section className="home-expression"><div className="expression-heading"><span><Sparkles size={17}/> 随手学一句</span><button className="icon-button" onClick={() => setExpression((expression + 1) % expressions.length)} aria-label="换一句表达" title="换一句表达"><RefreshCw size={17}/></button></div><div className="expression-body" aria-live="polite"><blockquote>{phrase[0]}</blockquote><p>{phrase[1]}</p><span>{phrase[2]}</span></div><button className="text-button" onClick={() => onOpen("course")}>在场景中学习 <ArrowRight size={15}/></button></section>
    <footer className="home-footer"><BookOpen size={15}/><span>English at Work</span><span>每天一点练习，每次多一点自信。</span></footer>
  </div>;
}
