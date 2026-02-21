"""
Detection test: Camoufox (https://github.com/daijro/camoufox)

Camoufox is a patched Firefox build that intercepts fingerprint calls at the
C++ level, making spoofing undetectable through JavaScript inspection. It uses
Playwright's sync API under the hood.

Prerequisites:
    pip install -r requirements.txt
    python -m camoufox fetch          # one-time download of the patched browser
    # Start the Vite dev server in the project root:
    npm run dev

Run:
    python camoufox_test.py
"""

from camoufox.sync_api import Camoufox

TARGET_URL = "http://localhost:3000/test/dev-source.html"
WAIT_TIMEOUT_MS = 15000


def main():
    print("[camoufox] Launching Camoufox (headless Firefox)...")

    with Camoufox(headless=True) as browser:
        page = browser.new_page()

        print(f"[camoufox] Navigating to {TARGET_URL}")
        page.goto(TARGET_URL)

        print("[camoufox] Waiting for fingerprint result...")
        page.wait_for_function("() => window.result !== undefined", timeout=WAIT_TIMEOUT_MS)

        fast_bot_detection_details = page.evaluate("() => window.result.fastBotDetectionDetails")

        import json
        print("\n=== fastBotDetectionDetails ===")
        print(json.dumps(fast_bot_detection_details, indent=2))

        triggered = [
            name
            for name, value in fast_bot_detection_details.items()
            if value.get("detected")
        ]

        print(f"\n=== Triggered detections ({len(triggered)}) ===")
        if not triggered:
            print("None")
        else:
            for name in triggered:
                print(f" • {name}")

    print("\n[camoufox] Done.")


if __name__ == "__main__":
    main()
