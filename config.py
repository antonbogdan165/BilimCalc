import os

SITE_URL = os.environ.get("SITE_URL", "https://bilimcalc.asia").rstrip("/")
APP_VERSION = os.environ.get("APP_VERSION", "1.8.3")
DEFAULT_INDEXNOW_KEY = os.environ.get("INDEXNOW_KEY", "bilimcalc2026key")
