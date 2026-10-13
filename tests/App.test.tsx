import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders bilingual captions and seeks the video when a caption is clicked", () => {
    render(<App />);

    const targetCaption = screen.getByRole("button", {
      name: /Like I just got a promotion/
    });
    const video = screen.getByLabelText("English lesson video") as HTMLVideoElement;
    const play = vi.spyOn(video, "play").mockResolvedValue(undefined);

    fireEvent.click(targetCaption);

    expect(video.currentTime).toBe(16);
    expect(play).toHaveBeenCalled();
  });

  it("scrolls the caption panel to keep the current caption centered as playback advances", () => {
    render(<App />);

    const targetCaption = screen.getByRole("button", {
      name: /Here is exactly what that formula might sound like/
    });
    const captionPanel = targetCaption.parentElement as HTMLElement;
    const video = screen.getByLabelText("English lesson video") as HTMLVideoElement;
    const scrollTo = vi.spyOn(captionPanel, "scrollTo");

    Object.defineProperty(captionPanel, "clientHeight", {
      configurable: true,
      value: 400
    });
    Object.defineProperty(targetCaption, "offsetTop", {
      configurable: true,
      value: 1200
    });
    Object.defineProperty(targetCaption, "offsetHeight", {
      configurable: true,
      value: 120
    });
    vi.spyOn(captionPanel, "getBoundingClientRect").mockReturnValue({ top: 300 } as DOMRect);
    vi.spyOn(targetCaption, "getBoundingClientRect").mockReturnValue({ top: 1500, height: 120 } as DOMRect);
    Object.defineProperty(video, "currentTime", {
      configurable: true,
      value: 306
    });

    fireEvent.timeUpdate(video);

    expect(scrollTo).toHaveBeenCalledWith({
      top: 1060,
      behavior: "smooth"
    });
  });

  it("resumes following after manual scrolling even while paused on the same sentence", () => {
    vi.useFakeTimers();
    const { unmount } = render(<App />);
    const target = screen.getByRole("button", { name: /But before we do/ });
    const panel = target.parentElement as HTMLElement;
    const video = screen.getByLabelText("English lesson video") as HTMLVideoElement;
    fireEvent.wheel(panel);
    video.currentTime = 423;
    fireEvent.timeUpdate(video);
    expect(target).toHaveAttribute("aria-current", "true");
    const scroll = vi.spyOn(panel, "scrollTo").mockClear();
    act(() => { vi.advanceTimersByTime(3100); });
    expect(scroll).toHaveBeenCalled();
    unmount();
    vi.useRealTimers();
  });
});
