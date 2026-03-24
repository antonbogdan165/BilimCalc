import urllib.request
import json

URLS = [
    "https://bilimcalc.vercel.app/",
    "https://bilimcalc.vercel.app/articles",
    "https://bilimcalc.vercel.app/kalkulator-ekzamena",
    "https://bilimcalc.vercel.app/kak-rasschitat-so",
    "https://bilimcalc.vercel.app/kak-rasschitat-sor",
    "https://bilimcalc.vercel.app/kak-rasschitat-soch",
    "https://bilimcalc.vercel.app/itogovaya-ocenka-za-chetvert",
    "https://bilimcalc.vercel.app/metodika-rascheta-mon-rk",
    "https://bilimcalc.vercel.app/kak-rasschitat-itogovuyu-otsenku-za-god",
    "https://bilimcalc.vercel.app/kak-perevesti-procenty-v-otsenku",
    "https://bilimcalc.vercel.app/perehod-na-12-letku-kazakhstan",
]

data = {
    "host": "bilimcalc.vercel.app",
    "key": "bilimcalc2026key",
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