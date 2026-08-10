import { describe, expect, it } from "vitest";
import { getFingerForKey } from "./fingers";

describe("finger guide", () => {
  it("maps home row keys to the correct fingers", () => {
    expect(getFingerForKey("f")?.label).toBe("左手食指");
    expect(getFingerForKey("j")?.label).toBe("右手食指");
    expect(getFingerForKey("d")?.label).toBe("左手中指");
    expect(getFingerForKey("k")?.label).toBe("右手中指");
    expect(getFingerForKey("a")?.label).toBe("左手小指");
    expect(getFingerForKey(";")?.label).toBe("右手小指");
  });

  it("normalizes uppercase and Chinese punctuation before choosing a finger", () => {
    expect(getFingerForKey("F")?.label).toBe("左手食指");
    expect(getFingerForKey("；")?.label).toBe("右手小指");
  });

  it("uses thumbs for the space key", () => {
    expect(getFingerForKey(" ")?.label).toBe("拇指");
  });

  it("maps number row and shifted symbols to keyboard fingers", () => {
    expect(getFingerForKey("1")?.label).toBe("左手小指");
    expect(getFingerForKey("4")?.label).toBe("左手食指");
    expect(getFingerForKey("7")?.label).toBe("右手食指");
    expect(getFingerForKey("0")?.label).toBe("右手小指");
    expect(getFingerForKey("!")?.label).toBe("左手小指");
    expect(getFingerForKey("?")?.label).toBe("右手小指");
  });
});
