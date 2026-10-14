import { describe, expect, it } from "vitest";
import { getActiveCaptionIndex } from "./captions";

const captions = [
  {
    start: 0,
    end: 2.5,
    en: "I found it when I was at the antique shop.",
    zh: "我在古董店时发现了它。"
  },
  {
    start: 2.5,
    end: 5,
    en: "You bought it when you were at the antique shop?",
    zh: "你在古董店时买了它？"
  },
  {
    start: 5,
    end: 7,
    en: "Does it even work?",
    zh: "它还能用吗？"
  }
];

describe("getActiveCaptionIndex", () => {
  it("returns the caption whose time range contains the current time", () => {
    expect(getActiveCaptionIndex(captions, 3.2)).toBe(1);
  });

  it("treats the end time as exclusive so adjacent captions switch cleanly", () => {
    expect(getActiveCaptionIndex(captions, 2.5)).toBe(1);
  });

  it("returns -1 when no caption covers the current time", () => {
    expect(getActiveCaptionIndex(captions, 10)).toBe(-1);
  });
});
