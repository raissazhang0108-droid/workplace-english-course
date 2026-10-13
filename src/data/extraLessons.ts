export const extraLessons = {
  interview: {
    title: "面试自我介绍", english: "Tell Me About Yourself", number: "01",
    subtitle: "用清晰的结构，讲出你的经历、成果和岗位价值。",
    scene: "QA / Test Lead 岗位面试",
    description: ["自我介绍要帮助面试官快速理解：你是谁、有哪些相关经历、擅长什么，以及为什么适合这个岗位。先准备 60–90 秒的核心介绍，需要展开时再补充项目细节至约 3 分钟。", "推荐结构：Background → Experience → Strengths → Key Project → Why This Role。QA 候选人可以围绕测试流程、自动化框架、测试平台、跨团队协作、发布质量和领导力展开。", "以下为教学示例，学历、10 年经验、4,000 个用例、99.5% 稳定性和效率提升等数字不代表你的个人经历。练习时替换成真实、可解释的成果，并说明指标口径。"],
    formula: ["教育背景", "相关经历", "核心优势", "代表项目", "岗位匹配"],
    speakers: "Alex · QA 面试官 / Jenny · 候选人（示例）",
    dialogue: [
      { who: "Alex", en: "Hi Jenny, thanks for joining us today! It's a pleasure to have you here for the interview. My name is Alex, and I'm the QA Manager for the e-commerce team. How are you doing today?", zh: "你好，Jenny，感谢你今天参加面试！很高兴你能来。我是 Alex，电商团队的 QA 经理。你今天怎么样？", phrases: ["a pleasure", "have you here", "How are you doing"] },
      { who: "Jenny", en: "I'm doing well, thank you! I'm excited to be here today and to learn more about your team's work.", zh: "我很好，谢谢！很高兴今天来到这里，也期待进一步了解你们团队的工作。", phrases: ["doing well", "excited", "learn more about"] },
      { who: "Alex", en: "Great. To kick things off, could you walk me through your resume?", zh: "太好了。首先，能请你介绍一下自己的经历吗？", phrases: ["kick things off", "walk me through"] },
      { who: "Jenny", en: "Sure. I earned my master's degree in Computer Science, where I developed a strong foundation in software engineering and quality assurance.", zh: "好的。我获得了计算机科学硕士学位，并在学习期间打下了软件工程和质量保证方面的扎实基础。", phrases: ["master's degree", "a strong foundation", "quality assurance"] },
      { who: "Jenny", en: "I have over ten years of experience in quality engineering, with a focus on driving quality strategy across e-commerce and technology teams.", zh: "我有十年以上的质量工程经验，重点是在电商和技术团队中推动质量策略落地。", phrases: ["years of experience", "driving quality strategy"] },
      { who: "Jenny", en: "I started my career as a Junior QA Engineer, focusing on functional testing, regression testing, test case design, and defect tracking.", zh: "我的职业生涯始于初级 QA 工程师，主要负责功能测试、回归测试、测试用例设计和缺陷跟踪。", phrases: ["started my career", "functional testing", "regression testing", "defect tracking"] },
      { who: "Jenny", en: "Later, I moved into a Senior QA role, where I owned test planning, release quality, cross-team collaboration, and risk management.", zh: "后来，我晋升到高级 QA 岗位，负责测试计划、发布质量、跨团队协作和风险管理。", phrases: ["moved into", "owned", "cross-team collaboration", "risk management"] },
      { who: "Jenny", en: "My core expertise is designing and implementing scalable test automation frameworks from scratch. I managed test suites with over 4,000 cases, maintained a 99.5% framework stability rate, and significantly shortened regression cycles.", zh: "我的核心专长是从零设计并落地可扩展的自动化测试框架。我管理过包含 4,000 多个用例的测试套件，保持了 99.5% 的框架稳定性，并显著缩短了回归周期。", phrases: ["core expertise", "scalable", "from scratch", "4,000 cases", "99.5% framework stability"] },
      { who: "Jenny", en: "As a Test Lead, I transitioned into a more infrastructure-focused role. I designed and built a test data and scenario simulation platform using Vue and Spring Boot. It was adopted by more than 100 engineers across development and QA teams and improved QA delivery efficiency by 50%.", zh: "担任测试负责人后，我转向了更侧重基础设施的岗位。我使用 Vue 和 Spring Boot 设计并构建了测试数据与场景模拟平台。它被开发和 QA 团队的 100 多名工程师使用，将 QA 交付效率提升了 50%。", phrases: ["transitioned into", "infrastructure-focused role", "scenario simulation platform", "adopted by", "delivery efficiency"] },
      { who: "Jenny", en: "Overall, I consider myself a value-driven professional with a strong ownership mindset. I enjoy solving complex technical challenges and exploring new technologies. Most recently, I integrated AI into our testing workflows, improving daily operational efficiency by over 50%.", zh: "总体而言，我认为自己注重价值交付，也有很强的主人翁意识。我喜欢解决复杂技术问题并探索新技术。最近，我将 AI 集成到测试工作流中，使日常运营效率提升了 50% 以上。", phrases: ["value-driven", "ownership mindset", "integrated AI", "testing workflows"] },
      { who: "Jenny", en: "I'm excited about this role because it aligns with my expertise in test infrastructure and my interest in helping teams deliver reliable software at scale.", zh: "我很期待这个岗位，因为它与我的测试基础设施专长相契合，也让我有机会帮助团队大规模交付可靠的软件。", phrases: ["aligns with my expertise", "reliable software", "at scale"] }
    ],
    groups: [{ title: "1. 面试开场 · Build rapport", start: 0, end: 3 }, { title: "2. 结构化介绍 · Background to impact", start: 3, end: 11 }],
    vocabulary: [["walk me through", "向我介绍；逐步解释", "Could you walk me through your resume?"], ["drive quality strategy", "推动质量策略", "I drive quality strategy across teams."], ["own", "负责并承担结果", "I owned release quality and risk management."], ["from scratch", "从零开始", "I built the framework from scratch."], ["ownership mindset", "主人翁意识；主动担责的态度", "I bring a strong ownership mindset."], ["align with", "与……契合", "This role aligns with my expertise."]],
    pings: [["Thank you for having me.", "感谢邀请我参加面试。"], ["My core expertise is test automation.", "我的核心专长是测试自动化。"], ["One project I'm particularly proud of is…", "有一个让我特别自豪的项目是……"], ["I'd be happy to go into more detail.", "我很乐意进一步展开介绍。"]],
    wording: ["I'm very good at testing.", "I built an automation framework from scratch and reduced regression time by 30%.", "用具体行动和可核实的成果支撑优势。这里的 30% 仅用于展示句型，实际面试请使用自己的真实数据。"],
    questions: [
      { title: "面试自我介绍更合适的结构是什么？", options: ["逐字复述简历中的每一项内容。", "背景 → 经历 → 优势 → 代表项目 → 岗位匹配。", "只强调自己非常努力。"], answer: 1, note: "围绕岗位组织经历，帮助面试官理解你的背景、贡献与匹配度。" },
      { title: "I built the framework from ___.", options: ["scratch", "start", "zeroes"], answer: 0, note: "from scratch 是固定表达，意思是从零开始。" },
      { title: "示例中的 99.5% 稳定性指标，面试时应该如何使用？", options: ["直接当作自己的成果。", "数字越大越好。", "替换为真实数据，并能解释计算口径和自己的贡献。"], answer: 2, note: "成果需要真实、相关、可说明；不应把示例履历或数字当成自己的经历。" }
    ],
    practice: "用自己的真实经历写一版 60–90 秒的介绍，再准备一个可展开到 3 分钟的项目案例。"
  },
  meeting: {
    title: "英文会议·开场", english: "Opening a Meeting", number: "01",
    subtitle: "在开场一分钟内明确目标、议程和讨论节奏。",
    scene: "跨团队系统合并项目周会",
    description: ["项目需要在两个月内合并三个独立系统及底层数据，时间紧、依赖多。作为会议主持人，开场要感谢出席、简要重申背景，并明确今天要讨论什么、达成什么结果。", "用 review、discuss、align on 明确会议动作；用 aggressive timeline 说明时间紧迫。保持简洁、专业，避免冗长寒暄，尽快引导团队进入进展、风险和行动项。", "开场三步：We're here to review our current progress… 明确目的；We have a very aggressive timeline… 说明背景；Today's meeting will focus on three areas… 给出议程。"],
    formula: ["欢迎与感谢", "会议目的", "项目背景", "明确议程", "邀请汇报"],
    speakers: "Sarah · 会议主持人 / Alex · 项目成员",
    dialogue: [
      { who: "Sarah", en: "Good morning, everyone. Thank you for joining today's meeting. We're here to review our current progress, discuss any risks or blockers, and align on next steps.", zh: "大家早上好，感谢参加今天的会议。我们今天主要回顾当前进展，讨论风险或阻碍因素，并就下一步工作达成一致。", phrases: ["joining", "review", "risks or blockers", "align on"] },
      { who: "Sarah", en: "Before we begin, I'd like to quickly review our core goal. As you know, we have a very aggressive timeline to merge three independent systems within two months.", zh: "开始之前，我想快速回顾一下核心目标。大家都知道，我们需要在两个月内合并三个独立系统，时间非常紧迫。", phrases: ["Before we begin", "quickly review", "aggressive timeline", "merge three independent systems"] },
      { who: "Sarah", en: "Today's meeting will focus on three areas: progress updates from each team, risks and blockers, and action items and priorities for next week.", zh: "今天的会议重点围绕三个方面：各团队的进展更新、风险与阻碍因素，以及下周的行动项和优先级。", phrases: ["focus on", "progress updates", "risks and blockers", "action items", "priorities"] },
      { who: "Sarah", en: "With that, let's get started. Let's begin with the Dev Team. Could you please walk us through your progress since our last meeting?", zh: "那么，我们开始吧。先请开发团队汇报，能否带我们了解一下自上次会议以来的工作进展？", phrases: ["get started", "begin with", "walk us through"] },
      { who: "Alex", en: "Sorry for running late. I had a conflict right before this. Please go ahead, I'll catch up.", zh: "抱歉迟到了，刚才有个时间冲突。请继续，我会尽快跟上。", phrases: ["running late", "a conflict", "go ahead", "catch up"] },
      { who: "Sarah", en: "No worries, Alex. We were just getting started. Feel free to jump in at any point.", zh: "没关系，Alex，我们刚开始。欢迎随时加入讨论。", phrases: ["No worries", "Feel free to", "jump in"] },
      { who: "Sarah", en: "Now let's move into the status update part.", zh: "现在我们进入进展同步环节。", phrases: ["move into", "status update"] }
    ],
    groups: [{ title: "明确议程、邀请汇报与回应迟到", start: 0, end: 7 }],
    vocabulary: [["align on", "就某事达成一致", "Let's align on next steps."], ["aggressive timeline", "紧迫、挑战性强的时间安排", "We have an aggressive timeline for this project."], ["blocker", "阻碍进展的问题", "Are there any blockers we need to address?"], ["action item", "明确要落实的行动项", "Let's assign an owner to each action item."], ["walk someone through", "逐步向某人介绍", "Could you walk us through your progress?"], ["catch up", "跟上进度；补上信息", "Please go ahead. I'll catch up."]],
    pings: [["Thank you for joining today's meeting.", "感谢参加今天的会议。"], ["Let's align on next steps.", "我们来对齐下一步工作。"], ["Could you walk us through your progress?", "能否向我们介绍一下进展？"], ["Feel free to jump in at any point.", "欢迎随时加入讨论。"]],
    wording: ["Let's talk about the project.", "We're here to review our progress, discuss risks, and align on next steps.", "用具体的会议动作代替宽泛的 talk，帮助参与者知道需要准备什么、会后要达成什么结果。"],
    questions: [
      { title: "哪一句最清晰地说明会议目的？", options: ["Let's talk about something.", "We're here to review progress, discuss risks, and align on next steps.", "We'll see what happens."], answer: 1, note: "review、discuss、align on 明确了会议动作与预期结果。" },
      { title: "Could you please ___ us through your progress?", options: ["walk", "run", "move"], answer: 0, note: "walk someone through 表示逐步向某人介绍或解释。" },
      { title: "同事迟到时，哪句回应既礼貌又不打断会议节奏？", options: ["Let's start everything again.", "Why are you always late?", "No worries. We were just getting started. Feel free to jump in."], answer: 2, note: "简短回应迟到，并邀请参与讨论，就能自然保持会议节奏。" }
    ],
    practice: "用一分钟主持一次项目周会开场：说明目的、列出议程，再邀请第一位同事汇报。"
  },
  coffee: {
    title: "破冰与约聊", english: "Scheduling a Coffee Chat", number: "02",
    subtitle: "用轻松、礼貌的邀请，开启一次有收获的交流。",
    scene: "新同事之间的一对一交流",
    description: ["新员工入职、跨团队合作，或第一次对接同事时，可以用 coffee chat 建立连接。它不一定指喝咖啡，更多是一次轻量、非正式的一对一交流。", "邀请时说明想了解什么，建议一个简短时长，同时给对方选择空间。No pressure if your calendar is packed. 表达日程很满也没关系。"],
    formula: ["打招呼", "说明来意", "轻松邀请", "协商时间", "发送日程"],
    speakers: "Mia · 新同事 / Jenny · QA 同事",
    dialogue: [
      { who: "Mia", en: "Hi Jenny, I'm new to the team and would love to learn more about your work.", zh: "你好，Jenny。我刚加入团队，很想了解一下你的工作。", phrases: ["new to the team", "learn more about"] },
      { who: "Mia", en: "Would you be open to a quick coffee chat sometime this week?", zh: "这周你愿意找个时间简单聊聊吗？", phrases: ["Would you be open to", "a quick coffee chat"] },
      { who: "Jenny", en: "Hi Mia, nice to meet you.", zh: "你好，Mia，很高兴认识你。", phrases: ["nice to meet you"] },
      { who: "Jenny", en: "We'll be working together on the release project.", zh: "我们接下来会一起参与发布项目。", phrases: ["working together"] },
      { who: "Jenny", en: "I'd love to set up a quick intro chat if you have 15 minutes sometime this week.", zh: "如果你这周有 15 分钟，我很愿意约个简短的相互认识的聊天。", phrases: ["set up", "a quick intro chat"] },
      { who: "Mia", en: "I'd love to learn more about how your team handles QA planning.", zh: "我很想了解你们团队是如何安排 QA 规划的。", phrases: ["handles", "QA planning"] },
      { who: "Mia", en: "Would you be open to a short coffee chat next week?", zh: "你愿意下周找个时间简单聊聊吗？", phrases: ["Would you be open to"] },
      { who: "Mia", en: "No pressure if your calendar is packed, but I'd be happy to connect whenever it's convenient for you.", zh: "如果你日程很满也完全没关系，你方便的时候我很愿意聊一下。", phrases: ["No pressure", "your calendar is packed", "connect"] },
      { who: "Jenny", en: "Would Tuesday or Wednesday afternoon work for a quick 15-minute chat?", zh: "周二或周三下午方便简单聊 15 分钟吗？", phrases: ["Would", "work"] },
      { who: "Mia", en: "Wednesday afternoon works perfectly for me. Let me send over a calendar invite.", zh: "周三下午对我来说很合适。我来发个日程邀请给你。", phrases: ["works perfectly for me", "calendar invite"] }
    ],
    groups: [{ title: "从破冰到确认时间", start: 0, end: 10 }],
    vocabulary: [["be open to", "愿意考虑（后接名词或动名词）", "Would you be open to meeting next week?"], ["set up", "安排", "Let's set up a quick chat."], ["a packed calendar", "排满的日程", "My calendar is packed this week."], ["work for someone", "对某人来说合适", "Would Wednesday work for you?"], ["connect", "联系；交流", "I'd be happy to connect."], ["calendar invite", "日程邀请", "I'll send you a calendar invite."]],
    pings: [["No pressure at all.", "完全不用有压力。"], ["Does Wednesday work for you?", "周三你方便吗？"], ["Happy to work around your schedule.", "我可以配合你的时间。"], ["I'll send over an invite.", "我会发一个日程邀请。"]],
    wording: ["Meet me this week.", "Would you be open to a quick coffee chat this week?", "用开放式邀请替代命令式表达，让对方能够轻松接受、改期或拒绝。"],
    questions: [
      { title: "哪一句邀请更礼貌、低压力？", options: ["You must meet me today.", "Would you be open to a quick coffee chat?", "I need your time now."], answer: 1, note: "Would you be open to… 是礼貌的邀请方式，保留了对方的选择空间。" },
      { title: "Wednesday afternoon ___ perfectly for me.", options: ["works", "working", "work"], answer: 0, note: "Wednesday afternoon 作单数主语，使用 works；work for me 表示时间合适。" },
      { title: "对方日程很满时，哪一句能减轻压力？", options: ["You have to come.", "Don't be late.", "No pressure if your calendar is packed."], answer: 2, note: "No pressure 表示没有压力；calendar is packed 表示日程安排很满。" }
    ],
    practice: "试着邀请一位同事，进行一次 15 分钟的 coffee chat。"
  },
  weather: {
    title: "天气与环境", english: "Weather & Environment", number: "03",
    subtitle: "从天气开启轻松寒暄，再自然转入工作。",
    scene: "西雅图的会议开场",
    description: ["天气是职场 small talk 中常见、相对不涉及隐私的话题。会议开始前、coffee chat 或跨地区通话时，一句天气问候就能自然打开话题。", "寒暄保持简短，一两轮后就可以回到工作：Anyway, shall we get started? 下面分别练习阴雨天和晴天的交流。"],
    formula: ["问候", "聊聊天气", "轻松回应", "分享感受", "转入工作"],
    speakers: "Sarah · 团队负责人 / David · 西雅图同事 / Jenny · 同事",
    dialogue: [
      { who: "Sarah", en: "Morning, David. How's the weather looking in Seattle today?", zh: "早上好，David。西雅图今天天气怎么样？", phrases: ["How's the weather looking"] },
      { who: "David", en: "Just the usual winter weather here. It's been raining all morning. Honestly, with all this gloom, I really miss the sun.", zh: "还是这里冬天的老样子，下了一整早的雨。说实话，天一直这么阴沉，我真的很想念阳光。", phrases: ["usual winter weather", "all morning", "gloom", "miss the sun"] },
      { who: "Sarah", en: "Classic Seattle.", zh: "典型的西雅图天气。", phrases: ["Classic Seattle"] },
      { who: "David", en: "Right. At this point, I've just accepted that it's going to rain every single day.", zh: "是啊。到这个时候，我基本已经接受每天都会下雨了。", phrases: ["At this point", "accepted", "every single day"] },
      { who: "Jenny", en: "Same here. I don't even bother checking the forecast anymore unless I actually see the sun.", zh: "我也一样。我都懒得再看天气预报了，除非真的见到太阳。", phrases: ["Same here", "don't even bother", "checking the forecast"] },
      { who: "Sarah", en: "Too true. Hope everyone is staying dry.", zh: "太对了。希望大家都没被雨淋湿。", phrases: ["Too true", "staying dry"] },
      { who: "Sarah", en: "Anyway, let's dive into the release updates, shall we?", zh: "好了，我们开始聊发布进展吧？", phrases: ["Anyway", "dive into", "release updates"] },
      { who: "Sarah", en: "Morning, David. Looks like Seattle finally got some sunshine today.", zh: "早上好，David。看来西雅图今天终于出太阳了。", phrases: ["Looks like", "finally", "sunshine"] },
      { who: "David", en: "I know, it's a rare sunny day here. I'm definitely not taking it for granted.", zh: "是啊，这里难得有个晴天。我一定会好好珍惜。", phrases: ["a rare sunny day", "taking it for granted"] },
      { who: "Sarah", en: "Totally. Days like this make the city feel completely different.", zh: "完全同意。这样的天气让整个城市感觉都不一样了。", phrases: ["Days like this", "completely different"] },
      { who: "David", en: "Exactly. I'm hoping to go outside for a walk after our meeting.", zh: "没错。我希望开完会后能出去走走。", phrases: ["hoping to", "go outside for a walk"] },
      { who: "Jenny", en: "Same. It's so refreshing to see some blue sky for a change.", zh: "我也是。难得看到蓝天，真让人神清气爽。", phrases: ["so refreshing", "for a change"] },
      { who: "Sarah", en: "Enjoy it while it lasts. Seattle might go back to rain tomorrow.", zh: "趁现在好好享受吧。西雅图明天可能又要下雨了。", phrases: ["Enjoy it while it lasts", "go back to"] },
      { who: "Sarah", en: "Anyway, shall we get started with today's updates?", zh: "好了，我们开始同步今天的进展吧？", phrases: ["Anyway", "shall we get started", "updates"] }
    ],
    groups: [{ title: "2.1 阴雨天气 · A rainy day", start: 0, end: 7 }, { title: "2.2 天气很好 · A sunny day", start: 7, end: 14 }],
    vocabulary: [["gloom", "阴沉；昏暗", "I miss the sun with all this gloom."], ["forecast", "天气预报", "Have you checked the forecast?"], ["stay dry", "保持干爽；别淋湿", "Hope you're staying dry."], ["take it for granted", "视为理所当然", "I'm not taking this sunshine for granted."], ["for a change", "换换样；难得一次", "It's sunny for a change."], ["dive into", "开始着手；深入讨论", "Let's dive into today's updates."]],
    pings: [["How's the weather there?", "你那边天气怎么样？"], ["Same here.", "我这里也一样。"], ["Hope you're staying dry.", "希望你没被雨淋湿。"], ["Anyway, shall we get started?", "好了，我们开始吧？"]],
    wording: ["Stop talking about the weather. Let's work.", "Anyway, shall we get started with today's updates?", "用 Anyway 自然转换话题，礼貌地从寒暄过渡到会议内容。"],
    questions: [
      { title: "天气寒暄后，哪一句能自然转入工作？", options: ["Anyway, shall we get started?", "You talk too much.", "The weather is wrong."], answer: 0, note: "Anyway 可以自然转换话题；shall we get started 是礼貌的开场建议。" },
      { title: "I'm not taking this sunshine for ___.", options: ["grant", "granted", "granting"], answer: 1, note: "take something for granted 是固定表达，意思是把某事视为理所当然。" },
      { title: "同事说一直在下雨，哪一句回应最合适？", options: ["You must change it.", "That's your problem.", "Same here. Hope you're staying dry."], answer: 2, note: "Same here 表达相同情况，Hope you're staying dry 表达轻松的关心。" }
    ],
    practice: "分别用一句阴雨天和晴天的问候开场，再自然转入工作话题。"
  }
};
