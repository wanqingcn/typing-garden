import type { Profile, ProfileState } from "./types";

const avatars: Profile["avatar"][] = ["bear", "cat", "owl", "fox"];

export function createProfile(state: ProfileState, name: string): ProfileState {
  const profile: Profile = {
    id: crypto.randomUUID(),
    name: name.trim() || "New Typist",
    avatar: avatars[state.profiles.length % avatars.length],
    createdAt: new Date().toISOString(),
    progress: {}
  };

  return {
    profiles: [...state.profiles, profile],
    activeProfileId: state.activeProfileId || profile.id
  };
}

export function getActiveProfile(state: ProfileState): Profile | undefined {
  return state.profiles.find((profile) => profile.id === state.activeProfileId);
}

export function switchProfile(state: ProfileState, profileId: string): ProfileState {
  if (!state.profiles.some((profile) => profile.id === profileId)) {
    return state;
  }
  return { ...state, activeProfileId: profileId };
}

export function renameProfile(
  state: ProfileState,
  profileId: string,
  name: string
): ProfileState {
  return {
    ...state,
    profiles: state.profiles.map((profile) =>
      profile.id === profileId ? { ...profile, name: name.trim() || profile.name } : profile
    )
  };
}

export function deleteProfile(state: ProfileState, profileId: string): ProfileState {
  const profiles = state.profiles.filter((profile) => profile.id !== profileId);
  return {
    profiles,
    activeProfileId:
      state.activeProfileId === profileId ? profiles[0]?.id ?? "" : state.activeProfileId
  };
}
