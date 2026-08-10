import { describe, expect, it } from "vitest";
import {
  applyKeyRainKey,
  keyboardRainKeys,
  startKeyRainGame,
  tickKeyRainGame
} from "./keyRain";

describe("key rain game", () => {
  it("starts with randomized letters before randomized other keyboard keys", () => {
    const game = startKeyRainGame(undefined, 10, 7);
    const letters = "abcdefghijklmnopqrstuvwxyz".split("");
    const firstLetters = game.queue.slice(0, 16).map((drop) => drop.key);
    const otherKeys = game.queue.slice(16).map((drop) => drop.key);

    expect(game.status).toBe("running");
    expect(game.health).toBe(10);
    expect(firstLetters).toHaveLength(16);
    expect(firstLetters.every((key) => letters.includes(key))).toBe(true);
    expect(new Set(firstLetters).size).toBe(16);
    expect(firstLetters).not.toEqual(letters.slice(0, 16));
    expect(otherKeys).toEqual(expect.arrayContaining(["0", "1", "!", "?"]));
    expect(game.goal).toBe(keyboardRainKeys.length - 10);
  });

  it("destroys the current key when the child presses the matching key", () => {
    const game = startKeyRainGame(["a", "b"]);
    const result = applyKeyRainKey(game, "a");

    expect(result.destroyedKey).toBe("a");
    expect(result.state.completed).toBe(1);
    expect(result.state.current?.key).toBe("b");
    expect(result.state.destroyedKey).toBe("a");
  });

  it("loses health when the child presses the wrong key or a key reaches the bottom", () => {
    const game = startKeyRainGame(["a", "b"]);
    const wrong = applyKeyRainKey(game, "x").state;
    const missed = tickKeyRainGame(wrong, wrong.current!.fallTimeMs).state;

    expect(wrong.health).toBe(9);
    expect(wrong.current?.key).toBe("a");
    expect(wrong.mistakeCount).toBe(1);
    expect(wrong.typedCount).toBe(1);
    expect(wrong.mistakes).toEqual(["a -> x"]);
    expect(missed.health).toBe(8);
    expect(missed.current?.key).toBe("b");
    expect(missed.mistakeCount).toBe(2);
    expect(missed.mistakes).toEqual(["a -> x", "a missed"]);
  });

  it("recovers one health after ten destroyed keys but never above ten", () => {
    let game = startKeyRainGame("abcdefghij".split(""));
    game = { ...game, health: 9 };

    for (const key of "abcdefghij") {
      game = applyKeyRainKey(game, key).state;
    }

    expect(game.health).toBe(10);
    expect(game.status).toBe("won");
  });
});
