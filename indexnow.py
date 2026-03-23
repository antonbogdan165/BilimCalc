import urllib.request
import json

data = {
    "host": "bilimcalc.vercel.app",
    "key": "bilimcalc2026key",
    "urlList": [
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
        "https://bilimcalc.vercel.app/perehod-na-12-letku-kazakhstan"
    ]
}

body = json.dumps(data).encode("utf-8")

req = urllib.request.Request(
    "https://api.indexnow.org/indexnow",
    data=body,
    headers={"Content-Type": "application/json"},
    method="POST"
)

try:
    with urllib.request.urlopen(req) as response:
        print("Статус:", response.status)
        print("Готово! Поисковики уведомлены.")
except urllib.error.HTTPError as e:
    print("Ошибка:", e.code, e.reason)
