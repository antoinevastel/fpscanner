"""
Detection test: Selenium + headless Chrome (no evasion)

Prerequisites:
    pip install -r requirements.txt
    # Start the Vite dev server in the project root:
    npm run dev

Run:
    python selenium_headless_test.py
"""

import json
import time

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait

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
    print("[selenium-headless] Launching headless Chrome...")

    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-setuid-sandbox")

    driver = webdriver.Chrome(options=options)

    try:
        print(f"[selenium-headless] Navigating to {TARGET_URL}")
        driver.get(TARGET_URL)

        print("[selenium-headless] Waiting for fingerprint result...")
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
        print("\n[selenium-headless] Done.")


if __name__ == "__main__":
    main()
