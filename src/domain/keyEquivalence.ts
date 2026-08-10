const keyAliases: Record<string, string> = {
  "，": ",",
  "。": ".",
  "；": ";",
  "：": ":",
  "？": "?",
  "！": "!",
  "、": "/",
  "（": "(",
  "）": ")",
  "【": "[",
  "】": "]",
  "《": "<",
  "》": ">",
  "“": '"',
  "”": '"',
  "‘": "'",
  "’": "'",
  "－": "-",
  "—": "-",
  "～": "~",
  "　": " "
};

export function normalizeTypedKey(key: string) {
  return keyAliases[key] ?? key;
}

export function isEquivalentKey(actual: string, expected: string) {
  return normalizeTypedKey(actual).toLowerCase() === normalizeTypedKey(expected).toLowerCase();
}
