import { describe, expect, it } from "vitest";
import { lessons } from "./lessons";

describe("lessons", () => {
  it("provides a broad course path with varied practice types", () => {
    expect(lessons.length).toBeGreaterThanOrEqual(24);
    expect(lessons.some((lesson) => lesson.kind === "keys")).toBe(true);
    expect(lessons.some((lesson) => lesson.kind === "letters")).toBe(true);
    expect(lessons.some((lesson) => lesson.kind === "words")).toBe(true);
    expect(lessons.some((lesson) => lesson.kind === "pinyin")).toBe(true);
    expect(lessons.some((lesson) => lesson.kind === "shift")).toBe(true);
    expect(lessons.some((lesson) => lesson.kind === "numbers")).toBe(true);
    expect(lessons.some((lesson) => lesson.kind === "symbols")).toBe(true);
    expect(lessons.at(-1)?.kind).toBe("game");
    expect(lessons.some((lesson) => lesson.language === "zh")).toBe(true);
  });

  it("keeps every locked lesson linked to an earlier lesson", () => {
    const seen = new Set<string>();

    for (const lesson of lessons) {
      if (lesson.unlockAfter) {
        expect(seen.has(lesson.unlockAfter)).toBe(true);
      }
      seen.add(lesson.id);
    }
  });

  it("mixes drills, words, and sentence-like targets instead of only repetition", () => {
    const hasShortDrill = lessons.some((lesson) => lesson.target.includes("fj jf"));
    const hasEnglishSentence = lessons.some((lesson) => lesson.target.includes("."));
    const hasPinyinPhrase = lessons.some((lesson) => lesson.target.includes("xiao peng you"));

    expect(hasShortDrill).toBe(true);
    expect(hasEnglishSentence).toBe(true);
    expect(hasPinyinPhrase).toBe(true);
  });

  it("places shift, number, and symbol lessons before the final game", () => {
    const finalIndex = lessons.findIndex((lesson) => lesson.kind === "game");
    const advancedLessons = lessons.filter((lesson) =>
      ["shift", "numbers", "symbols"].includes(lesson.kind)
    );

    expect(advancedLessons.map((lesson) => lesson.title)).toEqual([
      "Challenge 1 / Shift 大写",
      "Challenge 2 / 数字键",
      "Challenge 3 / 常用符号"
    ]);
    expect(advancedLessons.every((lesson) => lessons.indexOf(lesson) < finalIndex)).toBe(true);
    expect(lessons[finalIndex].unlockAfter).toBe(advancedLessons.at(-1)?.id);
  });
});
