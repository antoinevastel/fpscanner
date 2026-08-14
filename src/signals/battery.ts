import { ERROR, INIT, NA, setObjectValues } from "./utils";
import { BatterySignal } from "../types";

const NOT_FINITE = -1;

function finite(value: unknown): number {
    return typeof value === "number" && Number.isFinite(value) ? value : NOT_FINITE;
}

/**
 * Level and charge times move during a session, so this is kept out of the fsid. It is the
 * combination that is worth having: a user agent claiming a phone next to a permanently full,
 * permanently charging battery describes a desktop VM.
 */
export async function battery(): Promise<BatterySignal> {
    const batteryData: BatterySignal = {
        charging: INIT,
        level: INIT,
        chargingTime: INIT,
        dischargingTime: INIT,
    };

    if (typeof (navigator as any).getBattery !== "function") {
        setObjectValues(batteryData, NA);
        return batteryData;
    }

    try {
        const manager = await (navigator as any).getBattery();
        batteryData.charging = manager.charging === true;
        batteryData.level = finite(manager.level);
        batteryData.chargingTime = finite(manager.chargingTime);
        batteryData.dischargingTime = finite(manager.dischargingTime);
    } catch (e) {
        setObjectValues(batteryData, ERROR);
    }

    return batteryData;
}
