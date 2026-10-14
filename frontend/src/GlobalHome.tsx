import { ArrowRight, ArrowUpRight, AudioLines, BookOpen, CheckCircle2, Clock3, Globe2, Map, MessageCircle } from "lucide-react";
import CourseLibrary from "./CourseLibrary";
import "./global-home.css";

const source = "https://my.feishu.cn/wiki/SuYew2H9ziRSl5kLnD7cKXCenCe";
type LessonId = "intro" | "coffee" | "weather" | "meeting" | "interview";

export default function GlobalHome({ onLesson, onListening, completion }: { onLesson: (id: LessonId) => void; onListening: () => void; completion: Record<LessonId, boolean> }) {
  return <div className="global-home">
    <div className="global-topline"><span><Globe2 size={15}/> GLOBAL WORKPLACE ENGLISH</span></div>
    <header className="global-heading"><h1>科技大厂全球化职场英语实战</h1><p className="global-description">面向工程师、产品、QA 与跨国协作团队。把会议、协作、面试与 AI 工作流，变成你的英语练习场。</p></header>
    <div className="global-stats"><div><span className="global-stat-value"><BookOpen size={19} aria-hidden="true"/><strong>08</strong></span><span>课程体系模块</span></div><div><span className="global-stat-value"><Map size={19} aria-hidden="true"/><strong>184</strong></span><span>原课程规划场景</span></div><div><span className="global-stat-value"><MessageCircle size={19} aria-hidden="true"/><strong>300+</strong></span><span>原课程精选语料</span></div><div><span className="global-stat-value"><CheckCircle2 size={19} aria-hidden="true"/><strong>05</strong></span><span>本站可学场景课</span></div></div>
    <section className="global-start-feature"><div className="meeting-feature-heading"><h2>{completion.intro ? "温故知新" : "从这里开始"}</h2><span>SMALL STEPS, REAL PROGRESS</span></div><div className="meeting-feature-content"><span className="meeting-feature-icon"><MessageCircle size={25}/></span><div className="meeting-feature-copy"><span>职场场景课 · SMALL TALK</span><h3>新员工自我介绍</h3><p>介绍你的角色、负责范围，以及合作意愿。</p><div className="meeting-feature-meta"><span><Clock3 size={13}/>15 分钟</span><span>A2–B1</span><span>{completion.intro ? "已完成 · 可复习" : "双语对话 + 练习"}</span></div></div><button onClick={()=>onLesson("intro")}>{completion.intro ? "复习本课" : "进入学习"} <ArrowRight size={17}/></button></div></section>
    <div className="global-home-divider" aria-hidden="true"/>
    <CourseLibrary completed={completion.intro} completion={completion} onOpen={view => view === "course" ? onLesson("intro") : onListening()} onLesson={onLesson} sectionTitle="实战场景地图" showCaption={false}/>
    <div className="global-layout"><div className="global-primary">
      <section className="global-method"><div className="global-section-heading"><h2>看 · 查 · 练</h2><span>把理解变成表达</span></div><div className="method-steps"><div><span>01 / 看</span><h3>先进入场景</h3><p>听懂对话，理解沟通目标与表达方式。</p></div><div><span>02 / 查</span><h3>找到你的句子</h3><p>查看双语释义、核心短语与表达替换。</p></div><div><span>03 / 练</span><h3>换成你的故事</h3><p>跟读、复述，再用自己的工作情境练习。</p></div></div></section>
    </div><aside className="global-right">
      <button className="global-listen" onClick={onListening}><img src="/listening-player-background.jpg" alt="听力播放器背景"/><div><span><AudioLines size={13}/> 原声听力</span><h3>用英语祝贺好消息</h3><p>同步字幕 · 9 分 18 秒 <ArrowRight size={15}/></p></div></button>
    </aside></div>
    <footer className="global-footer"><BookOpen size={15}/><span>内容结构参考飞书课程介绍。本站已收录课程可直接学习，其余模块可查看原课程说明。</span><a href={source} target="_blank" rel="noreferrer">来源文档 <ArrowUpRight size={13}/></a></footer>
  </div>;
}
