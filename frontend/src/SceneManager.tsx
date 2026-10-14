import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, FilePlus2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import {
  createScene,
  deleteScene,
  listScenes,
  updateScene,
  type SceneDialogueLine,
  type SceneLessonPayload,
  type SceneLessonRecord,
  type ScenePhraseItem,
  type SceneVocabularyItem,
  type SceneWordingExample,
} from "./lib/sceneAdminApi";
import "./scene-manager.css";

const categories = ["Small Talk", "会议沟通", "面试英语", "IT场景", "其他"];

function blankScene(): SceneLessonPayload {
  return {
    courseKey: "",
    title: "",
    englishTitle: "",
    category: "Small Talk",
    subtitle: "",
    level: "A2–B1",
    durationMinutes: 15,
    sceneLabel: "",
    description: [],
    formula: [],
    speakers: "",
    dialogue: [],
    vocabulary: [],
    quickPhrases: [],
    wordingExamples: [],
    practice: "",
  };
}

const blankDialogue = (): SceneDialogueLine => ({ speaker: "", role: "", en: "", zh: "", phrases: [] });
const blankVocabulary = (): SceneVocabularyItem => ({ en: "", zh: "", example: "" });
const blankPhrase = (): ScenePhraseItem => ({ en: "", zh: "" });
const blankWording = (): SceneWordingExample => ({ ordinary: "", natural: "", explanation: "" });

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "刚刚更新" : new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(date);
}

export default function SceneManager() {
  const [scenes, setScenes] = useState<SceneLessonRecord[]>([]);
  const [draft, setDraft] = useState<SceneLessonPayload>(blankScene);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    listScenes()
      .then((records) => { if (active) setScenes(records); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "无法读取课程场景库。"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredScenes = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase();
    if (!keyword) return scenes;
    return scenes.filter((record) => `${record.title} ${record.englishTitle} ${record.category} ${record.subtitle}`.toLocaleLowerCase().includes(keyword));
  }, [scenes, search]);

  function updateDraft<K extends keyof SceneLessonPayload>(key: K, value: SceneLessonPayload[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateArray<K extends "dialogue" | "vocabulary" | "quickPhrases" | "wordingExamples">(
    key: K,
    index: number,
    patch: Partial<SceneLessonPayload[K][number]>,
  ) {
    setDraft((current) => ({
      ...current,
      [key]: current[key].map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    }));
  }

  function editScene(record: SceneLessonRecord) {
    setEditingId(record.id);
    setDraft({
      courseKey: record.courseKey,
      title: record.title,
      englishTitle: record.englishTitle,
      category: record.category,
      subtitle: record.subtitle,
      level: record.level,
      durationMinutes: record.durationMinutes,
      sceneLabel: record.sceneLabel,
      description: [...record.description],
      formula: [...record.formula],
      speakers: record.speakers,
      dialogue: record.dialogue.map((line) => ({ ...line, phrases: [...line.phrases] })),
      vocabulary: record.vocabulary.map((item) => ({ ...item })),
      quickPhrases: record.quickPhrases.map((item) => ({ ...item })),
      wordingExamples: record.wordingExamples.map((item) => ({ ...item })),
      practice: record.practice,
    });
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setDraft(blankScene());
    setError("");
    setNotice("");
  }

  async function saveScene(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    const payload: SceneLessonPayload = {
      ...draft,
      courseKey: draft.courseKey.trim(),
      title: draft.title.trim(),
      englishTitle: draft.englishTitle.trim(),
      category: draft.category.trim(),
      subtitle: draft.subtitle.trim(),
      sceneLabel: draft.sceneLabel.trim(),
      speakers: draft.speakers.trim(),
      description: draft.description.map((line) => line.trim()).filter(Boolean),
      formula: draft.formula.map((item) => item.trim()).filter(Boolean),
      dialogue: draft.dialogue.filter((line) => line.speaker.trim() && line.en.trim()).map((line) => ({ ...line, speaker: line.speaker.trim(), en: line.en.trim(), zh: line.zh.trim(), phrases: line.phrases.map((phrase) => phrase.trim()).filter(Boolean) })),
      vocabulary: draft.vocabulary.filter((item) => item.en.trim()).map((item) => ({ ...item, en: item.en.trim(), zh: item.zh.trim(), example: item.example.trim() })),
      quickPhrases: draft.quickPhrases.filter((item) => item.en.trim()).map((item) => ({ ...item, en: item.en.trim(), zh: item.zh.trim() })),
      wordingExamples: draft.wordingExamples.filter((item) => item.ordinary.trim() && item.natural.trim()).map((item) => ({ ...item, ordinary: item.ordinary.trim(), natural: item.natural.trim(), explanation: item.explanation.trim() })),
      practice: draft.practice.trim(),
    };
    try {
      const saved = editingId ? await updateScene(editingId, payload) : await createScene(payload);
      setScenes((current) => [saved, ...current.filter((record) => record.id !== saved.id)]);
      resetForm();
      setNotice(editingId ? "课程场景已更新并保存到数据库。" : "课程场景已保存到数据库，可以继续录入下一节。");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "保存课程场景失败，请稍后重试。");
    } finally {
      setSaving(false);
    }
  }

  async function removeScene(record: SceneLessonRecord) {
    if (!window.confirm(`确定删除课程“${record.title}”吗？`)) return;
    setError("");
    try {
      await deleteScene(record.id);
      setScenes((current) => current.filter((item) => item.id !== record.id));
      if (editingId === record.id) resetForm();
      setNotice(`已删除课程：${record.title}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "删除课程失败，请稍后重试。");
    }
  }

  return <section className="scene-manager">
    <header className="scene-manager-heading">
      <span className="scene-manager-kicker"><FilePlus2 size={14}/> LESSON SCENE EDITOR</span>
      <h1>场景录入</h1>
      <p>录入一节完整的职场场景课程，包括场景描述、双语对话、重点词汇和表达练习。</p>
    </header>

    {notice && <p className="scene-manager-notice" role="status"><Check size={15}/>{notice}</p>}
    {error && <p className="scene-manager-error" role="alert">{error}</p>}

    <div className="scene-manager-layout">
      <form className="scene-manager-form" onSubmit={saveScene}>
        <div className="scene-manager-form-heading">
          <div><span>{editingId ? "编辑课程" : "新课程场景"}</span><h2>{editingId ? "更新课程内容" : "录入一节课程"}</h2></div>
          {editingId && <button type="button" className="scene-manager-cancel" onClick={resetForm}><X size={14}/>取消编辑</button>}
        </div>

        <section className="lesson-editor-section"><h3><span>课程信息</span><small>课程标题和学习概况</small></h3>
          <div className="scene-manager-test-grid">
            <label className="scene-manager-field"><span>课程内部 ID <b>*</b></span><input required maxLength={80} value={draft.courseKey} onChange={(event) => updateDraft("courseKey", event.target.value)} placeholder="例如 quick-intro"/></label>
            <label className="scene-manager-field"><span>课程分类 <b>*</b></span><select value={draft.category} onChange={(event) => updateDraft("category", event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
            <label className="scene-manager-field"><span>中文标题 <b>*</b></span><input required maxLength={200} value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} placeholder="新员工自我介绍"/></label>
            <label className="scene-manager-field"><span>英文标题</span><input maxLength={200} value={draft.englishTitle} onChange={(event) => updateDraft("englishTitle", event.target.value)} placeholder="Quick Intro"/></label>
            <label className="scene-manager-field"><span>课程副标题</span><input maxLength={500} value={draft.subtitle} onChange={(event) => updateDraft("subtitle", event.target.value)} placeholder="用自然、清晰的英语，让新同事认识你。"/></label>
            <label className="scene-manager-field"><span>难度</span><input maxLength={40} value={draft.level} onChange={(event) => updateDraft("level", event.target.value)} placeholder="A2–B1"/></label>
            <label className="scene-manager-field"><span>预计学习分钟</span><input type="number" min={1} max={600} value={draft.durationMinutes} onChange={(event) => updateDraft("durationMinutes", Number(event.target.value))}/></label>
          </div>
        </section>

        <section className="lesson-editor-section"><h3><span>01 · 场景描述</span><small>Situation</small></h3>
          <label className="scene-manager-field"><span>场景标签</span><input maxLength={120} value={draft.sceneLabel} onChange={(event) => updateDraft("sceneLabel", event.target.value)} placeholder="第一次团队会议"/></label>
          <label className="scene-manager-field"><span>场景说明 <small>每行一段</small></span><textarea rows={4} value={draft.description.join("\n")} onChange={(event) => updateDraft("description", event.target.value.split("\n"))} placeholder="描述职场情境和沟通目标，可以分段输入。"/></label>
          <label className="scene-manager-field"><span>表达结构 <small>用逗号分隔</small></span><input value={draft.formula.join("、")} onChange={(event) => updateDraft("formula", event.target.value.split(/[、，,]/))} placeholder="打招呼、姓名与角色、负责范围、协作意愿"/></label>
        </section>

        <section className="lesson-editor-section"><div className="scene-manager-tests-heading"><h3><span>02 · 场景对话</span><small>Dialogue · 英文、中文和重点表达</small></h3><button type="button" className="scene-manager-add-test" onClick={() => updateDraft("dialogue", [...draft.dialogue, blankDialogue()])}><Plus size={15}/>添加对话</button></div>
          <label className="scene-manager-field"><span>说话人简介</span><input value={draft.speakers} onChange={(event) => updateDraft("speakers", event.target.value)} placeholder="Sarah · 团队负责人 / David · 工程师"/></label>
          <div className="lesson-editor-items">{draft.dialogue.map((line, index) => <fieldset className="lesson-editor-item" key={index}>
            <legend>对话 {String(index + 1).padStart(2, "0")}</legend><button type="button" className="scene-manager-remove-test" aria-label="删除对话" onClick={() => updateDraft("dialogue", draft.dialogue.filter((_, itemIndex) => itemIndex !== index))}><X size={15}/></button>
            <div className="scene-manager-test-grid"><label className="scene-manager-field"><span>说话人</span><input value={line.speaker} onChange={(event) => updateArray("dialogue", index, { speaker: event.target.value })} placeholder="Sarah"/></label><label className="scene-manager-field"><span>角色</span><input value={line.role} onChange={(event) => updateArray("dialogue", index, { role: event.target.value })} placeholder="团队负责人"/></label>
              <label className="scene-manager-field full-width"><span>英文</span><textarea rows={2} value={line.en} onChange={(event) => updateArray("dialogue", index, { en: event.target.value })}/></label><label className="scene-manager-field full-width"><span>中文释义</span><textarea rows={2} value={line.zh} onChange={(event) => updateArray("dialogue", index, { zh: event.target.value })}/></label><label className="scene-manager-field full-width"><span>重点表达 <small>用逗号分隔</small></span><input value={line.phrases.join("、")} onChange={(event) => updateArray("dialogue", index, { phrases: event.target.value.split(/[、，,]/) })}/></label>
            </div>
          </fieldset>)}{draft.dialogue.length === 0 && <p className="scene-manager-no-tests">还没有对话，可以稍后再补充。</p>}</div>
        </section>

        <section className="lesson-editor-section"><div className="scene-manager-tests-heading"><h3><span>03 · 重点词汇</span><small>Vocabulary</small></h3><button type="button" className="scene-manager-add-test" onClick={() => updateDraft("vocabulary", [...draft.vocabulary, blankVocabulary()])}><Plus size={15}/>添加词汇</button></div>
          <div className="lesson-editor-items">{draft.vocabulary.map((item, index) => <fieldset className="lesson-editor-item" key={index}><legend>词汇 {index + 1}</legend><button type="button" className="scene-manager-remove-test" aria-label="删除词汇" onClick={() => updateDraft("vocabulary", draft.vocabulary.filter((_, itemIndex) => itemIndex !== index))}><X size={15}/></button><div className="scene-manager-test-grid"><label className="scene-manager-field"><span>英文表达</span><input value={item.en} onChange={(event) => updateArray("vocabulary", index, { en: event.target.value })}/></label><label className="scene-manager-field"><span>中文释义</span><input value={item.zh} onChange={(event) => updateArray("vocabulary", index, { zh: event.target.value })}/></label><label className="scene-manager-field full-width"><span>例句</span><input value={item.example} onChange={(event) => updateArray("vocabulary", index, { example: event.target.value })}/></label></div></fieldset>)}</div>
        </section>

        <section className="lesson-editor-section"><div className="scene-manager-tests-heading"><h3><span>04 · 即时短句</span><small>Quick phrases</small></h3><button type="button" className="scene-manager-add-test" onClick={() => updateDraft("quickPhrases", [...draft.quickPhrases, blankPhrase()])}><Plus size={15}/>添加短句</button></div>
          <div className="lesson-editor-items">{draft.quickPhrases.map((item, index) => <fieldset className="lesson-editor-item" key={index}><legend>短句 {index + 1}</legend><button type="button" className="scene-manager-remove-test" aria-label="删除短句" onClick={() => updateDraft("quickPhrases", draft.quickPhrases.filter((_, itemIndex) => itemIndex !== index))}><X size={15}/></button><div className="scene-manager-test-grid"><label className="scene-manager-field"><span>英文</span><input value={item.en} onChange={(event) => updateArray("quickPhrases", index, { en: event.target.value })}/></label><label className="scene-manager-field"><span>中文</span><input value={item.zh} onChange={(event) => updateArray("quickPhrases", index, { zh: event.target.value })}/></label></div></fieldset>)}</div>
        </section>

        <section className="lesson-editor-section"><div className="scene-manager-tests-heading"><h3><span>05 · 表达优化</span><small>Better wording</small></h3><button type="button" className="scene-manager-add-test" onClick={() => updateDraft("wordingExamples", [...draft.wordingExamples, blankWording()])}><Plus size={15}/>添加示例</button></div>
          <div className="lesson-editor-items">{draft.wordingExamples.map((item, index) => <fieldset className="lesson-editor-item" key={index}><legend>表达示例 {index + 1}</legend><button type="button" className="scene-manager-remove-test" aria-label="删除表达示例" onClick={() => updateDraft("wordingExamples", draft.wordingExamples.filter((_, itemIndex) => itemIndex !== index))}><X size={15}/></button><div className="scene-manager-test-grid"><label className="scene-manager-field"><span>普通说法</span><textarea rows={2} value={item.ordinary} onChange={(event) => updateArray("wordingExamples", index, { ordinary: event.target.value })}/></label><label className="scene-manager-field"><span>自然表达</span><textarea rows={2} value={item.natural} onChange={(event) => updateArray("wordingExamples", index, { natural: event.target.value })}/></label><label className="scene-manager-field full-width"><span>说明</span><input value={item.explanation} onChange={(event) => updateArray("wordingExamples", index, { explanation: event.target.value })}/></label></div></fieldset>)}</div>
        </section>

        <section className="lesson-editor-section"><h3><span>课程练习提示</span><small>课程末尾的练习说明</small></h3><label className="scene-manager-field"><span>Practice</span><textarea rows={2} value={draft.practice} onChange={(event) => updateDraft("practice", event.target.value)} placeholder="给学习者的课后口语练习提示"/></label></section>

        <div className="scene-manager-form-actions"><button type="submit" className="scene-manager-save" disabled={saving}>{saving ? "正在保存…" : editingId ? "保存课程修改" : "保存课程场景"}</button>{!editingId && <button type="button" className="scene-manager-clear" onClick={resetForm}>清空</button>}</div>
      </form>

      <section className="scene-manager-library" aria-labelledby="scene-library-title">
        <div className="scene-manager-library-heading"><div><span>LESSON LIBRARY</span><h2 id="scene-library-title">已录入的课程 <small>{scenes.length}</small></h2></div><label className="scene-manager-search"><Search size={15}/><input aria-label="搜索课程" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索中英文标题或分类"/></label></div>
        {loading ? <p className="scene-manager-empty">正在读取课程库…</p> : filteredScenes.length === 0
          ? <div className="scene-manager-empty"><FilePlus2 size={23}/><strong>{search ? "没有匹配的课程" : "课程库还为空"}</strong><span>{search ? "换一个关键词再试试。" : "录入并保存后，课程会出现在这里。"}</span></div>
          : <div className="scene-manager-records">{filteredScenes.map((record) => <article className="scene-manager-record" key={record.id}>
              <div className="scene-manager-record-copy"><span className="scene-manager-category">{record.category} · {record.level}</span><h3>{record.title}</h3><p>{record.englishTitle} · {record.subtitle}</p><div className="scene-manager-record-meta"><span>{record.dialogue.length} 句对话</span><span>{record.vocabulary.length} 个重点词汇</span><span>{record.quickPhrases.length} 条即时短句</span><time>{formatDate(record.updatedAt)}</time></div></div>
              <div className="scene-manager-record-actions"><button type="button" onClick={() => editScene(record)} aria-label={`编辑 ${record.title}`}><Pencil size={15}/>编辑</button><button type="button" className="danger" onClick={() => void removeScene(record)} aria-label={`删除 ${record.title}`}><Trash2 size={15}/>删除</button></div>
            </article>)}</div>}
      </section>
    </div>
  </section>;
}
