export const ERROR = 'ERROR';
export const INIT = 'INIT';
export const NA = 'NA';
export const SKIPPED = 'SKIPPED';
export const HIGH = 'high'
export const LOW = 'low'
export const MEDIUM = 'medium'


/**
 * Signal collection replaces anything it could not read with a sentinel, so a string signal
 * only carries data when it is neither empty nor one of those sentinels.
 */
export function usableString(value: unknown): string | undefined {
    if (typeof value !== 'string' || value.length === 0) {
        return undefined;
    }
    if (value === NA || value === ERROR || value === SKIPPED || value === INIT) {
        return undefined;
    }
    return value;
}

export function usableStrings(...values: unknown[]): string[] {
    return values
        .map(usableString)
        .filter((value): value is string => value !== undefined);
}

export function hashCode(str: string) {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }
    return hash.toString(16).padStart(8, "0");
}

export function setObjectValues(object: any, value: any) {
    for (const key in object) {
        object[key] = value;
    }
}


export function isFirefox() {
    return (navigator as any).buildID === "20181001000000";
}
