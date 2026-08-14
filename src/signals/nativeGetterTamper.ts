import { NA } from "./utils";
import { SignalValue } from "../types";

/**
 * A native accessor stringifies without touching the globals. A getter installed from
 * JavaScript usually hides behind a hooked `Function.prototype.toString`, which reaches for
 * `Function` or `Object` by name while it runs, so dropping both for the length of one call
 * separates the two. Synchronous on purpose: the globals are gone until this returns.
 */
export function nativeGetterTamper(): SignalValue<boolean> {
    const descriptor = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(navigator),
        "hardwareConcurrency",
    );

    if (!descriptor || !descriptor.get) {
        return NA;
    }

    // Assignment would restore both globals as enumerable, and `Object` is unreachable by name
    // while the probe runs, so defineProperty is held locally.
    const defineProperty = Object.defineProperty;
    const functionDescriptor = Object.getOwnPropertyDescriptor(window, "Function");
    const objectDescriptor = Object.getOwnPropertyDescriptor(window, "Object");

    if (!functionDescriptor || !objectDescriptor) {
        return NA;
    }

    const restore = () => {
        try {
            defineProperty(window, "Function", functionDescriptor);
            defineProperty(window, "Object", objectDescriptor);
        } catch {}
    };

    let removed = false;
    try {
        removed = delete (window as any).Function && delete (window as any).Object;
    } catch {
        removed = false;
    }

    if (!removed) {
        restore();
        return NA;
    }

    try {
        descriptor.get.toString();
        return false;
    } catch {
        return true;
    } finally {
        restore();
    }
}
