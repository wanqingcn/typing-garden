import { describe, expect, it, vi } from "vitest";
import { playTypewriterClick } from "./sound";

describe("typewriter sound", () => {
  it("does not create audio when muted", () => {
    const AudioContextMock = vi.fn();
    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      value: AudioContextMock
    });

    playTypewriterClick(true);

    expect(AudioContextMock).not.toHaveBeenCalled();
  });

  it("plays a short click when audio is available", () => {
    const oscillator = {
      connect: vi.fn(),
      frequency: { setValueAtTime: vi.fn() },
      start: vi.fn(),
      stop: vi.fn()
    };
    const gain = {
      connect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn()
      }
    };
    const context = {
      createOscillator: vi.fn(() => oscillator),
      createGain: vi.fn(() => gain),
      currentTime: 1,
      destination: {}
    };

    function AudioContextMock() {
      return context;
    }

    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      value: vi.fn(AudioContextMock)
    });

    playTypewriterClick(false);

    expect(context.createOscillator).toHaveBeenCalled();
    expect(context.createGain).toHaveBeenCalled();
    expect(oscillator.start).toHaveBeenCalledWith(1);
    expect(oscillator.stop).toHaveBeenCalledWith(1.035);
  });
});
