import { useState } from "react";
import { ArrowRight, ArrowUpRight, AudioLines, BookOpen, BriefcaseBusiness, Check, Code2, GitBranch, Globe2, MessageCircle, MessagesSquare, Mic2, Presentation, Search, Sparkles } from "lucide-react";
import "./global-home.css";

const source = "https://my.feishu.cn/wiki/SuYew2H9ziRSl5kLnD7cKXCenCe";
type LessonId = "intro" | "coffee" | "weather" | "meeting" | "interview";
const modules: {title: string; en: string; icon: typeof Presentation; description: string; topics: string[]; lessons: {id: LessonId; title: string}[]}[] = [
  { title: "英文会议控场与推动", en: "Meetings", icon: Presentation, description: "从开场、引导和插话，到推动决策、总结行动项。", topics: ["会议开场", "礼貌插话", "推动决策", "总结与跟进"], lessons: [{id:"meeting",title:"英文会议·开场"}] },
  { title: "项目管理与敏捷协作", en: "Agile collaboration", icon: GitBranch, description: "在站会、迭代规划和复盘中，对齐进度、范围与阻碍。", topics: ["Standup 站会", "Sprint 规划", "范围调整", "Retro 复盘"], lessons: [] },
  { title: "PM、研发与测试实战", en: "Engineering", icon: Code2, description: "讲清需求、技术方案与测试范围，让跨职能协作更顺畅。", topics: ["需求澄清", "技术方案", "测试范围", "发布与降级"], lessons: [] },
  { title: "面试表达与职场晋升", en: "Interviews & growth", icon: BriefcaseBusiness, description: "用项目成果和业务影响，清楚呈现你的专业价值。", topics: ["自我介绍", "STAR 故事", "System Design", "Offer 沟通"], lessons: [{id:"interview",title:"面试自我介绍"}] },
  { title: "Small Talk 职场社交", en: "Everyday connections", icon: MessageCircle, description: "从第一次见面到轻松约聊，与国际团队自然建立连接。", topics: ["自我介绍", "Coffee Chat", "天气与周末", "夸奖与祝贺"], lessons: [{id:"intro",title:"新员工自我介绍"},{id:"coffee",title:"破冰与约聊"},{id:"weather",title:"天气与环境"}] },
  { title: "大厂日常高频沟通", en: "Daily communication", icon: MessagesSquare, description: "写出清楚的异步消息，得体地沟通边界、风险和求助。", topics: ["Slack / Teams", "TL;DR", "职责边界", "Escalation"], lessons: [] },
  { title: "职场沟通高频语句", en: "Expression library", icon: AudioLines, description: "积累常用表达，在不同语境中反复练习和应用。", topics: ["高频表达", "语境与语调", "句型替换", "情境复述"], lessons: [] },
  { title: "AI 跨职能高效工作流", en: "AI at work", icon: Sparkles, description: "用英语说明如何借助 AI 编写文档、调试代码和改进测试。", topics: ["AI Assistant", "代码重构", "Debug", "测试用例梳理"], lessons: [] }
];

export default function GlobalHome({ onLesson, onListening, onOriginal }: { onLesson: (id: LessonId) => void; onListening: () => void; onOriginal: () => void }) {
  const [selected, setSelected] = useState(0);
  const [search, setSearch] = useState("");
  const [onlyReady, setOnlyReady] = useState(false);
  const current = modules[selected];
  const shown = modules.map((m,i) => ({...m,index:i})).filter(m => (!onlyReady || m.lessons.length > 0) && `${m.title} ${m.en} ${m.topics.join(" ")}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <div className="global-home">
    <div className="global-topline"><span><Globe2 size={15}/> GLOBAL WORKPLACE ENGLISH</span><button onClick={onOriginal}>经典首页 <ArrowRight size={14}/></button></div>
    <header className="global-heading"><h1>科技大厂全球化职场英语实战</h1><p className="global-tagline">从真实工作场景，练到自信开口。</p><p className="global-description">面向工程师、产品、QA 与跨国协作团队。把会议、协作、面试与 AI 工作流，变成你的英语练习场。</p></header>
    <div className="global-stats"><div><strong>08</strong><span>课程体系模块</span></div><div><strong>184</strong><span>原课程规划场景</span></div><div><strong>300+</strong><span>原课程精选语料</span></div><div><strong>05</strong><span>本站可学场景课</span></div></div>
    <div className="global-layout"><div className="global-primary">
      <section className="global-catalog"><div className="global-section-heading"><h2>实战场景地图</h2><a href={source} target="_blank" rel="noreferrer">完整课程介绍 <ArrowUpRight size={14}/></a></div><div className="global-tools"><label className="global-search"><Search size={16}/><input aria-label="搜索课程模块" value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜索场景：会议、面试、AI…"/></label><label className="ready-filter"><input type="checkbox" checked={onlyReady} onChange={e=>setOnlyReady(e.target.checked)}/>仅看可学</label></div>
        <div className="global-module-grid">{shown.map(m => <button key={m.en} className={`global-module ${selected === m.index ? "selected" : ""}`} onClick={()=>setSelected(m.index)} aria-pressed={selected === m.index}><div className="module-symbol"><m.icon size={21}/><span>{String(m.index+1).padStart(2,"0")}</span></div><h3>{m.title}</h3><p>{m.description}</p><div className="module-bottom"><span className={m.lessons.length ? "available" : ""}>{m.lessons.length ? `${m.lessons.length} 节可学` : "课程规划"}</span><ArrowRight size={15}/></div></button>)}</div>{shown.length === 0 && <p role="status" className="global-empty">没有匹配的模块。试试“会议”“面试”或“AI”。</p>}
        <div className="global-module-detail" aria-live="polite"><div><span className="global-overline">{current.en}</span><h3>{current.title}</h3><p>{current.topics.join(" · ")}</p></div>{current.lessons.length > 0 ? <div className="module-lessons">{current.lessons.map(l=><button key={l.id} onClick={()=>onLesson(l.id)}>{l.title}<ArrowRight size={15}/></button>)}</div> : <div className="module-planned"><p>该模块在原课程规划中，本站暂未收录具体课程。</p><a href={source} target="_blank" rel="noreferrer">查看原课程说明 <ArrowUpRight size={14}/></a></div>}</div>
      </section>
      <section className="global-method"><div className="global-section-heading"><h2>看 · 查 · 练</h2><span>把理解变成表达</span></div><div className="method-steps"><div><span>01 / 看</span><h3>先进入场景</h3><p>听懂对话，理解沟通目标与表达方式。</p></div><div><span>02 / 查</span><h3>找到你的句子</h3><p>查看双语释义、核心短语与表达替换。</p></div><div><span>03 / 练</span><h3>换成你的故事</h3><p>跟读、复述，再用自己的工作情境练习。</p></div></div></section>
    </div><aside className="global-right">
      <section className="global-start"><span className="global-overline">START HERE</span><h2>下一场会议，<br/>从你开场。</h2><p>感谢出席、明确议程、邀请汇报。先练好开场的第一分钟。</p><button onClick={()=>onLesson("meeting")}>开始会议课 <ArrowRight size={17}/></button><small>7 段双语对话 · 约 15 分钟</small></section>
      <section className="global-week"><div className="global-section-heading"><h2>本周练习建议</h2><Mic2 size={17}/></div><p>少量、高频，把句子用起来。</p><ul><li><span>01</span><div><strong>吃透 2 个场景</strong><small>先会议开场，再自我介绍</small></div></li><li><span>02</span><div><strong>安排 4 次开口练习</strong><small>跟读、复述与角色互换</small></div></li><li><span>03</span><div><strong>周末集中复习</strong><small>脱离文稿，模拟一次真实沟通</small></div></li></ul><div className="week-note"><Check size={14}/> 从短句开始，再练完整对话</div></section>
      <button className="global-listen" onClick={onListening}><img src="/lesson-background.png" alt="Annmarie 英语听力课程"/><div><span><AudioLines size={13}/> 原声听力</span><h3>用英语祝贺好消息</h3><p>同步字幕 · 9 分 18 秒 <ArrowRight size={15}/></p></div></button>
    </aside></div>
    <footer className="global-footer"><BookOpen size={15}/><span>内容结构参考飞书课程介绍。本站已收录课程可直接学习，其余模块可查看原课程说明。</span><a href={source} target="_blank" rel="noreferrer">来源文档 <ArrowUpRight size={13}/></a></footer>
  </div>;
}
