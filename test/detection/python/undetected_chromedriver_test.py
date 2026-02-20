"""
Detection test: undetected-chromedriver

undetected-chromedriver patches the ChromeDriver binary to avoid triggering
common bot-detection heuristics (navigator.webdriver removal, CDP fingerprint
patches, etc.).

Prerequisites:
    pip install -r requirements.txt
    # Start the Vite dev server in the project root:
    npm run dev

Run:
    python undetected_chromedriver_test.py
"""

import json
import time

import undetected_chromedriver as uc

TARGET_URL = "http://localhost:3000/test/dev-source.html"
WAIT_TIMEOUT_SECONDS = 15
POLL_INTERVAL_SECONDS = 0.5


def wait_for_result(driver, timeout=WAIT_TIMEOUT_SECONDS):
    """Poll until window.result is populated by the fingerprint scanner."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        ready = driver.execute_script("return window.result !== undefined;")
        if ready:
            return
        time.sleep(POLL_INTERVAL_SECONDS)
    raise TimeoutError(
        f"window.result was not set within {timeout}s. "
        "Make sure the Vite dev server is running on port 3000."
    )


def main():
    print("[undetected-chromedriver] Launching Chrome...")

    options = uc.ChromeOptions()
    # Run headless so it matches the puppeteer examples
    options.add_argument("--headless=new")

    driver = uc.Chrome(options=options, use_subprocess=False)

    try:
        print(f"[undetected-chromedriver] Navigating to {TARGET_URL}")
        driver.get(TARGET_URL)

        print("[undetected-chromedriver] Waiting for fingerprint result...")
        wait_for_result(driver)

        fast_bot_detection_details = driver.execute_script(
            "return window.result.fastBotDetectionDetails;"
        )

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

    finally:
        driver.quit()
        print("\n[undetected-chromedriver] Done.")


if __name__ == "__main__":
    main()
