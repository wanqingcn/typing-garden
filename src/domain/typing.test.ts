import { describe, expect, it } from "vitest";
import {
  applyKeystroke,
  completeLesson,
  createSession,
  getUnlockedLessonIds,
  summarizeAttempt
} from "./typing";
import { lessons } from "../data/lessons";

describe("typing session", () => {
  it("tracks current position, mistakes, and missed characters", () => {
    const session = createSession("abc");

    const first = applyKeystroke(session, "a", 1_000);
    const second = applyKeystroke(first, "x", 2_000);
    const third = applyKeystroke(second, "c", 3_000);

    expect(third.typed).toBe("axc");
    expect(third.cursor).toBe(3);
    expect(third.mistakes).toEqual([
      { index: 1, expected: "b", actual: "x", atMs: 2_000 }
    ]);
  });

  it("computes accuracy and words per minute from an attempt", () => {
    const session = {
      ...createSession("hello"),
      typed: "hxllo",
      cursor: 5,
      startedAtMs: 0,
      endedAtMs: 60_000,
      mistakes: [{ index: 1, expected: "e", actual: "x", atMs: 10 }]
    };

    expect(summarizeAttempt(session)).toMatchObject({
      accuracy: 80,
      wpm: 0.8,
      mistakeCount: 1,
      completed: true
    });
  });

  it("keeps very short attempts from producing unrealistic speed", () => {
    const session = {
      ...createSession("abcde"),
      typed: "abcde",
      cursor: 5,
      startedAtMs: 0,
      endedAtMs: 1,
      mistakes: []
    };

    expect(summarizeAttempt(session).wpm).toBe(20);
  });

  it("accepts Chinese punctuation as the same physical punctuation key", () => {
    const session = createSession(",.;");

    const first = applyKeystroke(session, "，", 1_000);
    const second = applyKeystroke(first, "。", 2_000);
    const third = applyKeystroke(second, "；", 3_000);

    expect(third.cursor).toBe(3);
    expect(third.mistakes).toEqual([]);
  });
});

describe("progression", () => {
  it("unlocks the next lesson only after meeting score gates", () => {
    const progress = completeLesson({}, lessons[0], {
      accuracy: 91,
      wpm: 12,
      mistakeCount: 1,
      completed: true,
      durationMs: 30_000
    });

    expect(progress[lessons[0].id].stars).toBe(2);
    expect(getUnlockedLessonIds(lessons, progress)).toContain(lessons[1].id);
  });

  it("keeps the next lesson locked when accuracy is too low", () => {
    const progress = completeLesson({}, lessons[0], {
      accuracy: 78,
      wpm: 12,
      mistakeCount: 3,
      completed: true,
      durationMs: 30_000
    });

    expect(getUnlockedLessonIds(lessons, progress)).not.toContain(lessons[1].id);
  });

  it("unlocks the next lesson after a perfect but slow attempt", () => {
    const topMixIndex = lessons.findIndex((lesson) => lesson.id === "top-mix");
    const topMix = lessons[topMixIndex];
    const nextLesson = lessons[topMixIndex + 1];

    const progress = completeLesson({}, topMix, {
      accuracy: 100,
      wpm: 4,
      mistakeCount: 0,
      completed: true,
      durationMs: 90_000
    });

    expect(progress[topMix.id].stars).toBeGreaterThan(0);
    expect(getUnlockedLessonIds(lessons, progress)).toContain(nextLesson.id);
  });

  it("always unlocks the final game lesson", () => {
    const finalLesson = lessons.at(-1)!;

    expect(finalLesson.kind).toBe("game");
    expect(getUnlockedLessonIds(lessons, {})).toContain(finalLesson.id);
  });
});
