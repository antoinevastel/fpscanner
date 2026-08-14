import { ERROR, INIT, NA, setObjectValues } from "./utils";
import { AudioSignal } from "../types";

/**
 * Latency and channel count follow the audio device the browser opened rather than anything the
 * page controls. Nothing is rendered through the context, and it is closed straight away.
 */
export async function audio(): Promise<AudioSignal> {
    const audioData: AudioSignal = {
        baseLatency: INIT,
        sampleRate: INIT,
        maxChannelCount: INIT,
    };

    const AudioContextConstructor =
        (window as any).AudioContext || (window as any).webkitAudioContext;

    if (!AudioContextConstructor) {
        setObjectValues(audioData, NA);
        return audioData;
    }

    let context: any;
    try {
        context = new AudioContextConstructor();
        const baseLatency = context.baseLatency;
        audioData.baseLatency =
            typeof baseLatency === "number" && isFinite(baseLatency) ? baseLatency : NA;
        audioData.sampleRate = context.sampleRate;
        audioData.maxChannelCount = context.destination.maxChannelCount;
    } catch (e) {
        setObjectValues(audioData, ERROR);
    } finally {
        try {
            await context?.close();
        } catch {}
    }

    return audioData;
}
