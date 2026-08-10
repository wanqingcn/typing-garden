import { describe, expect, it } from "vitest";
import {
  createProfile,
  deleteProfile,
  getActiveProfile,
  renameProfile,
  switchProfile
} from "./profiles";

describe("profiles", () => {
  it("creates the first child as the active profile", () => {
    const state = createProfile({ profiles: [], activeProfileId: "" }, "小星");

    expect(state.profiles).toHaveLength(1);
    expect(getActiveProfile(state)?.name).toBe("小星");
  });

  it("switches, renames, and deletes profiles without leaking progress", () => {
    let state = createProfile({ profiles: [], activeProfileId: "" }, "Alex");
    state = createProfile(state, "豆豆");
    const alexId = state.profiles[0].id;
    const douId = state.profiles[1].id;

    state = switchProfile(state, douId);
    state = renameProfile(state, douId, "豆豆同学");
    state = deleteProfile(state, alexId);

    expect(state.profiles.map((profile) => profile.name)).toEqual(["豆豆同学"]);
    expect(state.activeProfileId).toBe(douId);
  });

  it("moves active profile to the first remaining child when deleting the active one", () => {
    let state = createProfile({ profiles: [], activeProfileId: "" }, "Alex");
    state = createProfile(state, "豆豆");
    const alexId = state.profiles[0].id;
    const douId = state.profiles[1].id;

    state = switchProfile(state, douId);
    state = deleteProfile(state, douId);

    expect(state.profiles.map((profile) => profile.id)).toEqual([alexId]);
    expect(state.activeProfileId).toBe(alexId);
  });
});
