import { describe, expect, it } from "vitest";
import {
  applyWordGameKey,
  buildQueue,
  createIdleWordGame,
  startWordGame,
  tickWordGame,
  type WordEntry
} from "./wordGame";

const words: WordEntry[] = [
  { word: "apple", meaning: "苹果" },
  { word: "book", meaning: "书" },
  { word: "city", meaning: "城市" }
];

describe("word plane game", () => {
  it("starts with ten health and a shuffled queue", () => {
    const state = startWordGame(words, 3, 10, 7);

    expect(state.status).toBe("running");
    expect(state.health).toBe(10);
    expect(state.timeLeftMs).toBe(20 * 60 * 1000);
    expect(state.current).not.toBeNull();
    expect(state.queue).toHaveLength(3);
  });

  it("advances when a word is typed correctly", () => {
    let state = startWordGame([{ word: "go", meaning: "去" }, ...words], 2, 10, 1);
    const currentWord = state.current!.word;

    let result = { state, completedWord: null as WordEntry | null };
    for (const char of currentWord) {
      result = applyWordGameKey(result.state, char);
    }

    expect(result.completedWord?.word).toBe(currentWord);
    expect(result.state.completed).toBe(1);
    expect(result.state.typed).toBe("");
  });

  it("loses one health for each wrong key and ends at zero", () => {
    let state = startWordGame(words, 3, 2, 1);

    state = applyWordGameKey(state, "#").state;
    expect(state.health).toBe(1);
    expect(state.status).toBe("running");
    expect(state.mistakeCount).toBe(1);
    expect(state.typedCount).toBe(1);
    expect(state.mistakes).toEqual([`${state.current!.word[0]} -> #`]);

    state = applyWordGameKey(state, "#").state;
    expect(state.health).toBe(0);
    expect(state.status).toBe("lost");
    expect(state.mistakeCount).toBe(2);
  });

  it("wins after the goal is reached with health left", () => {
    let state = startWordGame([{ word: "a", meaning: "一个" }], 100, 10, 1);

    for (let index = 0; index < 100; index += 1) {
      state = applyWordGameKey(state, "a").state;
    }

    expect(state.status).toBe("won");
    expect(state.health).toBe(10);
    expect(state.completed).toBe(100);
  });

  it("recovers one health every ten completed words without exceeding ten", () => {
    let state = startWordGame([{ word: "a", meaning: "一个" }], 20, 10, 1);
    state = applyWordGameKey(state, "#").state;
    state = applyWordGameKey(state, "#").state;
    expect(state.health).toBe(8);

    for (let index = 0; index < 10; index += 1) {
      state = applyWordGameKey(state, "a").state;
    }
    expect(state.completed).toBe(10);
    expect(state.health).toBe(9);

    for (let index = 0; index < 10; index += 1) {
      state = applyWordGameKey(state, "a").state;
    }
    expect(state.health).toBe(10);
    expect(state.status).toBe("won");
  });

  it("ends the game when the countdown reaches zero", () => {
    const state = startWordGame(words, 3, 10, 1);

    const next = tickWordGame(state, 20 * 60 * 1000);

    expect(next.timeLeftMs).toBe(0);
    expect(next.status).toBe("lost");
  });

  it("accepts Chinese punctuation as equivalent in the word game", () => {
    let state = startWordGame([{ word: "a,b.", meaning: "标点词" }], 1, 10, 1);

    for (const char of ["a", "，", "b", "。"]) {
      state = applyWordGameKey(state, char).state;
    }

    expect(state.status).toBe("won");
    expect(state.health).toBe(10);
  });

  it("builds a varied 100-word queue from a smaller bank", () => {
    const queue = buildQueue(words, 100, 3);

    expect(queue).toHaveLength(100);
    expect(new Set(queue.map((entry) => entry.word)).size).toBeGreaterThan(1);
  });
});
