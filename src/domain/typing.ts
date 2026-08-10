import type {
  AttemptSummary,
  Lesson,
  LessonProgress,
  ProgressByLesson,
  TypingSession
} from "./types";
import { isEquivalentKey } from "./keyEquivalence";

export function createSession(target: string): TypingSession {
  return {
    target,
    typed: "",
    cursor: 0,
    startedAtMs: null,
    endedAtMs: null,
    mistakes: []
  };
}

export function applyKeystroke(
  session: TypingSession,
  key: string,
  atMs = Date.now()
): TypingSession {
  if (session.cursor >= session.target.length || key.length !== 1) {
    return session;
  }

  const expected = session.target[session.cursor];
  const nextCursor = session.cursor + 1;
  const endedAtMs = nextCursor === session.target.length ? atMs : null;

  return {
    ...session,
    typed: session.typed + key,
    cursor: nextCursor,
    startedAtMs: session.startedAtMs ?? atMs,
    endedAtMs,
    mistakes:
      isEquivalentKey(key, expected)
        ? session.mistakes
        : [...session.mistakes, { index: session.cursor, expected, actual: key, atMs }]
  };
}

export function summarizeAttempt(session: TypingSession): AttemptSummary {
  const durationMs = Math.max(
    3_000,
    (session.endedAtMs ?? Date.now()) - (session.startedAtMs ?? 0)
  );
  const typedCount = session.typed.length;
  const correctCount = Math.max(0, typedCount - session.mistakes.length);
  const minutes = durationMs / 60_000;

  return {
    accuracy: typedCount === 0 ? 100 : Math.round((correctCount / typedCount) * 100),
    wpm: Math.round((correctCount / 5 / minutes) * 10) / 10,
    mistakeCount: session.mistakes.length,
    completed: session.cursor >= session.target.length,
    durationMs
  };
}

export function completeLesson(
  progress: ProgressByLesson,
  lesson: Lesson,
  summary: AttemptSummary,
  mistakes: LessonProgress["mistakes"] = []
): ProgressByLesson {
  const previous = progress[lesson.id];
  const passed =
    summary.completed &&
    summary.accuracy >= lesson.minAccuracy;
  const stars = passed ? scoreStars(summary, lesson) : 0;

  return {
    ...progress,
    [lesson.id]: {
      lessonId: lesson.id,
      bestAccuracy: Math.max(previous?.bestAccuracy ?? 0, summary.accuracy),
      bestWpm: Math.max(previous?.bestWpm ?? 0, summary.wpm),
      attempts: (previous?.attempts ?? 0) + 1,
      stars: Math.max(previous?.stars ?? 0, stars),
      completedAt: passed ? new Date().toISOString() : previous?.completedAt ?? null,
      mistakes
    }
  };
}

export function getUnlockedLessonIds(
  allLessons: Lesson[],
  progress: ProgressByLesson
): string[] {
  return allLessons
    .filter((lesson) => {
      if (lesson.kind === "game" || lesson.kind === "key-rain") {
        return true;
      }
      if (!lesson.unlockAfter) {
        return true;
      }
      return (progress[lesson.unlockAfter]?.stars ?? 0) > 0;
    })
    .map((lesson) => lesson.id);
}

function scoreStars(summary: AttemptSummary, lesson: Lesson): number {
  const accuracyBonus = summary.accuracy >= lesson.minAccuracy + 7 ? 1 : 0;
  const speedBonus = summary.wpm >= lesson.minWpm + 8 ? 1 : 0;
  return Math.min(3, 2 + accuracyBonus + speedBonus);
}
