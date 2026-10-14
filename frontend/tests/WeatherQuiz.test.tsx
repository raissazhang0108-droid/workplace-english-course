import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import WeatherQuiz from "../src/WeatherQuiz";
import { clozeBlanks, rainyDialogueRows } from "../src/lib/weatherQuiz";

describe("WeatherQuiz", () => {
  const fetchMock = vi.fn();

  function answerAllSentencesCorrectly() {
    let nextBlank = 0;
    rainyDialogueRows.forEach((row, pageIndex) => {
      const inputs = screen.queryAllByRole("textbox");
      inputs.forEach((input, index) => {
        fireEvent.change(input, { target: { value: clozeBlanks[nextBlank + index].answer } });
      });
      nextBlank += inputs.length;
      if (pageIndex < rainyDialogueRows.length - 1) {
        fireEvent.click(screen.getByRole("button", { name: "下一句 →" }));
      }
    });
  }

  beforeEach(() => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const storage = new Map([
      ["english-course-anonymous-learner-id-v1", "learner-test-id"],
    ]);
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    });
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(Response.json({ attempts: [] }));
  });

  it("shows one sentence at a time and preserves answers while paging", () => {
    render(<WeatherQuiz onBack={() => {}} />);
    expect(screen.getByRole("heading", { name: /7\.1\.1 天气不好/ })).toBeInTheDocument();
    expect(screen.getByText("Morning, David.")).toBeInTheDocument();
    expect(screen.queryByText("Anyway, let's dive into the release updates, shall we?")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "下一句 →" }));
    expect(screen.getAllByRole("textbox")).toHaveLength(3);
    fireEvent.change(screen.getAllByRole("textbox")[0], { target: { value: "How's" } });
    fireEvent.click(screen.getByRole("button", { name: /上一句/ }));
    fireEvent.click(screen.getByRole("button", { name: "下一句 →" }));
    expect(screen.getAllByRole("textbox")[0]).toHaveValue("How's");
  });

  it("submits the complete answer set to the backend for grading", async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ attempts: [] }));
    fetchMock.mockResolvedValueOnce(Response.json({
      id: "attempt-1",
      completedAt: "2026-10-12T12:00:00Z",
      answers: clozeBlanks.map((blank) => blank.answer),
      correctness: clozeBlanks.map(() => true),
      score: clozeBlanks.length,
    }));
    render(<WeatherQuiz onBack={() => {}} />);
    answerAllSentencesCorrectly();
    fireEvent.click(screen.getByRole("button", { name: /检查全部答案/ }));
    expect(await screen.findByText(/🎉 答对/)).toHaveTextContent(`答对 ${clozeBlanks.length} / ${clozeBlanks.length}`);
    expect(fetchMock).toHaveBeenCalledWith("/api/attempts", expect.objectContaining({ method: "POST" }));
  });

  it("retries with empty answers and returns to the course home", async () => {
    const onBack = vi.fn();
    render(<WeatherQuiz onBack={onBack} />);
    answerAllSentencesCorrectly();
    fetchMock.mockResolvedValueOnce(Response.json({
      id: "attempt-1", completedAt: new Date().toISOString(), answers: Array(21).fill(""),
      correctness: Array(21).fill(false), score: 0,
    }));
    fireEvent.click(screen.getByRole("button", { name: /检查全部答案/ }));
    fireEvent.click(await screen.findByRole("button", { name: /再闯一次/ }));
    expect(screen.getByText("Morning, David.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /返回课程首页/ }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("shows backend errors and keeps the learner's answers available to retry", async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ attempts: [] }));
    fetchMock.mockRejectedValueOnce(new Error("offline"));
    render(<WeatherQuiz onBack={() => {}} />);
    answerAllSentencesCorrectly();
    fireEvent.click(screen.getByRole("button", { name: /检查全部答案/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/成绩未能保存/);
    expect(screen.getByRole("button", { name: /重试提交/ })).toBeInTheDocument();
  });
});
