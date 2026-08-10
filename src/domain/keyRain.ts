import { isEquivalentKey } from "./keyEquivalence";

export type KeyRainStatus = "idle" | "running" | "won" | "lost";

export interface KeyDrop {
  key: string;
  index: number;
  elapsedMs: number;
  fallTimeMs: number;
  lane: number;
}

export interface KeyRainState {
  status: KeyRainStatus;
  health: number;
  completed: number;
  mistakeCount: number;
  mistakes: string[];
  typedCount: number;
  current: KeyDrop | null;
  queue: KeyDrop[];
  goal: number;
  destroyedKey: string | null;
  missedKey: string | null;
}

export interface KeyRainKeyResult {
  state: KeyRainState;
  destroyedKey: string | null;
}

export interface KeyRainTickResult {
  state: KeyRainState;
  missedKey: string | null;
}

export const keyboardRainKeys = [
  ..."abcdefghijklmnopqrstuvwxyz".split(""),
  ..."0123456789".split(""),
  ...["!", "?", ";", ":", ",", ".", "-", "_", "'", '"', "/", "(", ")"]
];

const letterKeys = "abcdefghijklmnopqrstuvwxyz".split("");
const otherKeyboardRainKeys = keyboardRainKeys.filter((key) => !letterKeys.includes(key));
const defaultFallTimeMs = 5200;
const laneCount = 8;
const defaultKeyRainGoal = 16 + otherKeyboardRainKeys.length;

export function createIdleKeyRainGame(): KeyRainState {
  return {
    status: "idle",
    health: 10,
    completed: 0,
    mistakeCount: 0,
    mistakes: [],
    typedCount: 0,
    current: null,
    queue: [],
    goal: defaultKeyRainGoal,
    destroyedKey: null,
    missedKey: null
  };
}

export function startKeyRainGame(
  keys: string[] | undefined = undefined,
  health = 10,
  seed = Date.now()
): KeyRainState {
  const orderedKeys = keys ?? buildDefaultKeyRainKeys(seed);
  const queue = orderedKeys.map((key, index) => ({
    key,
    index,
    elapsedMs: 0,
    fallTimeMs: defaultFallTimeMs,
    lane: index % laneCount
  }));

  return {
    status: "running",
    health,
    completed: 0,
    mistakeCount: 0,
    mistakes: [],
    typedCount: 0,
    current: queue[0] ?? null,
    queue,
    goal: queue.length,
    destroyedKey: null,
    missedKey: null
  };
}

export function buildDefaultKeyRainKeys(seed = Date.now()) {
  return [
    ...shuffle(letterKeys, seed).slice(0, 16),
    ...shuffle(otherKeyboardRainKeys, seed + 1)
  ];
}

export function applyKeyRainKey(state: KeyRainState, key: string): KeyRainKeyResult {
  if (state.status !== "running" || !state.current || key.length !== 1) {
    return { state, destroyedKey: null };
  }

  if (!isEquivalentKey(key, state.current.key)) {
    return {
      state: loseHealth({
        ...state,
        mistakeCount: state.mistakeCount + 1,
        mistakes: [...state.mistakes, `${state.current.key} -> ${key}`],
        typedCount: state.typedCount + 1,
        destroyedKey: null,
        missedKey: null
      }),
      destroyedKey: null
    };
  }

  const destroyedKey = state.current.key;
  return {
    state: advanceDrop({
      ...state,
      completed: state.completed + 1,
      typedCount: state.typedCount + 1,
      health:
        (state.completed + 1) % 10 === 0 ? Math.min(10, state.health + 1) : state.health,
      destroyedKey,
      missedKey: null
    }),
    destroyedKey
  };
}

export function tickKeyRainGame(state: KeyRainState, elapsedMs: number): KeyRainTickResult {
  if (state.status !== "running" || !state.current) {
    return { state, missedKey: null };
  }

  const current = {
    ...state.current,
    elapsedMs: state.current.elapsedMs + elapsedMs
  };

  if (current.elapsedMs < current.fallTimeMs) {
    return {
      state: { ...state, current, destroyedKey: null, missedKey: null },
      missedKey: null
    };
  }

  const missedKey = current.key;
  return {
    state: advanceDrop(loseHealth({
      ...state,
      current,
      mistakeCount: state.mistakeCount + 1,
      mistakes: [...state.mistakes, `${missedKey} missed`],
      destroyedKey: null,
      missedKey
    })),
    missedKey
  };
}

function loseHealth(state: KeyRainState): KeyRainState {
  const health = state.health - 1;
  return {
    ...state,
    health,
    status: health <= 0 ? "lost" : state.status
  };
}

function advanceDrop(state: KeyRainState): KeyRainState {
  if (state.status === "lost") {
    return state;
  }

  const nextIndex = (state.current?.index ?? -1) + 1;
  const current = state.queue[nextIndex] ?? null;

  return {
    ...state,
    current,
    status: current ? state.status : "won"
  };
}

function shuffle(keys: string[], seed: number) {
  const result = [...keys];
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
