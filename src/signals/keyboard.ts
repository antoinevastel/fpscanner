import { INIT, ERROR, setObjectValues, NA } from "./utils";

export async function keyboard() {
    const keyboardData = {
        keyboardLayout: INIT,
        keyboardLayoutSize: INIT,
    };

    if ('keyboard' in navigator && typeof (navigator as any).keyboard.getLayoutMap !== 'undefined') {
        try {
            const layoutMap = await (navigator as any).keyboard.getLayoutMap();
            keyboardData.keyboardLayout = Array.from(
                layoutMap.entries() as Iterable<[string, string]>
            )
            .map(([k, v]) => `${k},${v}`)
            .join(" ");

            keyboardData.keyboardLayoutSize = layoutMap.size;
        } catch (error) {
            setObjectValues(keyboardData, ERROR);
        }
    }
    else {
        setObjectValues(keyboardData, NA);
    }

    return keyboardData;
}