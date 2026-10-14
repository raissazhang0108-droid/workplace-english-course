import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Training from "../src/Training";

vi.stubGlobal("IntersectionObserver", class {
  observe() {}
  disconnect() {}
});

describe("Training", () => {
  beforeEach(() => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const stored = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => stored.get(key) ?? null,
      setItem: (key: string, value: string) => stored.set(key, value)
    });
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => (
      String(input) === "/api/auth/me"
        ? Response.json({ detail: "请先登录" }, { status: 401 })
        : Response.json({ attempts: [] })
    )));
  });

  it("filters the home courses and opens the listening player", () => {
    render(<Training />);
    expect(screen.getByRole("heading", {name: "职场英语"})).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", {name: /听力跟读/}));
    expect(screen.queryByRole("button", {name: "学习这节课"})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name: "开始听力练习"}));
    expect(screen.getByRole("button", { name: "播放音频" })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", {name: "学习首页"})[0]);
    expect(screen.getByRole("tab", {name: /全部/})).toHaveAttribute("aria-selected", "true");
  });
  it("uses the learning home course library layout on the global homepage", () => {
    render(<Training />);
    fireEvent.click(screen.getByRole("button", {name: "全球化实战首页"}));
    const catalog = document.querySelector(".global-home .home-library");
    expect(catalog).not.toBeNull();
    expect(catalog?.closest(".global-layout")).toBeNull();
    expect(within(catalog as HTMLElement).getAllByRole("tab")).toHaveLength(5);
    expect(within(catalog as HTMLElement).getAllByRole("article")).toHaveLength(6);
    expect(document.querySelectorAll(".global-module")).toHaveLength(0);
    fireEvent.click(within(catalog as HTMLElement).getByRole("tab", {name: /面试英语/}));
    expect(within(catalog as HTMLElement).getAllByRole("article")).toHaveLength(1);
    fireEvent.click(within(catalog as HTMLElement).getByRole("button", {name: "学习面试自我介绍"}));
    expect(document.querySelector(".lesson-kicker")).toHaveTextContent("INTERVIEWS");
  });
  it("removes the global-home slogan, catalog caption and classic-home button", () => {
    render(<Training />);
    fireEvent.click(screen.getByRole("button", {name: "全球化实战首页"}));

    const heading = document.querySelector(".global-heading");
    expect(heading).not.toBeNull();
    expect(getComputedStyle(heading!).display).toBe("block");
    expect(within(heading as HTMLElement).getByText(/面向工程师、产品、QA/)).toBeInTheDocument();
    expect(screen.getByRole("heading", {name: "实战场景地图"})).toBeInTheDocument();
    const stats = document.querySelector(".global-stats");
    expect(stats?.querySelectorAll("svg")).toHaveLength(4);
    expect(within(stats as HTMLElement).getByText("08")).toBeInTheDocument();
    expect(screen.queryByText("从真实工作场景，练到自信开口。")).not.toBeInTheDocument();
    expect(screen.queryByText("让每一次沟通，都更有把握")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", {name: "经典首页"})).not.toBeInTheDocument();
    expect(screen.queryByText("完整课程介绍")).not.toBeInTheDocument();
  });
  it("places a start-here intro lesson feature before the course catalog", () => {
    render(<Training />);
    fireEvent.click(screen.getByRole("button", {name: "全球化实战首页"}));

    const feature = document.querySelector(".global-start-feature");
    const catalog = document.querySelector(".global-home .home-library");
    expect(feature).not.toBeNull();
    expect(catalog).not.toBeNull();
    expect(feature!.compareDocumentPosition(catalog!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(feature as HTMLElement).getByRole("heading", {name: "从这里开始"})).toBeInTheDocument();
    expect(within(feature as HTMLElement).getByText("新员工自我介绍")).toBeInTheDocument();
    expect(within(feature as HTMLElement).getByRole("button", {name: /进入学习/})).toBeInTheDocument();
    expect(feature!.nextElementSibling).toHaveClass("global-home-divider");
    expect(screen.queryByText("本周练习建议")).not.toBeInTheDocument();
    expect(screen.queryByText("START HERE")).not.toBeInTheDocument();
  });
  it("lets learners select an available scene test from the listening sidebar", () => {
    render(<Training />);
    fireEvent.click(screen.getByRole("button", {name: "测试"}));

    expect(screen.getByRole("heading", {name: "实战核心输出"})).toBeInTheDocument();
    expect(screen.getByRole("button", {name: /开始测试.*天气与环境/})).toBeInTheDocument();
    expect(screen.getByRole("heading", {name: "新员工自我介绍"})).toBeInTheDocument();
    expect(screen.getAllByText("暂未开放")).toHaveLength(4);
    fireEvent.click(screen.getByRole("button", {name: /开始测试.*天气与环境/}));
    expect(screen.getByRole("heading", {name: /7.1.1 天气不好/})).toBeInTheDocument();
  });
  it("registers from the header, keeps the learner on the page, and logs out to guest mode", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === "/api/auth/me") return Response.json({ detail: "请先登录" }, { status: 401 });
      if (url === "/api/auth/register") return Response.json({
        email: "learner@example.com",
        completedCourses: ["meeting"],
      }, { status: 201 });
      if (url === "/api/progress") {
        const body = JSON.parse(String(init?.body)) as { completedCourses: string[] };
        return Response.json(body);
      }
      if (url === "/api/auth/logout") return Response.json({ status: "ok" });
      return Response.json({ attempts: [] });
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<Training />);

    fireEvent.click(screen.getByRole("button", { name: "登录 / 注册" }));
    fireEvent.click(screen.getByRole("tab", { name: "注册" }));
    fireEvent.change(screen.getByLabelText("邮箱"), { target: { value: "learner@example.com" } });
    fireEvent.change(screen.getByLabelText("密码"), { target: { value: "a-long-password" } });
    fireEvent.click(screen.getByRole("button", { name: "创建账号" }));

    expect(await screen.findByText("learner@example.com")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/register", expect.objectContaining({
      credentials: "same-origin",
      headers: expect.objectContaining({ "X-Requested-With": "XMLHttpRequest" }),
    }));
    fireEvent.click(screen.getByRole("button", { name: "退出" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "登录 / 注册" })).toBeInTheDocument());
    expect(screen.getByRole("status")).toHaveTextContent("已退出登录");
  });
  it("restores account progress when returning on another device", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === "/api/auth/me") return Response.json({
        email: "learner@example.com",
        completedCourses: ["meeting"],
      });
      if (url === "/api/auth/import-attempts") return Response.json({ imported: 0 });
      if (url === "/api/progress") {
        const body = JSON.parse(String(init?.body)) as { completedCourses: string[] };
        return Response.json(body);
      }
      return Response.json({ attempts: [] });
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<Training />);

    expect(await screen.findByText("learner@example.com")).toBeInTheDocument();
    await waitFor(() => expect(localStorage.getItem("meeting-complete")).toBe("true"));
    expect(screen.getByRole("button", { name: "退出" })).toBeInTheDocument();
  });
  it("shows a real interview dialogue line and clear learning information on the global course card", () => {
    render(<Training />);
    fireEvent.click(screen.getByRole("button", {name: "全球化实战首页"}));
    const catalog = document.querySelector(".global-home .home-library") as HTMLElement;
    fireEvent.click(within(catalog).getByRole("tab", {name: /面试英语/}));
    const card = within(catalog).getByRole("article");

    expect(card).toHaveTextContent("用 5 步结构讲清你的经历、优势和代表项目");
    expect(card).toHaveTextContent("My core expertise is designing and implementing scalable test automation frameworks from scratch.");
    expect(card).not.toHaveTextContent("I managed test suites with over 4,000 cases");
    expect(card).toHaveTextContent("A2–B1 · 约 15 分钟 · 11 句对话 · 3 道小测验");
    expect(card).toHaveTextContent("尚未开始");
    expect(within(card).getByRole("button", {name: "学习面试自我介绍"})).toHaveTextContent("开始学习");
    expect(card).not.toHaveTextContent("QA / Test Lead");
    expect(card.querySelector(".course-preview .lucide-briefcase-business")).not.toBeNull();
    expect(card.querySelector(".course-card-content .course-type")).toBeNull();
    expect(card).toHaveTextContent("实战核心输出 (Core Output)：");
  });
  it("shows the real meeting quote, matching icon and completed course state", () => {
    localStorage.setItem("meeting-complete", "true");
    render(<Training />);
    fireEvent.click(screen.getByRole("button", {name: "全球化实战首页"}));
    const catalog = document.querySelector(".global-home .home-library") as HTMLElement;
    fireEvent.click(within(catalog).getByRole("tab", {name: /会议沟通/}));
    const card = within(catalog).getByRole("article");

    expect(card).toHaveTextContent("We're here to review our current progress, discuss any risks or blockers, and align on next steps.");
    expect(card.querySelector(".course-preview .lucide-presentation")).not.toBeNull();
    expect(card).toHaveTextContent("实战核心输出 (Core Output)：");
    expect(card).toHaveTextContent("✓ 已学完 · 可复习");
    expect(within(card).getByRole("button", {name: "复习英文会议·开场"})).toHaveTextContent("复习课程");
  });
  it("lists meetings independently and grades the meeting quiz", () => {
    render(<Training />);
    expect(within(screen.getByRole("group", {name: "会议沟通课程"})).getByRole("button", {name: "英文会议·开场"})).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", {name: /会议沟通/}));
    const panel = screen.getByRole("tabpanel");
    expect(within(panel).queryByText("新员工自我介绍")).not.toBeInTheDocument();
    fireEvent.click(within(panel).getByRole("button", {name: "学习英文会议·开场"}));
    expect(document.querySelector(".lesson-kicker")).toHaveTextContent("MEETINGS");
    expect(document.querySelector(".breadcrumbs")).not.toHaveTextContent("Small Talk");
    expect(screen.getAllByRole("button", {name: /朗读第/})).toHaveLength(7);
    fireEvent.click(screen.getByLabelText("We're here to review progress, discuss risks, and align on next steps."));
    fireEvent.click(screen.getByLabelText("walk"));
    fireEvent.click(screen.getByLabelText("No worries. We were just getting started. Feel free to jump in."));
    fireEvent.click(screen.getByRole("button", {name: /检查答案/}));
    expect(screen.getByRole("status")).toHaveTextContent("答对 3 / 3 题");
    fireEvent.click(screen.getByRole("button", {name: "标记为已完成"}));
    expect(localStorage.getItem("meeting-complete")).toBe("true");
    expect(localStorage.getItem("coffee-complete")).toBeNull();
  });
  it("opens the independent interview course and saves only its completion", () => {
    render(<Training />);
    expect(within(screen.getByRole("group", {name: "面试英语课程"})).getByRole("button", {name: "面试自我介绍"})).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", {name: /面试英语/}));
    const panel = screen.getByRole("tabpanel");
    expect(within(panel).queryByText("英文会议·开场")).not.toBeInTheDocument();
    fireEvent.click(within(panel).getByRole("button", {name: "学习面试自我介绍"}));
    expect(document.querySelector(".lesson-kicker")).toHaveTextContent("INTERVIEWS");
    expect(screen.getAllByRole("button", {name: /朗读第/})).toHaveLength(11);
    fireEvent.click(screen.getByLabelText("背景 → 经历 → 优势 → 代表项目 → 岗位匹配。"));
    fireEvent.click(screen.getByLabelText("scratch"));
    fireEvent.click(screen.getByLabelText("替换为真实数据，并能解释计算口径和自己的贡献。"));
    fireEvent.click(screen.getByRole("button", {name: /检查答案/}));
    expect(screen.getByRole("status")).toHaveTextContent("答对 3 / 3 题");
    fireEvent.click(screen.getByRole("button", {name: "标记为已完成"}));
    expect(localStorage.getItem("interview-complete")).toBe("true");
    expect(localStorage.getItem("meeting-complete")).toBeNull();
  });
  it("shows several interview wording upgrades with explanations and a truthful-metrics disclaimer", () => {
    render(<Training />);
    fireEvent.click(screen.getByRole("button", {name: "学习面试自我介绍"}));

    const wording = document.querySelector("#section-4") as HTMLElement;
    const cards = within(wording).getAllByRole("article", {name: /表达优化示例/});
    expect(cards).toHaveLength(5);
    expect(within(wording).getByText("I'm very good at testing.")).toBeInTheDocument();
    expect(within(wording).getByText("I did many testing things.")).toBeInTheDocument();
    expect(within(wording).getByText("I made a platform.")).toBeInTheDocument();
    expect(within(wording).getByText("I think I am suitable for this job.")).toBeInTheDocument();
    expect(within(wording).getByText(/这里的 30% 仅用于展示句型，实际面试请使用自己的真实数据/)).toBeInTheDocument();
    expect(within(wording).getByText(/reduced regression time by 30%/)).toBeInTheDocument();
    expect(within(cards[0]).getByRole("button", {name: "朗读这句英文"})).toBeInTheDocument();
  });
  it("keeps new lessons, quizzes and completion records independent", () => {
    render(<Training />);
    fireEvent.click(screen.getByRole("button", {name: "学习破冰与约聊"}));
    expect(screen.getAllByRole("button", {name: /朗读第/})).toHaveLength(10);
    fireEvent.click(screen.getByLabelText("Would you be open to a quick coffee chat?"));
    fireEvent.click(screen.getByLabelText("works"));
    fireEvent.click(screen.getByLabelText("No pressure if your calendar is packed."));
    fireEvent.click(screen.getByRole("button", {name: /检查答案/}));
    expect(screen.getByRole("status")).toHaveTextContent("答对 3 / 3 题");
    fireEvent.click(screen.getByRole("button", {name: "标记为已完成"}));
    expect(localStorage.getItem("coffee-complete")).toBe("true");
    fireEvent.click(screen.getByRole("button", {name: "天气与环境"}));
    expect(screen.getAllByRole("button", {name: /朗读第/})).toHaveLength(14);
    expect(screen.getByRole("heading", {name: /2.2 天气很好/})).toBeInTheDocument();
    expect(screen.getByRole("button", {name: /检查答案/})).toBeDisabled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("button", {name: "标记为已完成"})).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name: "新员工自我介绍"}));
    expect(screen.getAllByRole("button", {name: /朗读第/})).toHaveLength(8);
    expect(screen.getByRole("button", {name: "标记为已完成"})).toBeInTheDocument();
  });
  it("toggles translations and grades the completed quiz", () => {
    render(<Training />);
    fireEvent.click(screen.getByRole("button", {name: "进入学习"}));
    expect(screen.getByText(/在进入议程前/)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("中文翻译"));
    expect(screen.queryByText(/在进入议程前/)).not.toBeInTheDocument();
    const check = screen.getByRole("button", {name: /检查答案/});
    expect(check).toBeDisabled();
    fireEvent.click(screen.getByLabelText("I'm still getting up to speed."));
    fireEvent.click(screen.getByLabelText("loop"));
    fireEvent.click(screen.getByLabelText("working"));
    fireEvent.click(check);
    expect(screen.getByRole("status")).toHaveTextContent("答对 3 / 3 题");
  });

  it("persists lesson completion and opens the existing listening player", () => {
    const stored = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => stored.get(key) ?? null,
      setItem: (key: string, value: string) => stored.set(key, value)
    });
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    render(<Training />);
    fireEvent.click(screen.getByRole("button", {name: "进入学习"}));
    fireEvent.click(screen.getByRole("button", {name: "标记为已完成"}));
    expect(localStorage.getItem("quick-intro-complete")).toBe("true");
    fireEvent.click(screen.getByRole("button", {name: "听力与跟读"}));
    expect(screen.getByRole("button", { name: "播放音频" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name: "返回场景课"}));
    expect(screen.getByRole("button", {name: "已完成本课"})).toBeInTheDocument();
  });

  it("opens the rainy-day cloze separately from the Weather lesson", () => {
    render(<Training />);
    fireEvent.click(screen.getByRole("button", { name: /挖词填空.*7\.1\.1/ }));
    expect(screen.getByRole("heading", { name: /7\.1\.1 天气不好/ })).toBeInTheDocument();
    expect(screen.getByText("Morning, David.")).toBeInTheDocument();
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "下一句 →" }));
    expect(screen.getAllByRole("textbox")).toHaveLength(3);
    fireEvent.click(screen.getByRole("button", { name: /返回课程首页/ }));
    expect(screen.getByRole("heading", { name: "职场英语" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "学习天气与环境" }));
    expect(screen.getByRole("heading", { name: /天气与环境/ })).toBeInTheDocument();
  });
});
