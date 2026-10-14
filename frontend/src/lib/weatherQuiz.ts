export interface ClozeBlank {
  id: string;
  answer: string;
}

export type DialogueSegment = string | ClozeBlank;

export interface RainyDialogueRow {
  speaker: "Sarah" | "David" | "Jenny";
  english: DialogueSegment[];
  chinese: string;
}

export const rainyDialogueRows: RainyDialogueRow[] = [
  {
    speaker: "Sarah",
    english: ["Morning, David."],
    chinese: "早上好，David。",
  },
  {
    speaker: "Sarah",
    english: [
      { id: "blank-01", answer: "How's" },
      " the ",
      { id: "blank-02", answer: "weather" },
      " ",
      { id: "blank-03", answer: "looking" },
      " in Seattle today?",
    ],
    chinese: "西雅图今天天气怎么样？",
  },
  {
    speaker: "David",
    english: [
      "Just the ",
      { id: "blank-04", answer: "usual" },
      " winter ",
      { id: "blank-05", answer: "weather" },
      " here.",
    ],
    chinese: "还是这儿经典的冬天老样子。",
  },
  {
    speaker: "David",
    english: ["It’s been raining ", { id: "blank-06", answer: "all morning" }, "."],
    chinese: "大雨下了一整早。",
  },
  {
    speaker: "David",
    english: [
      "Honestly, with all this gloom, I ",
      { id: "blank-07", answer: "feel" },
      " ",
      { id: "blank-08", answer: "like" },
      " half the city is on antidepressants right now.",
    ],
    chinese: "说实话，这鬼天气阴沉沉的，我感觉现在半个城市的人都在靠吃抗抑郁药撑着呢。",
  },
  {
    speaker: "David",
    english: [
      "I really ",
      { id: "blank-09", answer: "miss" },
      " ",
      { id: "blank-10", answer: "the" },
      " ",
      { id: "blank-11", answer: "sun" },
      ".",
    ],
    chinese: "我是真的很想念太阳。",
  },
  {
    speaker: "Sarah",
    english: [{ id: "blank-12", answer: "Classic" }, " Seattle."],
    chinese: "经典西雅图天气。",
  },
  {
    speaker: "David",
    english: [
      "Right. ",
      { id: "blank-13", answer: "At" },
      " ",
      { id: "blank-14", answer: "this" },
      " ",
      { id: "blank-15", answer: "point" },
      ", I've just ",
      { id: "blank-16", answer: "accepted" },
      " that it’s going to rain every single day.",
    ],
    chinese: "没错。到这个时候，我基本接受每天都会下雨。",
  },
  {
    speaker: "Jenny",
    english: ["Same here."],
    chinese: "我也一样。",
  },
  {
    speaker: "Jenny",
    english: [
      "I ",
      { id: "blank-17", answer: "don't" },
      " ",
      { id: "blank-18", answer: "even" },
      " ",
      { id: "blank-19", answer: "bother" },
      " checking the forecast anymore unless I actually see the sun.",
    ],
    chinese: "除非看到太阳，不然我都不看天气预报了。",
  },
  {
    speaker: "David",
    english: [
      "That ",
      { id: "blank-20", answer: "sounds" },
      " about right.",
    ],
    chinese: "听起来很真实。",
  },
  {
    speaker: "David",
    english: [
      "Hope everyone is ",
      { id: "blank-21", answer: "staying" },
      " dry.",
    ],
    chinese: "希望大家都别淋湿。",
  },
  {
    speaker: "Sarah",
    english: ["Anyway, let's dive into the release updates, shall we?"],
    chinese: "好了，那我们开始看发布进展吧？",
  },
];

export const clozeBlanks = rainyDialogueRows.flatMap((row) =>
  row.english.filter((segment): segment is ClozeBlank => typeof segment !== "string"),
);

export function normalizeAnswer(answer: string): string {
  return answer
    .toLowerCase()
    .replace(/\p{P}/gu, "")
    .trim()
    .replace(/\s+/g, " ");
}

export function gradeClozeAnswer(blank: ClozeBlank, answer: string): boolean {
  return normalizeAnswer(blank.answer) === normalizeAnswer(answer);
}

export function scoreCloze(answers: Readonly<Record<string, string>>): number {
  return clozeBlanks.reduce(
    (score, blank) => score + Number(gradeClozeAnswer(blank, answers[blank.id] ?? "")),
    0,
  );
}
