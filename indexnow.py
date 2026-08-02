import json
import os
import urllib.request
from urllib.parse import urlparse

from config import SITE_URL

URLS = [
    f"{SITE_URL}/",
    f"{SITE_URL}/articles",
    f"{SITE_URL}/kalkulator-ekzamena",
    f"{SITE_URL}/kak-rasschitat-so",
    f"{SITE_URL}/kak-rasschitat-sor",
    f"{SITE_URL}/kak-rasschitat-soch",
    f"{SITE_URL}/itogovaya-ocenka-za-chetvert",
    f"{SITE_URL}/metodika-rascheta-mon-rk",
    f"{SITE_URL}/kak-rasschitat-itogovuyu-otsenku-za-god",
    f"{SITE_URL}/kak-perevesti-procenty-v-otsenku",
    f"{SITE_URL}/perehod-na-12-letku-kazakhstan",
    f"{SITE_URL}/porogovye-bally-granta-ent",
    f"{SITE_URL}/kombinacii-profilnyh-predmetov-ent",
    f"{SITE_URL}/kalkulator-shansov-granta",
]

KEY = os.environ.get("INDEXNOW_KEY", "bilimcalc2026key")
ENDPOINTS = [
    "https://api.indexnow.org/indexnow",
    "https://yandex.com/indexnow",
    "https://www.bing.com/indexnow",
]


def _build_payload():
    return json.dumps(
        {
            "host": urlparse(SITE_URL).netloc,
            "key": KEY,
            "urlList": URLS,
        }
    ).encode("utf-8")


def main():
    body = _build_payload()
    for endpoint in ENDPOINTS:
        req = urllib.request.Request(
            endpoint,
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req) as response:
                print(f"[{endpoint}] Статус: {response.status} — OK")
        except urllib.error.HTTPError as e:
            print(f"[{endpoint}] Ошибка: {e.code} {e.reason}")
        except Exception as e:
            print(f"[{endpoint}] Ошибка: {e}")


if __name__ == "__main__":
    main()
