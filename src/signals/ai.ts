import { INIT, ERROR, setObjectValues, NA } from "./utils";

// We can add more feature checks in the future like https://developer.mozilla.org/en-US/docs/Web/API/Translator_and_Language_Detector_APIs
// However, they currently display a message in the console, so we will not use them for now.

function isOpera(): boolean {
    return typeof (window as any).opr !== 'undefined';
}

export async function ai() {
    const aiResults = {
        summarizerAvailability: INIT,
        summarizerLanguageAvailability: INIT,
    };

    // Opera exposes Summarizer but availability() never settles, hanging the entire collection.
    if ('Summarizer' in window && !isOpera()) {
        try {
            aiResults.summarizerAvailability = await (window as any).Summarizer.availability();
            aiResults.summarizerLanguageAvailability = await (window as any).Summarizer.availability({
                expectedInputLanguages: [navigator.language],
            });
        } catch (error) {
            setObjectValues(aiResults, ERROR);
        }
    } else {
        setObjectValues(aiResults, NA);
    }

    return aiResults;
}
