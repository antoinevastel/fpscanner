import { ERROR, INIT, NA, setObjectValues } from "./utils";
import { MediaCapabilitiesSignal } from "../types";

const VIDEO_CONFIGURATIONS = [
    { contentType: 'video/mp4; codecs="avc1.42E01E"', width: 1920, height: 1080, bitrate: 2000000, framerate: 30 },
    { contentType: 'video/mp4; codecs="hvc1.1.6.L93.B0"', width: 1920, height: 1080, bitrate: 2000000, framerate: 30 },
    { contentType: 'video/webm; codecs="vp09.00.10.08"', width: 1920, height: 1080, bitrate: 2000000, framerate: 30 },
    { contentType: 'video/mp4; codecs="av01.0.05M.08"', width: 1920, height: 1080, bitrate: 2000000, framerate: 30 },
];

const AUDIO_CONFIGURATIONS = [
    { contentType: 'audio/mp4; codecs="mp4a.40.2"', channels: "2", bitrate: 128000, samplerate: 44100 },
    { contentType: 'audio/webm; codecs="opus"', channels: "2", bitrate: 128000, samplerate: 48000 },
];

async function getDecodingSupport(configuration: object, kind: "video" | "audio") {
    try {
        const info = await (navigator as any).mediaCapabilities.decodingInfo({
            type: "file",
            [kind]: configuration,
        });
        return (info.supported ? 1 : 0) + (info.smooth ? 2 : 0) + (info.powerEfficient ? 4 : 0);
    } catch (e) {
        return 0;
    }
}

/**
 * `canPlayType` answers what the browser build can decode, `decodingInfo` what this machine can
 * decode in hardware at a given resolution, which follows the GPU. Software-rendered and
 * virtualised environments come back supported but never power efficient. One digit per
 * configuration: 1 supported, 2 smooth, 4 power efficient.
 */
export async function mediaCapabilities(): Promise<MediaCapabilitiesSignal> {
    const mediaCapabilitiesData: MediaCapabilitiesSignal = {
        videoDecodingInfo: INIT,
        audioDecodingInfo: INIT,
        hasPowerEfficientVideoDecoding: INIT,
    };

    if (!("mediaCapabilities" in navigator)) {
        setObjectValues(mediaCapabilitiesData, NA);
        return mediaCapabilitiesData;
    }

    try {
        const video = await Promise.all(
            VIDEO_CONFIGURATIONS.map((configuration) => getDecodingSupport(configuration, "video")),
        );
        const audio = await Promise.all(
            AUDIO_CONFIGURATIONS.map((configuration) => getDecodingSupport(configuration, "audio")),
        );

        mediaCapabilitiesData.videoDecodingInfo = video.join("");
        mediaCapabilitiesData.audioDecodingInfo = audio.join("");
        mediaCapabilitiesData.hasPowerEfficientVideoDecoding = video.some((code) => code >= 4);
    } catch (e) {
        setObjectValues(mediaCapabilitiesData, ERROR);
    }

    return mediaCapabilitiesData;
}
