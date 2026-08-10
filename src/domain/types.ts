export type Language = "en" | "zh";
export type LessonKind =
  | "keys"
  | "letters"
  | "words"
  | "pinyin"
  | "shift"
  | "numbers"
  | "symbols"
  | "key-rain"
  | "game";

export interface Lesson {
  id: string;
  title: string;
  language: Language;
  kind: LessonKind;
  level: number;
  target: string;
  focusKeys: string[];
  unlockAfter?: string;
  minAccuracy: number;
  minWpm: number;
}

export interface Mistake {
  index: number;
  expected: string;
  actual: string;
  atMs: number;
}

export interface TypingSession {
  target: string;
  typed: string;
  cursor: number;
  startedAtMs: number | null;
  endedAtMs: number | null;
  mistakes: Mistake[];
}

export interface AttemptSummary {
  accuracy: number;
  wpm: number;
  mistakeCount: number;
  completed: boolean;
  durationMs: number;
}

export interface LessonProgress {
  lessonId: string;
  bestAccuracy: number;
  bestWpm: number;
  attempts: number;
  stars: number;
  completedAt: string | null;
  mistakes: Mistake[];
}

export type ProgressByLesson = Record<string, LessonProgress>;

export interface Profile {
  id: string;
  name: string;
  avatar: "bear" | "cat" | "owl" | "fox";
  createdAt: string;
  progress: ProgressByLesson;
}

export interface ProfileState {
  profiles: Profile[];
  activeProfileId: string;
}
