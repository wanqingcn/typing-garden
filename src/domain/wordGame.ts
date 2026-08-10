import { isEquivalentKey } from "./keyEquivalence";

export interface WordEntry {
  word: string;
  meaning: string;
}

export type WordGameStatus = "idle" | "running" | "won" | "lost";

export interface WordGameState {
  status: WordGameStatus;
  health: number;
  completed: number;
  mistakeCount: number;
  mistakes: string[];
  typedCount: number;
  typed: string;
  current: WordEntry | null;
  queue: WordEntry[];
  goal: number;
  timeLeftMs: number;
  totalTimeMs: number;
}

export interface WordGameResult {
  state: WordGameState;
  completedWord: WordEntry | null;
}

export function createIdleWordGame(goal = 100, health = 10, totalTimeMs = 20 * 60 * 1000): WordGameState {
  return {
    status: "idle",
    health,
    completed: 0,
    mistakeCount: 0,
    mistakes: [],
    typedCount: 0,
    typed: "",
    current: null,
    queue: [],
    goal,
    timeLeftMs: totalTimeMs,
    totalTimeMs
  };
}

export function startWordGame(
  words: WordEntry[],
  goal = 100,
  health = 10,
  seed = Date.now(),
  totalTimeMs = 20 * 60 * 1000
): WordGameState {
  const queue = buildQueue(words, goal, seed);
  return {
    status: "running",
    health,
    completed: 0,
    mistakeCount: 0,
    mistakes: [],
    typedCount: 0,
    typed: "",
    current: queue[0] ?? null,
    queue,
    goal,
    timeLeftMs: totalTimeMs,
    totalTimeMs
  };
}

export function applyWordGameKey(state: WordGameState, key: string): WordGameResult {
  if (state.status !== "running" || !state.current || key.length !== 1) {
    return { state, completedWord: null };
  }

  const expected = state.current.word[state.typed.length];

  if (!isEquivalentKey(key, expected)) {
    const health = state.health - 1;
    return {
      state: {
        ...state,
        health,
        mistakeCount: state.mistakeCount + 1,
        mistakes: [...state.mistakes, `${expected} -> ${key}`],
        typedCount: state.typedCount + 1,
        status: health <= 0 ? "lost" : "running"
      },
      completedWord: null
    };
  }

  const typed = state.typed + state.current.word[state.typed.length];
  const typedCount = state.typedCount + 1;
  if (typed.length < state.current.word.length) {
    return { state: { ...state, typed, typedCount }, completedWord: null };
  }

  const completed = state.completed + 1;
  const health = completed % 10 === 0 ? Math.min(10, state.health + 1) : state.health;
  const completedWord = state.current;
  if (completed >= state.goal) {
    return {
      state: {
        ...state,
        completed,
        health,
        typedCount,
        typed: "",
        current: null,
        status: "won"
      },
      completedWord
    };
  }

  return {
    state: {
      ...state,
      completed,
      health,
      typedCount,
      typed: "",
      current: state.queue[completed] ?? null
    },
    completedWord
  };
}

export function tickWordGame(state: WordGameState, elapsedMs: number): WordGameState {
  if (state.status !== "running") {
    return state;
  }

  const timeLeftMs = Math.max(0, state.timeLeftMs - elapsedMs);
  return {
    ...state,
    timeLeftMs,
    status: timeLeftMs === 0 ? "lost" : state.status
  };
}

export function buildQueue(words: WordEntry[], goal: number, seed: number) {
  if (words.length === 0) {
    return [];
  }

  const queue: WordEntry[] = [];
  let round = 0;
  while (queue.length < goal) {
    queue.push(...shuffle(words, seed + round));
    round += 1;
  }
  return queue.slice(0, goal);
}

function shuffle(words: WordEntry[], seed: number) {
  const result = [...words];
  let random = seededRandom(seed);

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

function seededRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) {
    value += 2147483646;
  }
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}
