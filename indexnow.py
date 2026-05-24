import urllib.request
import json
import os

SITE_URL = os.environ.get("SITE_URL", "https://bilimcalc.vercel.app").rstrip("/")

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
]

KEY = os.environ.get("INDEXNOW_KEY", "bilimcalc2026key")

from urllib.parse import urlparse

host = urlparse(SITE_URL).netloc

data = {
    "host": host,
    "key": KEY,
    "urlList": URLS,
}

body = json.dumps(data).encode("utf-8")

ENDPOINTS = [
    "https://api.indexnow.org/indexnow",
    "https://yandex.com/indexnow",
    "https://www.bing.com/indexnow",
]

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
