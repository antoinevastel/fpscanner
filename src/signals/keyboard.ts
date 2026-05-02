import { INIT, ERROR, setObjectValues, NA } from "./utils";

export async function keyboard() {
    const keyboardData = {
        layout: INIT,
        layoutSize: INIT,
    };

    if ('keyboard' in navigator && typeof (navigator as any).keyboard.getLayoutMap !== 'undefined') {
        try {
            const layoutMap = await (navigator as any).keyboard.getLayoutMap();
            keyboardData.layout = Array.from(
                layoutMap.entries() as Iterable<[string, string]>
            )
            .map(([k, v]) => `${k},${v}`)
            .join(" ");

            keyboardData.layoutSize = layoutMap.size;
        } catch (error) {
            setObjectValues(keyboardData, ERROR);
        }
    }
    else {
        setObjectValues(keyboardData, NA);
    }

    return keyboardData;
}