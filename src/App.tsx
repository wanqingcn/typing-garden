import {
  Award,
  BarChart3,
  BookOpen,
  Keyboard,
  Lock,
  Volume2,
  VolumeX,
  RotateCcw,
  Play,
  Sparkles,
  UserPlus,
  Gamepad2,
  Trash2
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { lessons } from "./data/lessons";
import { juniorWordBank } from "./data/wordBank";
import {
  applyKeystroke,
  completeLesson,
  createSession,
  getUnlockedLessonIds,
  summarizeAttempt
} from "./domain/typing";
import { fingerGuide, getFingerForKey, type FingerInfo } from "./domain/fingers";
import type { AttemptSummary, Lesson, ProfileState, TypingSession } from "./domain/types";
import {
  createProfile,
  getActiveProfile,
  deleteProfile,
  renameProfile,
  switchProfile
} from "./domain/profiles";
import { playTypewriterClick } from "./domain/sound";
import {
  applyWordGameKey,
  createIdleWordGame,
  startWordGame,
  tickWordGame,
  type WordEntry,
  type WordGameState
} from "./domain/wordGame";
import {
  applyKeyRainKey,
  createIdleKeyRainGame,
  startKeyRainGame,
  tickKeyRainGame,
  type KeyRainState
} from "./domain/keyRain";
import "./styles.css";

const initialState = createProfile({ profiles: [], activeProfileId: "" }, "Kid");
const baseKeyboardRows = ["qwertyuiop", "asdfghjkl;", "zxcvbnm"].map((row) =>
  row.split("")
);
const numberKeyboardRow = "1234567890".split("");
const symbolKeyboardRow = ["!", "?", ";", ":", ",", ".", "-", "_", "'", '"'];
const shiftedLetterRows = ["QWERTYUIOP", "ASDFGHJKL:", "ZXCVBNM"].map((row) =>
  row.split("")
);
const wordGameGoal = 100;
type KeyboardKey = string | "left-shift" | "right-shift";
interface StatsPanelData {
  wpm: string;
  accuracy: string;
  mistakes: string;
  progress: string;
  missedKeys: string[];
}

export default function App() {
  const [profileState, setProfileState] = useState<ProfileState>(() => loadProfiles());
  const activeProfile = getActiveProfile(profileState) ?? profileState.profiles[0];
  const unlockedIds = useMemo(
    () => getUnlockedLessonIds(lessons, activeProfile?.progress ?? {}),
    [activeProfile?.progress]
  );
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0].id);
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0];
  const [session, setSession] = useState<TypingSession>(() =>
    createSession(selectedLesson.target)
  );
  const [soundMuted, setSoundMuted] = useState(false);
  const [wordGame, setWordGame] = useState<WordGameState>(() => createIdleWordGame());
  const [keyRainGame, setKeyRainGame] = useState<KeyRainState>(() => createIdleKeyRainGame());
  const summary = summarizeAttempt(session);
  const isLocked = !unlockedIds.includes(selectedLesson.id);
  const isGameLesson = selectedLesson.kind === "game";
  const isKeyRainLesson = selectedLesson.kind === "key-rain";
  const pinnedLessons = lessons.filter((lesson) => lesson.kind === "key-rain" || lesson.kind === "game");
  const regularLessons = lessons.filter((lesson) => lesson.kind !== "game" && lesson.kind !== "key-rain");

  function persist(next: ProfileState) {
    setProfileState(next);
    saveProfiles(next);
  }

  function chooseLesson(lesson: Lesson) {
    setSelectedLessonId(lesson.id);
    setSession(createSession(lesson.target));
    setWordGame(createIdleWordGame());
    setKeyRainGame(createIdleKeyRainGame());
  }

  function resetLesson() {
    setSession(createSession(selectedLesson.target));
    if (isGameLesson) {
      setWordGame(createIdleWordGame());
    }
    if (isKeyRainLesson) {
      setKeyRainGame(createIdleKeyRainGame());
    }
  }

  useEffect(() => {
    function handleWindowKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTextField =
        target instanceof HTMLInputElement && target.id === "profile-name";
      if (isTextField || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        resetLesson();
        return;
      }
      if (event.key.length !== 1) {
        return;
      }
      event.preventDefault();
      if (isGameLesson) {
        handleGameKey(event.key);
        return;
      }
      if (isKeyRainLesson) {
        handleKeyRainKey(event.key);
        return;
      }
      handleKey(event.key);
    }

    window.addEventListener("keydown", handleWindowKeyDown);
    return () => window.removeEventListener("keydown", handleWindowKeyDown);
  });

  useEffect(() => {
    if (!isGameLesson || wordGame.status !== "running") {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setWordGame((game) => tickWordGame(game, 1000));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isGameLesson, wordGame.status]);

  useEffect(() => {
    if (!isKeyRainLesson || keyRainGame.status !== "running") {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setKeyRainGame((game) => tickKeyRainGame(game, 120).state);
    }, 120);

    return () => window.clearInterval(timer);
  }, [isKeyRainLesson, keyRainGame.status]);

  function handleInput(value: string) {
    if (isGameLesson) {
      const nextKey = value.at(-1);
      if (nextKey) {
        handleGameKey(nextKey);
      }
      return;
    }
    if (isKeyRainLesson) {
      const nextKey = value.at(-1);
      if (nextKey) {
        handleKeyRainKey(nextKey);
      }
      return;
    }
    if (isLocked || session.cursor >= selectedLesson.target.length) {
      return;
    }
    if (value.length <= session.typed.length) {
      return;
    }

    let next = session;
    for (const nextKey of value.slice(session.typed.length)) {
      next = applyKeystroke(next, nextKey, Date.now());
      playTypewriterClick(soundMuted);
    }
    commitSession(next);
  }

  function handleKey(key: string) {
    if (isGameLesson) {
      handleGameKey(key);
      return;
    }
    if (isKeyRainLesson) {
      handleKeyRainKey(key);
      return;
    }
    if (isLocked || session.cursor >= selectedLesson.target.length) {
      return;
    }
    playTypewriterClick(soundMuted);
    commitSession(applyKeystroke(session, key, Date.now()));
  }

  function commitSession(next: TypingSession) {
    setSession(next);

    if (next.cursor < selectedLesson.target.length || !activeProfile) {
      return;
    }

    const attempt = summarizeAttempt(next);
    const nextProfiles = profileState.profiles.map((profile) =>
      profile.id === activeProfile.id
        ? {
            ...profile,
            progress: completeLesson(profile.progress, selectedLesson, attempt, next.mistakes)
          }
        : profile
    );
    persist({ ...profileState, profiles: nextProfiles });
  }

  function beginWordGame() {
    if (isLocked) {
      return;
    }
    setWordGame(startWordGame(juniorWordBank, wordGameGoal, 10));
  }

  function handleGameKey(key: string) {
    if (!isGameLesson || isLocked || wordGame.status !== "running") {
      return;
    }

    playTypewriterClick(soundMuted);
    const result = applyWordGameKey(wordGame, key);
    setWordGame(result.state);

    if (result.completedWord) {
      speakWord(result.completedWord);
    }

    if (result.state.status === "won" && activeProfile) {
      const nextProfiles = profileState.profiles.map((profile) =>
        profile.id === activeProfile.id
          ? {
              ...profile,
              progress: completeLesson(profile.progress, selectedLesson, {
                accuracy: 100,
                wpm: 0,
                mistakeCount: 10 - result.state.health,
                completed: true,
                durationMs: 0
              })
            }
          : profile
      );
      persist({ ...profileState, profiles: nextProfiles });
    }
  }

  function beginKeyRainGame() {
    if (isLocked) {
      return;
    }
    setKeyRainGame(startKeyRainGame());
  }

  function handleKeyRainKey(key: string) {
    if (!isKeyRainLesson || isLocked || keyRainGame.status !== "running") {
      return;
    }

    playTypewriterClick(soundMuted);
    const result = applyKeyRainKey(keyRainGame, key);
    setKeyRainGame(result.state);
  }

  function addProfile() {
    persist(createProfile(profileState, `Kid ${profileState.profiles.length + 1}`));
  }

  function updateName(name: string) {
    if (activeProfile) {
      persist(renameProfile(profileState, activeProfile.id, name));
    }
  }

  function changeProfile(profileId: string) {
    persist(switchProfile(profileState, profileId));
    setSession(createSession(selectedLesson.target));
  }

  function removeActiveProfile() {
    if (!activeProfile || profileState.profiles.length <= 1) {
      return;
    }
    if (!window.confirm(`Delete ${activeProfile.name}? This only removes local progress.`)) {
      return;
    }
    const next = deleteProfile(profileState, activeProfile.id);
    persist(next);
    setSession(createSession(selectedLesson.target));
  }

  return (
    <main className="app-shell">
      <section className="sidebar" aria-label="Profiles and lessons">
        <div className="brand">
          <div className="brand-mark">
            <Keyboard size={24} />
          </div>
          <div>
            <p>Typing Garden</p>
            <h1>小小打字师</h1>
          </div>
        </div>

        <div className="profile-panel">
          <label htmlFor="profile-name">Typist</label>
          <input
            id="profile-name"
            value={activeProfile?.name ?? ""}
            onChange={(event) => updateName(event.target.value)}
          />
          <div className="profile-tabs">
            {profileState.profiles.map((profile) => (
              <button
                key={profile.id}
                className={profile.id === activeProfile?.id ? "active" : ""}
                onClick={() => changeProfile(profile.id)}
              >
                {profile.name}
              </button>
            ))}
            <button aria-label="Add profile" onClick={addProfile}>
              <UserPlus size={16} />
            </button>
            {profileState.profiles.length > 1 && (
              <button aria-label="Delete active profile" onClick={removeActiveProfile}>
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="lesson-list">
          <h2>Lessons</h2>
          <div className="lesson-stack" aria-label="Scrollable lesson list">
            {regularLessons.map((lesson) => (
              <LessonButton
                activeProfile={activeProfile}
                isSelected={lesson.id === selectedLesson.id}
                key={lesson.id}
                lesson={lesson}
                onChoose={chooseLesson}
                unlockedIds={unlockedIds}
              />
            ))}
          </div>
        </div>

        <div className="pinned-extras" aria-label="Pinned extras">
          {pinnedLessons.map((lesson) => (
            <LessonButton
              activeProfile={activeProfile}
              isSelected={lesson.id === selectedLesson.id}
              key={lesson.id}
              lesson={lesson}
              onChoose={chooseLesson}
              unlockedIds={unlockedIds}
              variant="pinned"
            />
          ))}
        </div>
      </section>

      <section className="practice-stage">
        <div className="topbar">
          <div>
            <p>Level {selectedLesson.level}</p>
            <h2>{selectedLesson.title}</h2>
          </div>
          <div className="top-actions">
            <button
              className="icon-button"
              aria-label={soundMuted ? "Turn on typewriter sound" : "Mute typewriter sound"}
              onClick={() => setSoundMuted((muted) => !muted)}
            >
              {soundMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button className="icon-button" aria-label="Restart lesson" onClick={resetLesson}>
              <RotateCcw size={20} />
            </button>
          </div>
        </div>

        <div className="mentor-strip">
          <div className="mentor" aria-hidden="true">
            <span className="mentor-face">^_^</span>
          </div>
          <div>
            <p>{isLocked ? "Finish the previous lesson to open this gate." : "Watch the glowing key and keep a steady rhythm."}</p>
            <strong>{summary.completed ? "Great finish. Try again for more stars." : "Ready, steady, type."}</strong>
          </div>
          <Sparkles size={28} />
        </div>

        {isKeyRainLesson ? (
          <>
            <KeyRainGame
              disabled={isLocked}
              game={keyRainGame}
              onStart={beginKeyRainGame}
            />
            <StatsAndMistakes data={getKeyRainStats(keyRainGame)} />
          </>
        ) : isGameLesson ? (
          <>
            <WordPlaneGame
              disabled={isLocked}
              game={wordGame}
              onStart={beginWordGame}
            />
            <StatsAndMistakes data={getWordGameStats(wordGame)} />
          </>
        ) : (
          <>
            <div className="target-card">
              <div className="target-text" aria-label="Typing target">
                {selectedLesson.target.split("").map((char, index) => {
                  const typed = session.typed[index];
                  const className =
                    index < session.cursor
                      ? typed === char
                        ? "done"
                        : "wrong"
                      : index === session.cursor
                        ? "current"
                        : "";
                  return (
                    <span className={className} key={`${char}-${index}`}>
                      {char === " " ? "\u00a0" : char}
                    </span>
                  );
                })}
              </div>
              <input
                aria-label="Typing input"
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                disabled={isLocked || summary.completed}
                onChange={(event) => handleInput(event.target.value)}
                spellCheck={false}
                value={session.typed}
              />
            </div>

            <KeyboardView
              lesson={selectedLesson}
              current={selectedLesson.target[session.cursor]}
              onKey={handleKey}
            />

            <StatsAndMistakes data={getLessonStats(summary, session, selectedLesson)} />
          </>
        )}
      </section>
    </main>
  );
}

function LessonButton({
  activeProfile,
  isSelected,
  lesson,
  onChoose,
  unlockedIds,
  variant = "shelf"
}: {
  activeProfile: ReturnType<typeof getActiveProfile>;
  isSelected: boolean;
  lesson: Lesson;
  onChoose: (lesson: Lesson) => void;
  unlockedIds: string[];
  variant?: "shelf" | "pinned";
}) {
  const locked = !unlockedIds.includes(lesson.id);
  const progress = activeProfile?.progress[lesson.id];
  const className = [
    "lesson",
    variant === "pinned" ? "pinned-lesson" : "",
    isSelected ? "active" : ""
  ].join(" ");
  const progressLabel = locked ? "Locked" : `${progress?.stars ?? 0} stars`;
  const isPinnedGame = lesson.kind === "game" || lesson.kind === "key-rain";
  const shouldShowProgress = locked || !isPinnedGame;

  return (
    <button className={className} onClick={() => onChoose(lesson)}>
      <span>
        {lesson.kind === "game" ? <Gamepad2 size={16} /> : <BookOpen size={16} />}
        {lesson.title}
      </span>
      {shouldShowProgress && <strong>{progressLabel}</strong>}
      {locked && <Lock size={14} />}
    </button>
  );
}

function KeyRainGame({
  disabled,
  game,
  onStart
}: {
  disabled: boolean;
  game: KeyRainState;
  onStart: () => void;
}) {
  const currentKey = game.current?.key ?? "";
  const dropProgress = game.current
    ? Math.min(1, game.current.elapsedMs / game.current.fallTimeMs)
    : 0;

  return (
    <div className="game-stage key-rain-stage" aria-label="键盘雨游戏">
      <div className="game-hud">
        <span>HP {game.health}/10</span>
        <span>{game.completed}/{game.goal}</span>
        <span>{game.status === "running" ? "Clear keys" : "Ready"}</span>
      </div>
      {game.status === "idle" && (
        <button className="start-game" disabled={disabled} onClick={onStart}>
          <Play size={20} />
          Start
        </button>
      )}
      {game.status === "running" && game.current && (
        <div
          className="rain-drop"
          data-lane={game.current.lane}
          style={{ "--drop-progress": dropProgress } as React.CSSProperties}
        >
          <span data-testid="rain-current-key">{currentKey}</span>
        </div>
      )}
      {game.destroyedKey && (
        <div className="rain-burst" aria-hidden="true">
          {game.destroyedKey}
        </div>
      )}
      {game.status === "lost" && (
        <div className="game-result">
          <h3>Game Over</h3>
          <button onClick={onStart}>Restart</button>
        </div>
      )}
      {game.status === "won" && (
        <div className="game-result">
          <div className="celebration" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <h3>Mission Clear</h3>
          <p>Every keyboard key cleared once.</p>
          <button onClick={onStart}>Play Again</button>
        </div>
      )}
    </div>
  );
}

function WordPlaneGame({
  disabled,
  game,
  onStart
}: {
  disabled: boolean;
  game: WordGameState;
  onStart: () => void;
}) {
  const currentWord = game.current?.word ?? "";

  return (
    <div className="game-stage" aria-label="Word plane game">
      <div className="game-hud">
        <span>HP {game.health}/10</span>
        <span>{game.completed}/{game.goal}</span>
        <span>{formatTime(game.timeLeftMs)}</span>
      </div>
      {game.status === "idle" && (
        <button className="start-game" disabled={disabled} onClick={onStart}>
          <Play size={20} />
          Start
        </button>
      )}
      {game.status === "running" && game.current && (
        <div className="falling-word">
          <div className="plane">AIR</div>
          <div className="word-target">
            {currentWord.split("").map((char, index) => (
              <span
                className={index < game.typed.length ? "done" : ""}
                key={`${char}-${index}`}
              >
                {char}
              </span>
            ))}
          </div>
          <span className="sr-only" data-testid="game-current-word">
            {currentWord}
          </span>
          <p>{game.current.meaning}</p>
        </div>
      )}
      {game.status === "lost" && (
        <div className="game-result">
          <h3>Game Over</h3>
          <button onClick={onStart}>Restart</button>
        </div>
      )}
      {game.status === "won" && (
        <div className="game-result">
          <div className="celebration" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <h3>Mission Clear</h3>
          <p>{game.goal} words finished with health left.</p>
          <button onClick={onStart}>Play Again</button>
        </div>
      )}
    </div>
  );
}

function StatsAndMistakes({ data }: { data: StatsPanelData }) {
  return (
    <>
      <div className="stats-grid">
        <Stat icon={<BarChart3 size={18} />} label="WPM" value={data.wpm} />
        <Stat icon={<Award size={18} />} label="Accuracy" value={data.accuracy} />
        <Stat label="Mistakes" value={data.mistakes} />
        <Stat label="Progress" value={data.progress} />
      </div>

      <div className="mistake-panel">
        <h3>Missed keys</h3>
        {data.missedKeys.length === 0 ? (
          <p>No misses yet.</p>
        ) : (
          <ul>
            {data.missedKeys.map((mistake, index) => (
              <li key={`${mistake}-${index}`}>{mistake}</li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function KeyboardView({
  lesson,
  current,
  onKey
}: {
  lesson: Lesson;
  current: string | undefined;
  onKey: (key: string) => void;
}) {
  const keyboardRows = getKeyboardRows(lesson);
  const activeShiftSide = getActiveShiftSide(current);

  return (
    <div className="keyboard-board" aria-label="Keyboard guide">
      {keyboardRows.map((row) => (
        <div className="keyboard-row" key={row.join("")}>
          {row.map((key) => {
            const shiftSide = getShiftSide(key);
            const label = getKeyLabel(key);
            const value = getKeyValue(key);
            const focused = lesson.focusKeys.includes(value);
            const active = shiftSide ? activeShiftSide === shiftSide : value === current;
            return (
              <button
                aria-label={shiftSide ? `Key ${shiftSide} Shift` : `Key ${label}`}
                className={[
                  "keycap",
                  shiftSide ? `shift ${shiftSide}-shift` : "",
                  focused ? "focus" : "",
                  active ? "next" : ""
                ].join(" ")}
                data-key={value}
                key={key}
                onClick={() => {
                  if (!shiftSide) {
                    onKey(value);
                  }
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      ))}
      <div className="keyboard-row">
        <button
          aria-label="Key space"
          className={current === " " ? "keycap space next" : "keycap space"}
          data-key=" "
          onClick={() => onKey(" ")}
        >
          space
        </button>
      </div>
      <FingerGuide current={current} />
    </div>
  );
}

function getKeyboardRows(lesson: Lesson): KeyboardKey[][] {
  if (lesson.kind === "shift") {
    return withShiftKeys(shiftedLetterRows);
  }

  if (lesson.kind === "numbers") {
    return [numberKeyboardRow, ...baseKeyboardRows];
  }

  if (lesson.kind === "symbols") {
    return [symbolKeyboardRow, numberKeyboardRow, ...withShiftKeys(baseKeyboardRows)];
  }

  return baseKeyboardRows;
}

function withShiftKeys(rows: string[][]): KeyboardKey[][] {
  return rows.map((row, index) =>
    index === rows.length - 1 ? ["left-shift", ...row, "right-shift"] : row
  );
}

function getShiftSide(key: KeyboardKey) {
  if (key === "left-shift") {
    return "left";
  }
  if (key === "right-shift") {
    return "right";
  }
  return undefined;
}

function getKeyLabel(key: KeyboardKey) {
  const shiftSide = getShiftSide(key);
  return shiftSide ? "Shift" : key;
}

function getKeyValue(key: KeyboardKey) {
  return getShiftSide(key) ? "Shift" : key;
}

function getActiveShiftSide(key: string | undefined): "left" | "right" | undefined {
  if (!needsShiftKey(key)) {
    return undefined;
  }

  const finger = getFingerForKey(key);
  if (finger?.hand === "left") {
    return "right";
  }
  if (finger?.hand === "right") {
    return "left";
  }
  return undefined;
}

function needsShiftKey(key: string | undefined) {
  return Boolean(key && key !== key.toLowerCase()) || Boolean(key && symbolKeyboardRow.includes(key));
}

function FingerGuide({ current }: { current: string | undefined }) {
  const activeFinger = getFingerForKey(current);
  const leftFingers = fingerGuide.filter((finger) => finger.hand === "left");
  const rightFingers = fingerGuide.filter((finger) => finger.hand === "right");
  const thumb = fingerGuide.find((finger) => finger.id === "thumbs");

  return (
    <div className="finger-guide" aria-label="Finger guide">
      <div className="finger-hands">
        <Hand fingers={leftFingers} activeFinger={activeFinger} />
        {thumb && (
          <div
            className={activeFinger?.id === thumb.id ? "finger thumb active" : "finger thumb"}
            aria-label={thumb.label}
          >
            拇指
          </div>
        )}
        <Hand fingers={rightFingers} activeFinger={activeFinger} />
      </div>
      <strong>{activeFinger ? `当前手指：${activeFinger.label}` : "当前手指：看高亮键"}</strong>
    </div>
  );
}

function Hand({
  fingers,
  activeFinger
}: {
  fingers: FingerInfo[];
  activeFinger: FingerInfo | undefined;
}) {
  return (
    <div className="hand">
      {fingers.map((finger) => (
        <div
          className={activeFinger?.id === finger.id ? "finger active" : "finger"}
          aria-label={finger.label}
          key={finger.id}
        >
          {finger.label.replace("左手", "").replace("右手", "")}
        </div>
      ))}
    </div>
  );
}

function Stat({
  icon,
  label,
  value
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="stat">
      <span>{icon}</span>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function getLessonStats(
  summary: AttemptSummary,
  session: TypingSession,
  lesson: Lesson
): StatsPanelData {
  return {
    wpm: summary.wpm.toString(),
    accuracy: `${summary.accuracy}%`,
    mistakes: summary.mistakeCount.toString(),
    progress: `${session.cursor}/${lesson.target.length}`,
    missedKeys: session.mistakes.map((mistake) =>
      `${formatDisplayKey(mistake.expected)} -> ${formatDisplayKey(mistake.actual)}`
    )
  };
}

function getKeyRainStats(game: KeyRainState): StatsPanelData {
  return {
    wpm: "0",
    accuracy: `${getAccuracy(game.completed, game.completed + game.mistakeCount)}%`,
    mistakes: game.mistakeCount.toString(),
    progress: `${game.completed}/${game.goal}`,
    missedKeys: game.mistakes.map(formatMistakeText)
  };
}

function getWordGameStats(game: WordGameState): StatsPanelData {
  return {
    wpm: getWordGameWpm(game).toString(),
    accuracy: `${getAccuracy(game.typedCount - game.mistakeCount, game.typedCount)}%`,
    mistakes: game.mistakeCount.toString(),
    progress: `${game.completed}/${game.goal}`,
    missedKeys: game.mistakes.map(formatMistakeText)
  };
}

function getAccuracy(correctCount: number, typedCount: number) {
  return typedCount === 0 ? 100 : Math.max(0, Math.round((correctCount / typedCount) * 100));
}

function getWordGameWpm(game: WordGameState) {
  const elapsedMs = Math.max(0, game.totalTimeMs - game.timeLeftMs);
  if (elapsedMs === 0) {
    return 0;
  }

  const correctCount = Math.max(0, game.typedCount - game.mistakeCount);
  const minutes = elapsedMs / 60_000;
  return Math.round((correctCount / 5 / minutes) * 10) / 10;
}

function formatMistakeText(mistake: string) {
  if (mistake.endsWith(" missed")) {
    return `${formatDisplayKey(mistake.slice(0, -" missed".length))} missed`;
  }

  const [expected, actual] = mistake.split(" -> ");
  if (expected && actual) {
    return `${formatDisplayKey(expected)} -> ${formatDisplayKey(actual)}`;
  }

  return mistake;
}

function formatDisplayKey(key: string) {
  return key === " " ? "space" : key;
}

function loadProfiles(): ProfileState {
  const saved = getStorage()?.getItem("typing-kids-profiles");
  if (!saved) {
    return initialState;
  }
  try {
    return JSON.parse(saved) as ProfileState;
  } catch {
    return initialState;
  }
}

function saveProfiles(state: ProfileState) {
  getStorage()?.setItem("typing-kids-profiles", JSON.stringify(state));
}

function getStorage(): Storage | undefined {
  if (
    typeof window === "undefined" ||
    !window.localStorage ||
    typeof window.localStorage.getItem !== "function"
  ) {
    return undefined;
  }
  return window.localStorage;
}

function speakWord(entry: WordEntry) {
  if (!window.speechSynthesis) {
    return;
  }
  const utterance = new SpeechSynthesisUtterance(entry.word);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function formatTime(timeLeftMs: number) {
  const totalSeconds = Math.ceil(timeLeftMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
