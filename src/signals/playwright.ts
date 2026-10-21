export function playwright() {
    return '__pwInitScripts' in window
        || '__playwright__binding__' in window
        // Set by page.clock (install, setFixedTime, ...), which needs no exposed binding
        || '__pwClock' in window;
}