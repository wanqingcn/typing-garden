import type { Lesson } from "../domain/types";

function lesson(
  id: string,
  title: string,
  target: string,
  focusKeys: string[],
  options: Partial<Omit<Lesson, "id" | "title" | "target" | "focusKeys">> = {}
): Lesson {
  return {
    id,
    title,
    target,
    focusKeys,
    language: options.language ?? "en",
    kind: options.kind ?? "keys",
    level: options.level ?? 1,
    unlockAfter: options.unlockAfter,
    minAccuracy: options.minAccuracy ?? 85,
    minWpm: options.minWpm ?? 6
  };
}

export const lessons: Lesson[] = [
  lesson("home-fj", "Easy 1 / 食指 fj", "f j fj jf fj jf", ["f", "j"], {
    level: 1
  }),
  lesson("home-dk", "Easy 2 / 中指 dk", "dk kd fj jf dk kd", ["d", "k", "f", "j"], {
    level: 2,
    unlockAfter: "home-fj"
  }),
  lesson("home-sl", "Easy 3 / 无名指 sl", "sl ls dk kd sl ls", ["s", "l", "d", "k"], {
    level: 3,
    unlockAfter: "home-dk"
  }),
  lesson("home-a-semi", "Easy 4 / 小指 a;", "a; ;a sl ls a; ;a", ["a", ";", "s", "l"], {
    level: 4,
    unlockAfter: "home-sl",
    minAccuracy: 86
  }),
  lesson("home-gh", "Easy 5 / 中央 gh", "gh hg fj jf gh hg", ["g", "h", "f", "j"], {
    level: 5,
    unlockAfter: "home-a-semi",
    minAccuracy: 86
  }),
  lesson(
    "home-mix-1",
    "Easy 6 / 基准混合",
    "fj jf dk kd sl ls a; ;a gh hg",
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
    { level: 6, unlockAfter: "home-gh", minAccuracy: 87, minWpm: 7 }
  ),
  lesson(
    "home-rhythm",
    "Easy 7 / 节奏组合",
    "fl kd ja sl ask lad fall dad",
    ["a", "s", "d", "f", "j", "k", "l"],
    { kind: "letters", level: 7, unlockAfter: "home-mix-1", minAccuracy: 88, minWpm: 8 }
  ),
  lesson(
    "home-review",
    "Easy 8 / 基准复习",
    "sad lad flask salad; a dad asks",
    ["a", "s", "d", "f", "j", "k", "l", ";"],
    { kind: "words", level: 8, unlockAfter: "home-rhythm", minAccuracy: 88, minWpm: 8 }
  ),
  lesson("top-ru", "Medium 1 / 上排 ru", "ru ur fj jf ru ur", ["r", "u", "f", "j"], {
    level: 9,
    unlockAfter: "home-review",
    minAccuracy: 88,
    minWpm: 8
  }),
  lesson("top-ei", "Medium 2 / 上排 ei", "ei ie ru ur ei ie", ["e", "i", "r", "u"], {
    level: 10,
    unlockAfter: "top-ru",
    minAccuracy: 88,
    minWpm: 8
  }),
  lesson("top-wo", "Medium 3 / 上排 wo", "wo ow ei ie wo ow", ["w", "o", "e", "i"], {
    level: 11,
    unlockAfter: "top-ei",
    minAccuracy: 89,
    minWpm: 9
  }),
  lesson("top-qp", "Medium 4 / 上排 qp", "qp pq wo ow qp pq", ["q", "p", "w", "o"], {
    level: 12,
    unlockAfter: "top-wo",
    minAccuracy: 89,
    minWpm: 9
  }),
  lesson("top-ty", "Medium 5 / 上排 ty", "ty yt qp pq ty yt", ["t", "y", "q", "p"], {
    level: 13,
    unlockAfter: "top-qp",
    minAccuracy: 89,
    minWpm: 9
  }),
  lesson(
    "top-mix",
    "Medium 6 / 上排混合",
    "red kite quiet pony toy row",
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    { kind: "words", level: 14, unlockAfter: "top-ty", minAccuracy: 90, minWpm: 10 }
  ),
  lesson(
    "top-sentence",
    "Medium 7 / 英文短句",
    "we type quiet words. you read it.",
    ["w", "e", "t", "y", "u", "i", "o", "r", "d", "s"],
    { kind: "words", level: 15, unlockAfter: "top-mix", minAccuracy: 90, minWpm: 10 }
  ),
  lesson(
    "top-review",
    "Medium 8 / 上排复习",
    "quick kids write tidy notes.",
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "k", "d", "s"],
    { kind: "words", level: 16, unlockAfter: "top-sentence", minAccuracy: 90, minWpm: 10 }
  ),
  lesson("bottom-vm", "Hard 1 / 下排 vm", "vm mv ru ur vm mv", ["v", "m", "r", "u"], {
    level: 17,
    unlockAfter: "top-review",
    minAccuracy: 90,
    minWpm: 10
  }),
  lesson("bottom-c-comma", "Hard 2 / 下排 c,", "c, ,c vm mv c, ,c", ["c", ",", "v", "m"], {
    level: 18,
    unlockAfter: "bottom-vm",
    minAccuracy: 90,
    minWpm: 10
  }),
  lesson("bottom-x-dot", "Hard 3 / 下排 x.", "x. .x c, ,c x. .x", ["x", ".", "c", ","], {
    level: 19,
    unlockAfter: "bottom-c-comma",
    minAccuracy: 90,
    minWpm: 10
  }),
  lesson("bottom-z-slash", "Hard 4 / 下排 z/", "z/ /z x. .x z/ /z", ["z", "/", "x", "."], {
    level: 20,
    unlockAfter: "bottom-x-dot",
    minAccuracy: 91,
    minWpm: 10
  }),
  lesson("bottom-bn", "Hard 5 / 下排 bn", "bn nb z/ /z bn nb", ["b", "n", "z", "/"], {
    level: 21,
    unlockAfter: "bottom-z-slash",
    minAccuracy: 91,
    minWpm: 11
  }),
  lesson(
    "bottom-mix",
    "Hard 6 / 全键混合",
    "brave foxes jump quickly.",
    ["b", "r", "a", "v", "e", "f", "o", "x", "j", "u", "m", "p", "q"],
    { kind: "words", level: 22, unlockAfter: "bottom-bn", minAccuracy: 91, minWpm: 11 }
  ),
  lesson(
    "english-story-1",
    "Story 1 / 小故事",
    "a small kid plants a seed.",
    ["a", "s", "m", "l", "k", "i", "d", "p", "n", "t"],
    { kind: "words", level: 23, unlockAfter: "bottom-mix", minAccuracy: 92, minWpm: 11 }
  ),
  lesson(
    "english-story-2",
    "Story 2 / 继续挑战",
    "the green garden grows in the sun.",
    ["t", "h", "e", "g", "r", "n", "a", "d", "s", "u"],
    { kind: "words", level: 24, unlockAfter: "english-story-1", minAccuracy: 92, minWpm: 12 }
  ),
  lesson(
    "pinyin-basic",
    "Pinyin 1 / 问好",
    "ni hao xiao peng you",
    ["n", "i", "h", "a", "o", "x", "p", "y"],
    {
      language: "zh",
      kind: "pinyin",
      level: 25,
      unlockAfter: "english-story-2",
      minAccuracy: 90,
      minWpm: 10
    }
  ),
  lesson(
    "pinyin-family",
    "Pinyin 2 / 家人",
    "ba ba ma ma wo ai ni",
    ["b", "a", "m", "w", "o", "i", "n"],
    {
      language: "zh",
      kind: "pinyin",
      level: 26,
      unlockAfter: "pinyin-basic",
      minAccuracy: 90,
      minWpm: 10
    }
  ),
  lesson(
    "pinyin-study",
    "Pinyin 3 / 学习",
    "wo yao lian xi da zi",
    ["w", "o", "y", "a", "l", "i", "n", "x", "d", "z"],
    {
      language: "zh",
      kind: "pinyin",
      level: 27,
      unlockAfter: "pinyin-family",
      minAccuracy: 91,
      minWpm: 11
    }
  ),
  lesson(
    "shift-uppercase",
    "Challenge 1 / Shift 大写",
    "A S D F J K L P",
    ["Shift", "A", "S", "D", "F", "J", "K", "L", "P"],
    {
      kind: "shift",
      level: 28,
      unlockAfter: "pinyin-study",
      minAccuracy: 91,
      minWpm: 10
    }
  ),
  lesson(
    "number-row",
    "Challenge 2 / 数字键",
    "123 456 789 0",
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    {
      kind: "numbers",
      level: 29,
      unlockAfter: "shift-uppercase",
      minAccuracy: 90,
      minWpm: 9
    }
  ),
  lesson(
    "common-symbols",
    "Challenge 3 / 常用符号",
    "! ? . , ; :",
    ["Shift", "!", "?", ".", ",", ";", ":"],
    {
      kind: "symbols",
      level: 30,
      unlockAfter: "number-row",
      minAccuracy: 90,
      minWpm: 8
    }
  ),
  lesson(
    "key-rain-game",
    "Game / 键盘雨",
    "start game",
    ["a", "s", "d", "f", "j", "k", "l", ";"],
    {
      language: "en",
      kind: "key-rain",
      level: 31,
      unlockAfter: "common-symbols",
      minAccuracy: 92,
      minWpm: 11
    }
  ),
  lesson(
    "word-plane-game",
    "Final / 单词空战",
    "start word plane game",
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "j", "k", "l"],
    {
      language: "en",
      kind: "game",
      level: 32,
      unlockAfter: "common-symbols",
      minAccuracy: 92,
      minWpm: 11
    }
  )
];
