import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { lessons } from "../data/lessons";

describe("App", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: vi.fn((key: string) => store.get(key) ?? null),
        setItem: vi.fn((key: string, value: string) => store.set(key, value)),
        removeItem: vi.fn((key: string) => store.delete(key)),
        clear: vi.fn(() => store.clear())
      }
    });
  });

  it("starts with a default child profile and a locked lesson path", () => {
    render(<App />);

    expect(screen.getByText("小小打字师")).toBeInTheDocument();
    expect(screen.getAllByText("Easy 1 / 食指 fj").length).toBeGreaterThan(0);
    expect(screen.getByText("Easy 2 / 中指 dk")).toBeInTheDocument();
    expect(screen.getAllByText("Locked").length).toBeGreaterThan(0);
  });

  it("does not show third-party promotional links", () => {
    render(<App />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText("固定推荐")).not.toBeInTheDocument();
  });

  it("keeps game lessons pinned below a vertical lesson list", () => {
    render(<App />);

    const list = screen.getByLabelText("Scrollable lesson list");
    const pinned = screen.getByLabelText("Pinned extras");

    expect(list).toHaveClass("lesson-stack");
    expect(pinned).toContainElement(screen.getByRole("button", { name: /Final \/ 单词空战/ }));
    expect(list).not.toContainElement(screen.getByRole("button", { name: /Final \/ 单词空战/ }));
  });

  it("records mistakes while the child practices", async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText("Typing input");
    await user.click(input);
    await user.keyboard("fx");

    expect(screen.getByText("Missed keys")).toBeInTheDocument();
    expect(screen.getByText("space -> x")).toBeInTheDocument();
  });

  it("accepts physical keyboard input without focusing the text box", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.keyboard("f ");

    expect(screen.getByText("2/15")).toBeInTheDocument();
  });

  it("lets children practice by clicking the on-screen keyboard", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByLabelText("Key f"));
    await user.click(screen.getByLabelText("Key space"));

    expect(screen.getByText("2/15")).toBeInTheDocument();
  });

  it("shows which finger should press the next key", () => {
    render(<App />);

    expect(screen.getByLabelText("Finger guide")).toBeInTheDocument();
    expect(screen.getByText("当前手指：左手食指")).toBeInTheDocument();
  });

  it("restarts the current lesson when Enter is pressed", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.keyboard("f ");
    expect(screen.getByText("2/15")).toBeInTheDocument();

    await user.keyboard("{Enter}");

    expect(screen.getByText("0/15")).toBeInTheDocument();
    expect(screen.getByLabelText("Typing input")).toHaveValue("");
  });

  it("offers a sound toggle for typing clicks", async () => {
    const user = userEvent.setup();
    render(<App />);

    const button = screen.getByRole("button", { name: "Mute typewriter sound" });
    await user.click(button);

    expect(screen.getByRole("button", { name: "Turn on typewriter sound" })).toBeInTheDocument();
  });

  it("asks for confirmation before deleting a child profile", async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Add profile" }));
    await user.click(screen.getByText("Kid 2"));
    await user.click(screen.getByRole("button", { name: "Delete active profile" }));

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Kid 2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete active profile" }));

    expect(confirm).toHaveBeenCalledTimes(2);
    expect(screen.queryByText("Kid 2")).not.toBeInTheDocument();
    expect(screen.getByText("Kid")).toBeInTheDocument();

    confirm.mockRestore();
  });

  it("shows the final word plane game unlocked by default", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText("Final / 单词空战"));

    expect(screen.getByRole("button", { name: "Start" })).toBeEnabled();
    expect(screen.getByText("Watch the glowing key and keep a steady rhythm.")).toBeInTheDocument();
  });

  it("shows game stats without keyboard and finger guides", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByLabelText("Keyboard guide")).toBeInTheDocument();
    expect(screen.getByLabelText("Finger guide")).toBeInTheDocument();
    expect(screen.getByText("Missed keys")).toBeInTheDocument();

    await user.click(screen.getByText("Game / 键盘雨"));

    expect(screen.queryByLabelText("Keyboard guide")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Finger guide")).not.toBeInTheDocument();
    expect(screen.getByText("Missed keys")).toBeInTheDocument();
    expect(screen.getAllByText("0/39").length).toBeGreaterThan(0);

    await user.click(screen.getByText("Final / 单词空战"));

    expect(screen.queryByLabelText("Keyboard guide")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Finger guide")).not.toBeInTheDocument();
    expect(screen.getByText("Missed keys")).toBeInTheDocument();
    expect(screen.getAllByText("0/100").length).toBeGreaterThan(0);
  });

  it("uses the shared game stage container for both games", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText("Game / 键盘雨"));
    expect(screen.getByLabelText("键盘雨游戏")).toHaveClass("game-stage");

    await user.click(screen.getByText("Final / 单词空战"));
    expect(screen.getByLabelText("Word plane game")).toHaveClass("game-stage");
  });

  it("does not show star progress on the final word plane game", () => {
    render(<App />);

    const pinned = screen.getByLabelText("Pinned extras");
    const finalGame = screen.getByRole("button", { name: /Final \/ 单词空战/ });

    expect(pinned).toContainElement(finalGame);
    expect(finalGame).not.toHaveTextContent(/stars/);
  });

  it("does not show star progress on the key rain game", () => {
    render(<App />);

    const keyRain = screen.getByRole("button", { name: /Game \/ 键盘雨/ });

    expect(keyRain).not.toHaveTextContent(/stars/);
  });

  it("shows the key rain game pinned above the final word plane game", async () => {
    const user = userEvent.setup();
    render(<App />);

    const pinned = screen.getByLabelText("Pinned extras");
    const keyRain = screen.getByRole("button", { name: /Game \/ 键盘雨/ });
    const wordPlane = screen.getByRole("button", { name: /Final \/ 单词空战/ });

    expect(pinned).toContainElement(keyRain);
    expect(pinned).toContainElement(wordPlane);
    expect(keyRain.compareDocumentPosition(wordPlane) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    await user.click(keyRain);
    await user.click(screen.getByRole("button", { name: "Start" }));

    expect(screen.getByText("HP 10/10")).toBeInTheDocument();
    expect(screen.getAllByText("0/39").length).toBeGreaterThan(0);
    expect(screen.getByTestId("rain-current-key")).toBeInTheDocument();
    expect(screen.queryByText("Key Rain")).not.toBeInTheDocument();
    expect(screen.queryByText("Start key rain")).not.toBeInTheDocument();
  });

  it("shows number, shift, and symbol keys for advanced lessons", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText("Challenge 1 / Shift 大写"));
    expect(screen.getByLabelText("Key left Shift")).toBeInTheDocument();
    expect(screen.getByLabelText("Key right Shift")).toBeInTheDocument();
    expect(screen.getByLabelText("Key A")).toBeInTheDocument();

    await user.click(screen.getByText("Challenge 2 / 数字键"));
    expect(screen.getByLabelText("Key 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Key 0")).toBeInTheDocument();

    await user.click(screen.getByText("Challenge 3 / 常用符号"));
    expect(screen.getByLabelText("Key !")).toBeInTheDocument();
    expect(screen.getByLabelText("Key ?")).toBeInTheDocument();
  });

  it("highlights the opposite shift key for uppercase letters", async () => {
    const user = userEvent.setup();
    const shiftLessonIndex = lessons.findIndex((lesson) => lesson.id === "shift-uppercase");
    const progress = Object.fromEntries(
      lessons.slice(0, shiftLessonIndex).map((lesson) => [
        lesson.id,
        {
          lessonId: lesson.id,
          bestAccuracy: 100,
          bestWpm: 20,
          attempts: 1,
          stars: 3,
          completedAt: "2026-05-31T00:00:00.000Z",
          mistakes: []
        }
      ])
    );
    window.localStorage.setItem(
      "typing-kids-profiles",
      JSON.stringify({
        profiles: [
          {
            id: "kid-1",
            name: "Kid",
            avatar: "bear",
            createdAt: "2026-05-31T00:00:00.000Z",
            progress
          }
        ],
        activeProfileId: "kid-1"
      })
    );

    render(<App />);

    await user.click(screen.getByText("Challenge 1 / Shift 大写"));
    expect(screen.getByLabelText("Key right Shift")).toHaveClass("next");
    expect(screen.getByLabelText("Key left Shift")).not.toHaveClass("next");

    for (const key of ["A", "space", "S", "space", "D", "space", "F", "space"]) {
      await user.click(screen.getByLabelText(`Key ${key}`));
    }

    expect(screen.getByLabelText("Key left Shift")).toHaveClass("next");
    expect(screen.getByLabelText("Key right Shift")).not.toHaveClass("next");
  });

  it("runs the final word plane game when it is unlocked", async () => {
    const user = userEvent.setup();
    const progress = Object.fromEntries(
      lessons.slice(0, -1).map((lesson) => [
        lesson.id,
        {
          lessonId: lesson.id,
          bestAccuracy: 100,
          bestWpm: 20,
          attempts: 1,
          stars: 3,
          completedAt: "2026-05-31T00:00:00.000Z",
          mistakes: []
        }
      ])
    );
    window.localStorage.setItem(
      "typing-kids-profiles",
      JSON.stringify({
        profiles: [
          {
            id: "kid-1",
            name: "Kid",
            avatar: "bear",
            createdAt: "2026-05-31T00:00:00.000Z",
            progress
          }
        ],
        activeProfileId: "kid-1"
      })
    );

    render(<App />);
    await user.click(screen.getByText("Final / 单词空战"));
    await user.click(screen.getByRole("button", { name: "Start" }));

    expect(screen.getByText("HP 10/10")).toBeInTheDocument();
    expect(screen.getAllByText("0/100").length).toBeGreaterThan(0);
    expect(screen.getByText("20:00")).toBeInTheDocument();

    await user.keyboard("#");
    expect(screen.getByText("HP 9/10")).toBeInTheDocument();
  });

  it("recovers one health after ten words in the final game", async () => {
    const user = userEvent.setup();
    const progress = Object.fromEntries(
      lessons.slice(0, -1).map((lesson) => [
        lesson.id,
        {
          lessonId: lesson.id,
          bestAccuracy: 100,
          bestWpm: 20,
          attempts: 1,
          stars: 3,
          completedAt: "2026-05-31T00:00:00.000Z",
          mistakes: []
        }
      ])
    );
    window.localStorage.setItem(
      "typing-kids-profiles",
      JSON.stringify({
        profiles: [
          {
            id: "kid-1",
            name: "Kid",
            avatar: "bear",
            createdAt: "2026-05-31T00:00:00.000Z",
            progress
          }
        ],
        activeProfileId: "kid-1"
      })
    );

    render(<App />);
    await user.click(screen.getByText("Final / 单词空战"));
    await user.click(screen.getByRole("button", { name: "Start" }));
    await user.keyboard("#");

    for (let index = 0; index < 10; index += 1) {
      const word = screen.getByTestId("game-current-word").textContent ?? "";
      await user.keyboard(word);
    }

    expect(screen.getByText("HP 10/10")).toBeInTheDocument();
    expect(screen.getByText("HP 10/10")).toBeInTheDocument();
    expect(screen.getAllByText("10/100").length).toBeGreaterThan(0);
  });
});
