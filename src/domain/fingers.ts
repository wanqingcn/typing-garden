import { normalizeTypedKey } from "./keyEquivalence";

export type FingerId =
  | "left-pinky"
  | "left-ring"
  | "left-middle"
  | "left-index"
  | "thumbs"
  | "right-index"
  | "right-middle"
  | "right-ring"
  | "right-pinky";

export type FingerInfo = {
  id: FingerId;
  hand: "left" | "right" | "both";
  label: string;
};

export const fingerGuide: FingerInfo[] = [
  { id: "left-pinky", hand: "left", label: "左手小指" },
  { id: "left-ring", hand: "left", label: "左手无名指" },
  { id: "left-middle", hand: "left", label: "左手中指" },
  { id: "left-index", hand: "left", label: "左手食指" },
  { id: "thumbs", hand: "both", label: "拇指" },
  { id: "right-index", hand: "right", label: "右手食指" },
  { id: "right-middle", hand: "right", label: "右手中指" },
  { id: "right-ring", hand: "right", label: "右手无名指" },
  { id: "right-pinky", hand: "right", label: "右手小指" }
];

const keyToFinger = new Map<string, FingerId>([
  ...keys("1!", "left-pinky"),
  ...keys("2@", "left-ring"),
  ...keys("3#", "left-middle"),
  ...keys("45$%", "left-index"),
  ...keys("qaz", "left-pinky"),
  ...keys("wsx", "left-ring"),
  ...keys("edc", "left-middle"),
  ...keys("rfvtgb", "left-index"),
  [" ", "thumbs"],
  ...keys("67^&", "right-index"),
  ...keys("8*", "right-middle"),
  ...keys("9(", "right-ring"),
  ...keys("0)-_=+[]{}\\|", "right-pinky"),
  ...keys("yhnujm", "right-index"),
  ...keys("ik,", "right-middle"),
  ...keys("ol.", "right-ring"),
  ...keys("p;/:?'", "right-pinky"),
  ['"', "right-pinky"]
]);

export function getFingerForKey(key: string | undefined): FingerInfo | undefined {
  if (!key) {
    return undefined;
  }

  const normalized = normalizeTypedKey(key).toLowerCase();
  const fingerId = keyToFinger.get(normalized);
  return fingerGuide.find((finger) => finger.id === fingerId);
}

function keys(chars: string, finger: FingerId): Array<[string, FingerId]> {
  return chars.split("").map((char) => [char, finger]);
}
