import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Training from "./Training";

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
  it("opens the alternate homepage and filters its course cards", () => {
    render(<Training />);
    fireEvent.click(screen.getByRole("button", {name: "全球化实战首页"}));
    const catalog = document.querySelector(".global-home .home-library");
    expect(catalog).not.toBeNull();
    fireEvent.click(within(catalog as HTMLElement).getByRole("tab", {name: /面试英语/}));
    expect(within(catalog as HTMLElement).getAllByRole("article")).toHaveLength(1);
    fireEvent.click(within(catalog as HTMLElement).getByRole("button", {name: "学习面试自我介绍"}));
    expect(document.querySelector(".lesson-kicker")).toHaveTextContent("INTERVIEWS");
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
});
