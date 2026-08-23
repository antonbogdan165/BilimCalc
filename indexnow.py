import json
import os
import urllib.error
import urllib.request
from urllib.parse import urlparse

from config import DEFAULT_INDEXNOW_KEY, SITE_URL
from routes_map import ARTICLE_ROUTES, NOINDEX_ROUTES

URL_PATHS = ["/", "/kk"]
for path in ARTICLE_ROUTES:
    if path in NOINDEX_ROUTES:
        continue
    URL_PATHS.extend([path, "/kk" + path])

URLS = [SITE_URL + path for path in URL_PATHS]

KEY = DEFAULT_INDEXNOW_KEY
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
