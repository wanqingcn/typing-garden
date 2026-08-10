import { describe, expect, it } from "vitest";
import { isEquivalentKey, normalizeTypedKey } from "./keyEquivalence";

describe("key equivalence", () => {
  it("maps Chinese punctuation to the matching keyboard key", () => {
    expect(normalizeTypedKey("，")).toBe(",");
    expect(normalizeTypedKey("。")).toBe(".");
    expect(normalizeTypedKey("；")).toBe(";");
    expect(normalizeTypedKey("：")).toBe(":");
    expect(normalizeTypedKey("？")).toBe("?");
    expect(normalizeTypedKey("！")).toBe("!");
  });

  it("treats full-width punctuation as equivalent to expected ASCII punctuation", () => {
    expect(isEquivalentKey("，", ",")).toBe(true);
    expect(isEquivalentKey("。", ".")).toBe(true);
    expect(isEquivalentKey("；", ";")).toBe(true);
    expect(isEquivalentKey("、", "/")).toBe(true);
  });
});
