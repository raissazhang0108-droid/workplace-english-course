import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ChevronRight, Headphones, House, Menu, Play, Square, Volume2, X } from "lucide-react";
import App from "./App";
import Home from "./Home";
import GlobalHome from "./GlobalHome";
import { extraLessons } from "./data/extraLessons";
import "./training.css";
import "./bright-theme.css";

const sections = ["场景描述", "场景对话", "重点词汇", "即时短句", "表达优化", "小测验"];
const introDialogue = [
  { who: "Sarah", role: "Team lead", en: "Before we jump into the agenda, let's do a quick go-around. David, would you like to kick us off?", zh: "在进入议程前，我们先快速做一轮自我介绍。David，你愿意先开始吗？", phrases: ["jump into", "a quick go-around", "kick us off"] },
  { who: "David", role: "Backend engineer", en: "Sure. Hi everyone, I'm David. I just joined the team as a backend software engineer.", zh: "当然。大家好，我是 David。我刚加入团队，担任后端软件工程师。", phrases: ["joined the team as"] },
  { who: "David", role: "Backend engineer", en: "I'll be focusing mainly on the checkout and order management areas, especially around API reliability and backend integration.", zh: "我将主要负责结账和订单管理模块，尤其是 API 的可靠性和后端集成。", phrases: ["focusing mainly on", "especially around"] },
  { who: "David", role: "Backend engineer", en: "Before this, I worked on e-commerce platforms, so I'm familiar with order flows, inventory logic, and payment-related edge cases.", zh: "在此之前，我做过电商平台，所以比较熟悉订单流程、库存逻辑和支付相关的边界情况。", phrases: ["Before this", "familiar with"] },
  { who: "David", role: "Backend engineer", en: "I'm still getting up to speed on our current architecture, so I may ask a few questions in the beginning.", zh: "我还在熟悉目前的架构，所以刚开始可能会问一些问题。", phrases: ["getting up to speed", "in the beginning"] },
  { who: "David", role: "Backend engineer", en: "Please feel free to loop me in if anything comes up related to checkout, orders, or backend dependencies.", zh: "如果有涉及结账、订单或后端依赖的事情，欢迎随时把我拉进来。", phrases: ["feel free to", "loop me in"] },
  { who: "Jenny", role: "QA engineer", en: "Great to meet you, David. I'm Jenny from QA. Looking forward to partnering with you on release validation.", zh: "很高兴认识你，David。我是 QA 的 Jenny。期待在发布验证工作中与你合作。", phrases: ["Looking forward to partnering with you"] },
  { who: "David", role: "Backend engineer", en: "Sounds great. I'm looking forward to working with everyone.", zh: "太好了。期待和大家一起合作。", phrases: ["Sounds great", "looking forward to working with everyone"] }
];
const introVocabulary = [
  ["kick us off", "带大家开始", "Would you like to kick us off?"],
  ["get up to speed", "熟悉情况，跟上进度", "I'm getting up to speed on the project."],
  ["loop someone in", "让某人参与或知情", "Please loop me in on the discussion."],
  ["be familiar with", "熟悉某事", "I'm familiar with the order flow."],
  ["focus on", "专注于；主要负责", "I'll focus on backend integration."],
  ["look forward to", "期待（后接名词或动名词）", "I look forward to working with you."]
];
const introQuestions = [
  { title: "想表达“我还在熟悉项目”，哪一句更自然？", options: ["I don't know anything.", "I'm still getting up to speed.", "I'm getting faster."], answer: 1, note: "get up to speed 表示熟悉信息、跟上进度，适合刚加入团队时使用。" },
  { title: "Please ___ me in on the discussion.", options: ["loop", "join", "take"], answer: 0, note: "loop someone in 表示让某人参与讨论或了解进展。" },
  { title: "I'm looking forward to ___ with you.", options: ["work", "worked", "working"], answer: 2, note: "look forward to 中的 to 是介词，后面使用 working。" }
];

function Highlight({ text, phrases }: { text: string; phrases: string[] }) {
  const pattern = new RegExp(`(${phrases.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return <>{text.split(pattern).map((part, i) => phrases.some(p => p.toLowerCase() === part.toLowerCase()) ? <mark key={i}>{part}</mark> : part)}</>;
}

export default function Training() {
  const [lessonId, setLessonId] = useState<"intro" | "coffee" | "weather" | "meeting" | "interview">("intro");
  const lesson = lessonId === "intro" ? null : extraLessons[lessonId];
  const dialogue = lesson?.dialogue ?? introDialogue;
  const vocabulary = lesson?.vocabulary ?? introVocabulary;
  const questions = lesson?.questions ?? introQuestions;
  const title = lesson?.title ?? "新员工自我介绍";
  const english = lesson?.english ?? "Quick Intro";
  const category = lessonId === "interview" ? "Interviews" : lessonId === "meeting" ? "Meetings" : "Small Talk";
  const [view, setView] = useState<"home" | "global" | "course" | "listening">(() => new URLSearchParams(window.location.search).get("home") === "global" ? "global" : "home");
  const [activeSection, setActiveSection] = useState(0);
  const [menu, setMenu] = useState(false);
  const [translations, setTranslations] = useState(true);
  const [speaking, setSpeaking] = useState<number | null>(null);
  const [speechError, setSpeechError] = useState("");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [completion, setCompletion] = useState(() => {
    const read = (key: string) => { try { return localStorage.getItem(key) === "true"; } catch { return false; } };
    return { intro: read("quick-intro-complete"), coffee: read("coffee-complete"), weather: read("weather-complete"), meeting: read("meeting-complete"), interview: read("interview-complete") };
  });
  const completed = completion[lessonId];

  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);
  useEffect(() => {
    if (view !== "course") return;
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActiveSection(Number(visible[0].target.getAttribute("data-section")));
    }, { rootMargin: "-85px 0px -55% 0px", threshold: 0 });
    document.querySelectorAll("[data-section]").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [view, lessonId]);

  function navigateSection(index: number) {
    setActiveSection(index); setMenu(false);
    document.getElementById(`section-${index}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function speak(index: number) {
    if (!("speechSynthesis" in window)) { setSpeechError("当前浏览器不支持朗读，请使用 Chrome 或 Safari。"); return; }
    window.speechSynthesis.cancel();
    if (speaking === index) { setSpeaking(null); return; }
    setSpeechError("");
    const utterance = new SpeechSynthesisUtterance(dialogue[index].en);
    utterance.lang = "en-US"; utterance.rate = 0.88;
    const voice = window.speechSynthesis.getVoices().find(v => v.lang === "en-US");
    if (voice) utterance.voice = voice;
    utterance.onend = () => setSpeaking(current => current === index ? null : current);
    utterance.onerror = event => { if (event.error !== "canceled" && event.error !== "interrupted") { setSpeaking(null); setSpeechError("朗读暂时不可用，请检查设备的英语语音设置。"); } };
    setSpeaking(index); window.speechSynthesis.speak(utterance);
  }
  function changeView(next: "home" | "global" | "course" | "listening") {
    window.speechSynthesis?.cancel(); setSpeaking(null); setView(next); setMenu(false); window.scrollTo(0, 0);
  }
  function openLesson(id: "intro" | "coffee" | "weather" | "meeting" | "interview") {
    if (id !== lessonId) { setAnswers({}); setSubmitted(false); setActiveSection(0); setSpeechError(""); }
    setLessonId(id); changeView("course");
  }
  function toggleComplete() {
    const next = !completed; setCompletion({ ...completion, [lessonId]: next });
    try { localStorage.setItem(lessonId === "intro" ? "quick-intro-complete" : `${lessonId}-complete`, String(next)); } catch { /* Completion remains available for this session. */ }
  }
  const score = questions.filter((q, i) => answers[i] === q.answer).length;

  return <div className="training">
    <header className="training-header">
      <button className="mobile-menu icon-button" aria-label={menu ? "关闭课程目录" : "打开课程目录"} onClick={() => setMenu(!menu)}>{menu ? <X size={20}/> : <Menu size={20}/>}</button>
      <a className="brand" href="#" onClick={event => { event.preventDefault(); changeView("home"); }}><span className="brand-icon"><BookOpen size={21}/></span><strong>English at Work</strong><span className="brand-cn">职场英语练习室</span></a>
      <span className="header-note">一点练习，多一份从容</span>
      <span className="user-avatar" aria-label="学习者">我</span>
    </header>

    <aside className={`course-sidebar ${menu ? "is-open" : ""}`}>
      <div className="workspace-label">你的学习空间</div>
      <button className={`course-switch ${view === "home" ? "selected" : ""}`} onClick={() => changeView("home")}><House size={18}/><span>学习首页</span><ChevronRight size={15}/></button>
      <button className={`course-switch ${view === "global" ? "selected" : ""}`} onClick={() => changeView("global")}><BookOpen size={18}/><span>全球化实战首页</span><ChevronRight size={15}/></button>
      <button className={`course-switch ${view === "course" ? "selected" : ""}`} onClick={() => changeView("course")}><BookOpen size={18}/><span>职场场景课</span><ChevronRight size={15}/></button>
      <button className={`course-switch ${view === "listening" ? "selected" : ""}`} onClick={() => changeView("listening")}><Headphones size={18}/><span>听力与跟读</span><ChevronRight size={15}/></button>
      <div className="sidebar-rule"/>
      <div className="workspace-label">SMALL TALK · 日常沟通</div>
      <div className="lesson-picker">{(["intro", "coffee", "weather"] as const).map(id => <button key={id} className={`sidebar-lesson ${lessonId === id && view === "course" ? "chosen" : ""}`} onClick={() => openLesson(id)}><span className="lesson-dot"/>{id === "intro" ? "新员工自我介绍" : extraLessons[id].title}{completion[id] && <Check size={13}/>}</button>)}</div>
      <div className="workspace-label">MEETINGS · 会议沟通</div>
      <div className="lesson-picker" role="group" aria-label="会议沟通课程"><button className={`sidebar-lesson ${lessonId === "meeting" && view === "course" ? "chosen" : ""}`} onClick={() => openLesson("meeting")}><span className="lesson-dot"/>英文会议·开场{completion.meeting && <Check size={13}/>}</button></div>
      <div className="workspace-label">INTERVIEWS · 面试英语</div>
      <div className="lesson-picker" role="group" aria-label="面试英语课程"><button className={`sidebar-lesson ${lessonId === "interview" && view === "course" ? "chosen" : ""}`} onClick={() => openLesson("interview")}><span className="lesson-dot"/>面试自我介绍{completion.interview && <Check size={13}/>}</button></div>
      <nav aria-label="课程目录">{sections.map((title, i) => <button key={title} className={view === "course" && activeSection === i ? "active" : ""} onClick={() => { if(view !== "course") { changeView("course"); requestAnimationFrame(() => navigateSection(i)); } else navigateSection(i); }}><span>{String(i + 1).padStart(2, "0")}</span>{title}</button>)}</nav>
      <div className="sidebar-footer"><span>本课学习状态</span><strong>{completed ? "已完成" : "学习中"}</strong><div className="progress-track"><i style={{width: completed ? "100%" : `${(activeSection + 1) / sections.length * 100}%`}}/></div><small>{completed ? "继续复习，巩固表达" : "按自己的节奏，一节一节来"}</small></div>
    </aside>

    <main className="course-main">
      {view !== "home" && view !== "global" && <div className="breadcrumbs"><button onClick={() => changeView("home")}>学习首页</button> <ChevronRight size={13}/> {view === "course" ? category : "听力与跟读"} <ChevronRight size={13}/> <span>{view === "course" ? english : "Celebrate Good News"}</span></div>}
      {view === "global" ? <GlobalHome onLesson={openLesson} onListening={() => changeView("listening")} onOriginal={() => changeView("home")}/> : view === "home" ? <Home completed={completion.intro} completion={completion} onOpen={next => next === "course" ? openLesson("intro") : changeView(next)} onLesson={openLesson}/> : view === "listening" ? <div className="listening-view"><button className="text-button" onClick={() => changeView("course")}><ArrowLeft size={16}/> 返回场景课</button><h1>听力与跟读</h1><p>How to Congratulate Someone in English</p><App/></div> : <article className="lesson-document">
        <div className="lesson-heading"><div className="lesson-kicker">{category.toUpperCase()} <span>LESSON {lesson?.number ?? "01"}</span></div><h1>{title} <span>{english}</span></h1><p>{lesson?.subtitle ?? "用自然、清晰的英语，让新同事认识你。"}</p><div className="lesson-meta"><span>职场沟通</span><span>A2–B1</span><span>约 15 分钟</span><span>{dialogue.length} 句场景对话</span></div></div>
        <section id="section-0" data-section="0"><h2><span>01</span>场景描述 <small>The situation</small></h2><div className="scenario"><div className="scenario-label">{lesson?.scene ?? "第一次团队会议"}</div>{lesson ? lesson.description.map(p => <p key={p}>{p}</p>) : <><p>刚加入团队，或第一次参加跨团队会议时，主持人可能会邀请你做一个 <strong>quick intro</strong>。不用把履历讲满，说清楚<strong>你是谁、负责什么、如何协作</strong>就好。</p><p>还在熟悉工作也没关系。用 <mark>I'm still getting up to speed.</mark> 坦诚说明状态，再表达参与合作的意愿。</p></>}<div className="intro-formula">{(lesson?.formula ?? ["打招呼", "姓名与角色", "负责范围", "相关经历", "协作意愿"]).map((s,i) => <span key={s}>{i > 0 && <ArrowRight size={13}/>} {s}</span>)}</div></div></section>
        <section id="section-1" data-section="1"><div className="section-heading"><h2><span>02</span>场景对话 <small>Dialogue</small></h2><label className="translation-toggle"><input type="checkbox" checked={translations} onChange={e => setTranslations(e.target.checked)}/>中文翻译</label></div><div className="dialogue-meta"><span>{lesson?.speakers ?? "Sarah · 团队负责人 / David · 后端工程师 / Jenny · QA"}</span><span><Volume2 size={13}/> 合成语音</span></div>{speechError && <p role="alert" className="speech-error">{speechError}</p>}
          {(lesson?.groups ?? [{title: "", start: 0, end: dialogue.length}]).map(group => <div className="dialogue-group" key={group.start}>{group.title && <h3>{group.title}</h3>}<div className={`dialogue-table ${!translations ? "english-only" : ""}`} role="table" aria-label={`${title}双语对话 ${group.title}`}><div className="dialogue-table-head" role="row"><span role="columnheader">讲述人</span><span role="columnheader">ENGLISH</span>{translations && <span role="columnheader">中文释义</span>}<span role="columnheader">朗读</span></div>{dialogue.slice(group.start, group.end).map((line, offset) => { const i = group.start + offset; return <div role="row" className={`dialogue-line ${speaking === i ? "is-speaking" : ""}`} key={i}><div role="cell" className="speaker"><span className={`speaker-avatar ${line.who.toLowerCase()}`}>{line.who[0]}</span><span>{line.who}</span></div><p role="cell" className="dialogue-english"><Highlight text={line.en} phrases={line.phrases}/></p>{translations && <p role="cell" className="dialogue-chinese">{line.zh}</p>}<div role="cell" className="speech-cell"><button className="speak-button" title={speaking === i ? "停止朗读" : `朗读 ${line.who} 第 ${i+1} 句`} aria-label={speaking === i ? "停止朗读" : `朗读第 ${i+1} 句`} onClick={() => speak(i)}>{speaking === i ? <Square size={15}/> : <Play size={15}/>}</button><small>{String(i+1).padStart(2,"0")}</small></div></div>; })}</div></div>)}
        </section>
        <section id="section-2" data-section="2"><h2><span>03</span>重点词汇 <small>Vocabulary</small></h2><div className="vocabulary-list">{vocabulary.map(([en, zh, example]) => <div key={en}><strong>{en}</strong><span>{zh}</span><p>{example}</p></div>)}</div></section>
        <section id="section-3" data-section="3"><h2><span>04</span>即时短句 <small>Quick pings</small></h2><div className="phrase-list">{(lesson?.pings ?? [["Great to meet you.", "很高兴认识你。"], ["Feel free to reach out.", "欢迎随时联系我。"], ["Happy to help.", "很乐意帮忙。"], ["Thanks for the warm welcome.", "谢谢大家的热情欢迎。"]]).map(([en, zh]) => <p key={en}><strong>{en}</strong><span>{zh}</span></p>)}</div></section>
        <section id="section-4" data-section="4"><h2><span>05</span>表达优化 <small>Better wording</small></h2><div className="wording"><div><small>比较生硬</small><p>{lesson?.wording[0] ?? "I don't know much yet."}</p></div><ArrowRight size={18}/><div><small>自然、有合作感</small><p>{lesson?.wording[1] ?? "I'm still getting up to speed."}</p></div></div><p className="section-note">{lesson?.wording[2] ?? "承认自己正在学习，同时传达主动了解情况的态度。"}</p></section>
        <section id="section-5" data-section="5"><h2><span>06</span>小测验 <small>Check your understanding</small></h2><form onSubmit={e => { e.preventDefault(); setSubmitted(true); }}>{questions.map((q, i) => <fieldset key={q.title}><legend><span>{i+1}.</span> {q.title}</legend><div className="answer-options">{q.options.map((option, j) => <label key={option} className={submitted && j === q.answer ? "correct" : submitted && answers[i] === j ? "incorrect" : ""}><input type="radio" name={`question-${i}`} checked={answers[i] === j} onChange={() => {setAnswers({...answers, [i]: j}); setSubmitted(false);}}/><span>{option}</span>{submitted && j === q.answer && <Check size={16}/>}</label>)}</div>{submitted && <p className="answer-note">{q.note}</p>}</fieldset>)}<div className="quiz-actions"><button className="primary-button" type="submit" disabled={Object.keys(answers).length < questions.length}>检查答案 <ArrowRight size={15}/></button>{submitted && <span role="status">答对 {score} / {questions.length} 题{score === questions.length ? "，全部正确！" : "，再看一遍解析吧。"}</span>}</div></form></section>
        <footer className="lesson-end"><div><strong>每一次开口，都是进步。</strong><p>{lesson?.practice ?? "试着用今天的表达，做一次自己的 quick intro。"}</p></div><button className={completed ? "complete-button done" : "complete-button"} onClick={toggleComplete}><CheckCircle2 size={18}/>{completed ? "已完成本课" : "标记为已完成"}</button></footer>
      </article>}
    </main>
  </div>;
}
