export type SceneTestType = "cloze" | "translate";
export type SceneTestStatus = "available" | "coming_soon";
export type SceneCategory = "日常沟通" | "会议沟通" | "面试英语";
export type SceneLessonId = "weather" | "intro" | "coffee" | "meeting" | "interview";

export interface SceneTestOption {
  type: SceneTestType;
  label: string;
  count: number;
  minutes: number;
  difficulty: "初级" | "中级";
  skills: string[];
  status: SceneTestStatus;
}

export interface SceneTestScene {
  id: string;
  scene: string;
  category: SceneCategory;
  description: string;
  courseLink: { lessonId: SceneLessonId; title: string };
  tests: SceneTestOption[];
}

// Counts, durations and skills are placeholders pending final test content.
export const sceneTests: SceneTestScene[] = [
  {
    id: "weather",
    scene: "天气与环境",
    category: "日常沟通",
    description: "你和同事在办公室聊起天气，并自然开启一段对话。",
    courseLink: { lessonId: "weather", title: "天气与环境" },
    tests: [
      { type: "cloze", label: "挖词填空", count: 8, minutes: 5, difficulty: "初级", skills: ["听力", "词汇", "表达"], status: "available" },
      { type: "translate", label: "中翻英", count: 5, minutes: 8, difficulty: "中级", skills: ["表达", "写作"], status: "coming_soon" },
    ],
  },
  { id: "intro", scene: "新员工自我介绍", category: "日常沟通", description: "你刚加入团队，需要向新同事介绍自己的角色与职责。", courseLink: { lessonId: "intro", title: "新员工自我介绍" }, tests: [] },
  { id: "coffee", scene: "咖啡约聊", category: "日常沟通", description: "你想邀请一位同事喝咖啡，轻松建立工作关系。", courseLink: { lessonId: "coffee", title: "破冰与约聊" }, tests: [] },
  { id: "meeting", scene: "英文会议·开场", category: "会议沟通", description: "你主持项目例会，需要欢迎参会者、说明议程并对齐下一步。", courseLink: { lessonId: "meeting", title: "英文会议·开场" }, tests: [] },
  { id: "interview", scene: "面试自我介绍", category: "面试英语", description: "你正在参加英文面试，需要清晰介绍经历、优势和项目。", courseLink: { lessonId: "interview", title: "面试自我介绍" }, tests: [] },
];

