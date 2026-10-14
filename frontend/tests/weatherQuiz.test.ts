import {
  clozeBlanks,
  gradeClozeAnswer,
  normalizeAnswer,
  rainyDialogueRows,
  scoreCloze,
} from "../src/lib/weatherQuiz";
import {
  clozeHistoryStorageKey,
  loadClozeHistory,
  saveClozeAttempt,
  type ClozeAttempt,
} from "../src/lib/weatherQuizStorage";

describe("rainy-day dialogue cloze", () => {
  it("reproduces the dialogue one bilingual sentence at a time", () => {
    expect(rainyDialogueRows.map(({ speaker }) => speaker)).toEqual([
      "Sarah", "Sarah", "David", "David", "David", "David", "Sarah",
      "David", "Jenny", "Jenny", "David", "David", "Sarah",
    ]);
    expect(rainyDialogueRows.map(({ chinese }) => chinese)).toEqual([
      "早上好，David。", "西雅图今天天气怎么样？", "还是这儿经典的冬天老样子。",
      "大雨下了一整早。",
      "说实话，这鬼天气阴沉沉的，我感觉现在半个城市的人都在靠吃抗抑郁药撑着呢。",
      "我是真的很想念太阳。", "经典西雅图天气。",
      "没错。到这个时候，我基本接受每天都会下雨。",
      "我也一样。", "除非看到太阳，不然我都不看天气预报了。",
      "听起来很真实。", "希望大家都别淋湿。",
      "好了，那我们开始看发布进展吧？",
    ]);
    expect(rainyDialogueRows.at(-1)?.english).toEqual([
      "Anyway, let's dive into the release updates, shall we?",
    ]);
  });

  it("places 21 blanks only at the gray fields in source order", () => {
    expect(clozeBlanks).toHaveLength(21);
    expect(clozeBlanks.map(({ answer }) => answer)).toEqual([
      "How's", "weather", "looking", "usual", "weather", "all morning",
      "feel", "like", "miss", "the", "sun", "Classic", "At", "this",
      "point", "accepted", "don't", "even", "bother", "sounds", "staying",
    ]);
    const visible = rainyDialogueRows.flatMap(({ english }) =>
      english.filter((segment): segment is string => typeof segment === "string"),
    ).join("");
    expect(visible).toContain("Same here.");
    expect(visible).toContain(" checking the forecast");
    expect(visible).toContain("Anyway, let's dive into the release updates, shall we?");
    const rendered = rainyDialogueRows.map(({ english }) =>
      english.map((segment) => typeof segment === "string" ? segment : segment.answer).join(""),
    );
    expect(rendered).toEqual([
      "Morning, David.",
      "How's the weather looking in Seattle today?",
      "Just the usual winter weather here.",
      "It’s been raining all morning.",
      "Honestly, with all this gloom, I feel like half the city is on antidepressants right now.",
      "I really miss the sun.",
      "Classic Seattle.",
      "Right. At this point, I've just accepted that it’s going to rain every single day.",
      "Same here.",
      "I don't even bother checking the forecast anymore unless I actually see the sun.",
      "That sounds about right.",
      "Hope everyone is staying dry.",
      "Anyway, let's dive into the release updates, shall we?",
    ]);
  });

  it("normalizes case, punctuation, and whitespace but grades the whole answer", () => {
    const blank = clozeBlanks[5];
    expect(normalizeAnswer("  ALL   morning! ")).toBe("all morning");
    expect(gradeClozeAnswer(blank, " ALL    morning! ")).toBe(true);
    expect(gradeClozeAnswer(blank, "morning")).toBe(false);
    expect(gradeClozeAnswer(blank, "rain all morning")).toBe(false);
  });

  it("scores each correctly filled gray field independently", () => {
    const answers = Object.fromEntries(clozeBlanks.map((blank) => [blank.id, blank.answer]));
    expect(scoreCloze(answers)).toBe(21);
    expect(scoreCloze({ ...answers, "blank-01": "Morning" })).toBe(20);
    expect(scoreCloze({})).toBe(0);
  });
});

describe("rainy-day attempt history", () => {
  function memoryStorage(): Storage {
    const values = new Map<string, string>();
    return {
      get length() { return values.size; },
      clear: () => values.clear(),
      getItem: (key) => values.get(key) ?? null,
      key: (index) => [...values.keys()][index] ?? null,
      removeItem: (key) => values.delete(key),
      setItem: (key, value) => { values.set(key, value); },
    };
  }

  function attempt(index: number): ClozeAttempt {
    return {
      completedAt: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
      answers: Array(21).fill(`answer-${index}`),
      correctness: Array(21).fill(index % 2 === 0),
      score: index,
    };
  }

  it("loads empty history and saves a versioned attempt", () => {
    const storage = memoryStorage();
    expect(loadClozeHistory(storage)).toEqual({ status: "loaded", attempts: [] });
    expect(saveClozeAttempt(storage, attempt(4)).status).toBe("saved");
    expect(JSON.parse(storage.getItem(clozeHistoryStorageKey)!)).toEqual({
      schemaVersion: 1,
      attempts: [attempt(4)],
    });
  });

  it("retains only the most recent ten attempts", () => {
    const storage = memoryStorage();
    for (let index = 0; index < 11; index += 1) saveClozeAttempt(storage, attempt(index));
    const history = loadClozeHistory(storage);
    expect(history.status).toBe("loaded");
    if (history.status === "loaded") {
      expect(history.attempts).toHaveLength(10);
      expect(history.attempts[0].score).toBe(1);
      expect(history.attempts.at(-1)?.score).toBe(10);
    }
  });

  it("reports corrupt data and unavailable storage explicitly", () => {
    const storage = memoryStorage();
    storage.setItem(clozeHistoryStorageKey, "{");
    expect(loadClozeHistory(storage)).toEqual({ status: "corrupt" });
    expect(loadClozeHistory(null)).toEqual({ status: "unavailable" });
    expect(saveClozeAttempt(null, attempt(0))).toEqual({ status: "unavailable" });
  });

  it("does not overwrite history when storage is corrupt or writes fail", () => {
    const corrupt = memoryStorage();
    corrupt.setItem(clozeHistoryStorageKey, JSON.stringify({ schemaVersion: 99, attempts: [] }));
    expect(saveClozeAttempt(corrupt, attempt(0))).toEqual({ status: "corrupt" });
    const failing: Storage = {
      ...memoryStorage(),
      getItem: () => null,
      setItem: () => { throw new Error("quota exceeded"); },
    };
    expect(saveClozeAttempt(failing, attempt(0))).toEqual({ status: "failed" });
  });
});
