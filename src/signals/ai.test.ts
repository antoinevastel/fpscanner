import { afterEach, describe, expect, test, vi } from "vitest";
import { ai } from "./ai";
import { ERROR, NA } from "./utils";

const TIMEOUT_MS = 2_500;

function setBrowserGlobals(availability?: (...args: any[]) => Promise<any>, opera = false) {
    const browserWindow: Record<string, unknown> = {};
    if (availability) {
        browserWindow.Summarizer = { availability };
    }
    if (opera) {
        browserWindow.opr = {};
    }
    vi.stubGlobal("window", browserWindow);
    vi.stubGlobal("navigator", { language: "en-US" });
}

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
});

describe("ai", () => {
    test("returns NA when Summarizer is absent", async () => {
        setBrowserGlobals();

        await expect(ai()).resolves.toEqual({
            summarizerAvailability: NA,
            summarizerLanguageAvailability: NA,
        });
    });

    test("preserves normally resolved values", async () => {
        const availability = vi.fn()
            .mockResolvedValueOnce("readily")
            .mockResolvedValueOnce("after-download");
        setBrowserGlobals(availability);

        await expect(ai()).resolves.toEqual({
            summarizerAvailability: "readily",
            summarizerLanguageAvailability: "after-download",
        });
        expect(availability).toHaveBeenNthCalledWith(1);
        expect(availability).toHaveBeenNthCalledWith(2, {
            expectedInputLanguages: ["en-US"],
        });
    });

    test("preserves normal rejection handling", async () => {
        const availability = vi.fn()
            .mockRejectedValueOnce(new Error("unavailable"))
            .mockResolvedValueOnce("readily");
        setBrowserGlobals(availability);

        await expect(ai()).resolves.toEqual({
            summarizerAvailability: ERROR,
            summarizerLanguageAvailability: ERROR,
        });
    });

    test("times out when the first availability call never settles", async () => {
        vi.useFakeTimers();
        const availability = vi.fn()
            .mockReturnValueOnce(new Promise(() => {}))
            .mockResolvedValueOnce("readily");
        setBrowserGlobals(availability);

        const result = ai();
        await vi.advanceTimersByTimeAsync(TIMEOUT_MS);

        await expect(result).resolves.toEqual({
            summarizerAvailability: ERROR,
            summarizerLanguageAvailability: "readily",
        });
    });

    test("times out when the language availability call never settles", async () => {
        vi.useFakeTimers();
        const availability = vi.fn()
            .mockResolvedValueOnce("readily")
            .mockReturnValueOnce(new Promise(() => {}));
        setBrowserGlobals(availability);

        const result = ai();
        await vi.advanceTimersByTimeAsync(TIMEOUT_MS);

        await expect(result).resolves.toEqual({
            summarizerAvailability: "readily",
            summarizerLanguageAvailability: ERROR,
        });
    });

    test("always completes within the timeout when both calls remain pending", async () => {
        vi.useFakeTimers();
        const availability = vi.fn(() => new Promise(() => {}));
        setBrowserGlobals(availability);
        let settled = false;

        const result = ai().finally(() => {
            settled = true;
        });
        await vi.advanceTimersByTimeAsync(TIMEOUT_MS - 1);
        expect(settled).toBe(false);
        await vi.advanceTimersByTimeAsync(1);

        await expect(result).resolves.toEqual({
            summarizerAvailability: ERROR,
            summarizerLanguageAvailability: ERROR,
        });
        expect(settled).toBe(true);
    });

    test("keeps the Opera exclusion", async () => {
        const availability = vi.fn().mockResolvedValue("readily");
        setBrowserGlobals(availability, true);

        await expect(ai()).resolves.toEqual({
            summarizerAvailability: NA,
            summarizerLanguageAvailability: NA,
        });
        expect(availability).not.toHaveBeenCalled();
    });
});
