import os
import time
from html import escape
from urllib.parse import urlparse

import requests
from flask import (
    Flask,
    Response,
    jsonify,
    redirect,
    render_template,
    request,
    send_from_directory,
)

try:
    from flask_limiter import Limiter
    from flask_limiter.util import get_remote_address

    _limiter_available = True
except ImportError:
    _limiter_available = False


app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", os.urandom(24))
BUILD_TIME = str(int(time.time()))

_SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
_SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")
_INDEXNOW_KEY = os.environ.get("INDEXNOW_KEY", "bilimcalc2026key")

from config import APP_VERSION, SITE_URL


def _abs_url(path):
    return SITE_URL + path


def _canonical_for_path(path):
    if not path or path == "/":
        return SITE_URL + "/"
    return SITE_URL + path.rstrip("/")


def _normalize_host(host):
    if not host:
        return ""
    return host.split(":", 1)[0].lower()


def _allowed_hosts():
    hosts = {"localhost", "127.0.0.1"}
    host = _normalize_host(urlparse(SITE_URL).netloc)
    if host:
        hosts.add(host)
        if host.startswith("www."):
            hosts.add(host[4:])
        else:
            hosts.add("www." + host)
    return hosts


def _sb_headers():
    return {
        "apikey": _SUPABASE_KEY,
        "Authorization": "Bearer " + _SUPABASE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def _is_allowed_origin():
    allowed = _allowed_hosts()
    if _normalize_host(request.host) in allowed:
        return True
    for header in ("Origin", "Referer"):
        value = request.headers.get(header, "")
        parsed = urlparse(value)
        if _normalize_host(parsed.netloc) in allowed:
            return True
    return False


if _limiter_available:
    limiter = Limiter(
        get_remote_address,
        app=app,
        default_limits=["200 per minute"],
        storage_uri="memory://",
    )


ARTICLE_ROUTES = {
    "/kak-rasschitat-soch": "kak-rasschitat-soch.html",
    "/kak-rasschitat-sor": "kak-rasschitat-sor.html",
    "/kak-rasschitat-so": "kak-rasschitat-so.html",
    "/itogovaya-ocenka-za-chetvert": "itogovaya-ocenka-za-chetvert.html",
    "/metodika-rascheta-mon-rk": "metodika-rascheta-mon-rk.html",
    "/kalkulator-ekzamena": "kalkulator-ekzamena.html",
    "/kak-rasschitat-itogovuyu-otsenku-za-god": "kak-rasschitat-itogovuyu-otsenku-za-god.html",
    "/kak-perevesti-procenty-v-otsenku": "kak-perevesti-procenty-v-otsenku.html",
    "/articles": "articles.html",
    "/perehod-na-12-letku-kazakhstan": "perehod-na-12-letku-kazakhstan.html",
    "/porogovye-bally-granta-ent": "porogovye-bally-granta-ent.html",
    "/kombinacii-profilnyh-predmetov-ent": "kombinacii-profilnyh-predmetov-ent.html",
    "/kalkulator-shansov-granta": "kalkulator-shansov-granta.html",
    "/disable-adblock": "disable-adblock.html",
}

TEMPLATE_ROUTES = {"/": "index.html", **ARTICLE_ROUTES}

CALC_REDIRECTS = {
    "/kalkulator-sor": "/",
    "/kalkulator-soch": "/",
    "/kalkulator-so": "/",
    "/calculator": "/",
}

NOINDEX_ROUTES = {"/disable-adblock"}

SITEMAP_LASTMOD = "2026-07-31"

_SITEMAP_PATHS = [
    ("/", "weekly", "1.0"),
    ("/kalkulator-shansov-granta", "monthly", "0.95"),
    ("/porogovye-bally-granta-ent", "monthly", "0.9"),
    ("/kombinacii-profilnyh-predmetov-ent", "monthly", "0.85"),
    ("/kalkulator-ekzamena", "monthly", "0.9"),
    ("/kak-rasschitat-itogovuyu-otsenku-za-god", "monthly", "0.9"),
    ("/itogovaya-ocenka-za-chetvert", "monthly", "0.85"),
    ("/articles", "weekly", "0.8"),
    ("/kak-perevesti-procenty-v-otsenku", "monthly", "0.8"),
    ("/kak-rasschitat-soch", "monthly", "0.8"),
    ("/kak-rasschitat-sor", "monthly", "0.8"),
    ("/kak-rasschitat-so", "monthly", "0.8"),
    ("/metodika-rascheta-mon-rk", "monthly", "0.7"),
    ("/perehod-na-12-letku-kazakhstan", "monthly", "0.7"),
]


def _template_lastmod(path):
    template = TEMPLATE_ROUTES.get(path)
    if not template:
        return None
    template_path = os.path.join(app.template_folder, template)
    try:
        timestamp = os.path.getmtime(template_path)
    except OSError:
        return None
    return time.strftime("%Y-%m-%d", time.gmtime(timestamp))


def _get_sitemap_urls():
    urls = []
    for path, freq, pri in _SITEMAP_PATHS:
        urls.append(
            {
                "loc": SITE_URL + path,
                "lastmod": _template_lastmod(path) or SITEMAP_LASTMOD,
                "changefreq": freq,
                "priority": pri,
            }
        )
    return urls


SITEMAP_IMAGES = [
    {
        "loc": SITE_URL + "/",
        "image": SITE_URL + "/static/icons/preview.webp",
        "title": "BilimCalc — калькулятор ФО, СОР и СОЧ",
    },
    {
        "loc": SITE_URL + "/kalkulator-ekzamena",
        "image": SITE_URL + "/static/icons/preview.webp",
        "title": "BilimExam — итоговая оценка за год",
    },
    {
        "loc": SITE_URL + "/kalkulator-shansov-granta",
        "image": SITE_URL + "/static/icons/preview.webp",
        "title": "BilimGrant — калькулятор шансов на грант ЕНТ",
    },
]

RSS_ARTICLES = [
    {
        "title": "Комбинации профильных предметов ЕНТ: как выбрать специальность",
        "link": _abs_url("/kombinacii-profilnyh-predmetov-ent"),
        "desc": "Все 12 комбинаций профильных предметов ЕНТ 2026 и специальности, которые они открывают. Таблица, главное правило выбора и частые ошибки.",
        "date": "Sat, 01 Aug 2026 10:00:00 +0500",
    },
    {
        "title": "Проходные баллы гранта ЕНТ 2026 — таблица и алгоритм",
        "link": _abs_url("/porogovye-bally-granta-ent"),
        "desc": "Пороговые и проходные баллы гранта ЕНТ: IT, медицина, право. Алгоритм распределения, сельская квота, нововведения 2026.",
        "date": "Fri, 31 Jul 2026 10:00:00 +0500",
    },
    {
        "title": "Итоговая оценка за год: формула 70/30",
        "link": _abs_url("/kak-rasschitat-itogovuyu-otsenku-za-god"),
        "desc": "Как рассчитывается итоговая оценка за год в 9 и 11 классах Казахстана по формуле МОН РК.",
        "date": "Thu, 13 Mar 2026 10:00:00 +0500",
    },
    {
        "title": "Итоговая оценка за четверть: формула расчёта ФО, СОР, СОЧ",
        "link": _abs_url("/itogovaya-ocenka-za-chetvert"),
        "desc": "Как рассчитывается итоговая оценка за четверть в школах Казахстана по методике МОН РК.",
        "date": "Thu, 13 Mar 2026 10:00:00 +0500",
    },
    {
        "title": "Как рассчитать СОЧ — формула и пример",
        "link": _abs_url("/kak-rasschitat-soch"),
        "desc": "Суммативное оценивание за четверть: формула расчёта, вес 50%, пошаговый пример.",
        "date": "Thu, 13 Mar 2026 10:00:00 +0500",
    },
    {
        "title": "Как рассчитать СОР — полное руководство",
        "link": _abs_url("/kak-rasschitat-sor"),
        "desc": "Суммативное оценивание за раздел: формула расчёта, вес 25%, пример с двумя СОР.",
        "date": "Thu, 13 Mar 2026 10:00:00 +0500",
    },
    {
        "title": "Как рассчитать ФО — формула, пример, методика МОН РК",
        "link": _abs_url("/kak-rasschitat-so"),
        "desc": "Суммативное оценивание по шкале 1–10: формула расчёта и вес 25% в итоговой оценке.",
        "date": "Thu, 13 Mar 2026 10:00:00 +0500",
    },
    {
        "title": "Как перевести проценты в оценку — таблица и конвертер",
        "link": _abs_url("/kak-perevesti-procenty-v-otsenku"),
        "desc": "Шкала оценок Казахстан: 85%=5, 65%=4, 40%=3. Правило округления и онлайн-конвертер.",
        "date": "Thu, 13 Mar 2026 10:00:00 +0500",
    },
    {
        "title": "Методика расчёта оценок МОН РК — критериальное оценивание",
        "link": _abs_url("/metodika-rascheta-mon-rk"),
        "desc": "Официальная методика оценивания в казахстанских школах: три вида суммативного оценивания.",
        "date": "Thu, 13 Mar 2026 10:00:00 +0500",
    },
    {
        "title": "3–8 классы переводят на 12-летнее обучение в Казахстане? Правда или фейк",
        "link": _abs_url("/perehod-na-12-letku-kazakhstan"),
        "desc": "Разбираем информацию о переходе 3–8 классов на 12-летнее образование в Казахстане.",
        "date": "Wed, 19 Mar 2026 10:00:00 +0500",
    },
]


@app.context_processor
def inject_globals():
    return dict(
        site_url=SITE_URL,
        app_version=APP_VERSION,
        build_time=BUILD_TIME,
        canonical_url=_canonical_for_path(request.path),
        google_site_verification=os.environ.get(
            "GOOGLE_SITE_VERIFICATION", "0fMbzvCzXupKdMlhlgc1xPnxrAcWKTaLS_zsNe4mDJc"
        ),
        yandex_verification=os.environ.get("YANDEX_VERIFICATION", "f1fe256acca013a6"),
        ya_ad_block_id=os.environ.get("YA_AD_BLOCK_ID", ""),
        ya_ad_block_left=os.environ.get("YA_AD_BLOCK_LEFT", ""),
        ya_ad_block_right=os.environ.get("YA_AD_BLOCK_RIGHT", ""),
        ya_ad_article_1=os.environ.get("YA_AD_ARTICLE_1", ""),
        ya_ad_article_2=os.environ.get("YA_AD_ARTICLE_2", ""),
        ya_ad_article_3=os.environ.get("YA_AD_ARTICLE_3", ""),
        ya_ad_sticky=os.environ.get("YA_AD_STICKY", ""),
    )


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/robots.txt")
def robots():
    host = urlparse(SITE_URL).netloc
    ai_agents = [
        "GPTBot",
        "ChatGPT-User",
        "OAI-SearchBot",
        "ClaudeBot",
        "anthropic-ai",
        "Claude-User",
        "PerplexityBot",
        "Perplexity-User",
        "Google-Extended",
        "Applebot-Extended",
        "Amazonbot",
        "YandexRenderResourcesBot",
    ]
    body = (
        "User-agent: *\n"
        "Allow: /\n"
        "Disallow: /api/\n"
        "Disallow: /disable-adblock\n"
        "\n"
        "User-agent: Googlebot\n"
        "Allow: /\n"
        "Disallow: /api/\n"
        "Disallow: /disable-adblock\n"
        "\n"
        "User-agent: Bingbot\n"
        "Allow: /\n"
        "Disallow: /api/\n"
        "Disallow: /disable-adblock\n"
        "\n"
        "User-agent: YandexBot\n"
        "Allow: /\n"
        "Disallow: /api/\n"
        "Disallow: /disable-adblock\n"
        "\n"
    )
    for agent in ai_agents:
        body += (
            f"User-agent: {agent}\n"
            "Allow: /\n"
            "Disallow: /api/\n"
            "Disallow: /disable-adblock\n"
            "\n"
        )
    body += f"Sitemap: {SITE_URL}/sitemap.xml\n"
    if host:
        body = f"Host: {host}\n" + body
    response = Response(body, mimetype="text/plain")
    response.headers["Cache-Control"] = "public, max-age=3600"
    return response


@app.route("/llms.txt")
def llms_txt():
    lines = [
        "# BilimCalc",
        "",
        "> Бесплатный онлайн-калькулятор ФО, СОР, СОЧ и итоговых оценок для школ Казахстана "
        "по официальной методике МОН РК. Без регистрации.",
        "",
        "## Калькуляторы",
        f"- [BilimCalc — ФО, СОР, СОЧ]({SITE_URL}/): расчёт итоговой оценки за четверть.",
        f"- [BilimExam]({SITE_URL}/kalkulator-ekzamena): итоговая оценка за год по формуле 70/30 для 9 и 11 класса.",
        f"- [BilimGrant]({SITE_URL}/kalkulator-shansov-granta): оценка шансов на грант ЕНТ по пробному баллу.",
        "",
        "## Статьи",
    ]
    for a in RSS_ARTICLES:
        lines.append(f"- [{a['title']}]({a['link']}): {a['desc']}")
    lines.append("")
    lines.append("## Дополнительно")
    lines.append(f"- [Полный список статей]({SITE_URL}/articles)")
    lines.append(f"- [Sitemap]({SITE_URL}/sitemap.xml)")
    body = "\n".join(lines) + "\n"
    response = Response(body, mimetype="text/plain; charset=utf-8")
    response.headers["Cache-Control"] = "public, max-age=3600"
    return response


@app.route("/sitemap.xml")
def sitemap():
    image_map = {item["loc"]: item for item in SITEMAP_IMAGES}
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"',
        '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
        '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9',
        '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">',
    ]
    for u in _get_sitemap_urls():
        img = image_map.get(u["loc"])
        img_block = ""
        if img:
            img_block = (
                f"<image:image>"
                f"<image:loc>{escape(img['image'])}</image:loc>"
                f"<image:title>{escape(img['title'])}</image:title>"
                f"</image:image>"
            )
        lines.append(
            f"  <url>"
            f"<loc>{escape(u['loc'])}</loc>"
            f"<lastmod>{u['lastmod']}</lastmod>"
            f"<changefreq>{u['changefreq']}</changefreq>"
            f"<priority>{u['priority']}</priority>"
            f"{img_block}"
            f"</url>"
        )
    lines.append("</urlset>")
    response = Response("\n".join(lines), mimetype="application/xml")
    response.headers["Cache-Control"] = "public, max-age=3600"
    return response


@app.route("/feed.xml")
def rss_feed():
    items = ""
    for a in RSS_ARTICLES:
        items += (
            f"\n    <item>"
            f"\n      <title><![CDATA[{a['title']}]]></title>"
            f"\n      <link>{a['link']}</link>"
            f'\n      <guid isPermaLink="true">{a["link"]}</guid>'
            f"\n      <description><![CDATA[{a['desc']}]]></description>"
            f"\n      <pubDate>{a['date']}</pubDate>"
            f"\n    </item>"
        )
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'
        "  <channel>\n"
        "    <title>BilimCalc — Статьи о системе оценивания в Казахстане</title>\n"
        f"    <link>{SITE_URL}/articles</link>\n"
        "    <description>Подробные руководства по ФО, СОР, СОЧ и итоговым оценкам по методике МОН РК</description>\n"
        "    <language>ru</language>\n"
        f'    <atom:link href="{SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>\n'
        f"{items}\n"
        "  </channel>\n"
        "</rss>"
    )
    response = Response(xml, mimetype="application/rss+xml")
    response.headers["Cache-Control"] = "public, max-age=3600"
    return response


@app.route("/sw.js")
def service_worker():
    sw_path = os.path.join(app.root_path, "static", "js", "sw.js")
    try:
        with open(sw_path, "r", encoding="utf-8") as f:
            content = f.read().replace("__BUILD_TIME__", BUILD_TIME)
    except OSError:
        return "", 404
    response = app.response_class(response=content, mimetype="application/javascript")
    response.headers["Service-Worker-Allowed"] = "/"
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    return response


@app.route("/favicon.ico")
def favicon():
    return send_from_directory("static/icons", "favicon.ico")


@app.route("/site.webmanifest")
def webmanifest():
    return send_from_directory(
        os.path.join(app.root_path, "static"),
        "site.webmanifest",
        mimetype="application/manifest+json",
    )


@app.route("/bilimcalc2026key.txt")
def indexnow_key():
    return _INDEXNOW_KEY, 200, {"Content-Type": "text/plain"}


@app.route("/api/visits", methods=["GET"])
def api_visits_get():
    if not _SUPABASE_URL or not _SUPABASE_KEY:
        return _json({"count": 0})
    try:
        r = requests.get(
            _SUPABASE_URL + "/rest/v1/visits?id=eq.1&select=count",
            headers=_sb_headers(),
            timeout=5,
        )
        data = r.json()
        return _json({"count": data[0]["count"] if data else 0})
    except Exception:
        return _json({"count": 0})


@app.route("/api/visits/increment", methods=["POST"])
def api_visits_increment():
    if not _is_allowed_origin():
        return _json({"count": 0})
    if not _SUPABASE_URL or not _SUPABASE_KEY:
        return _json({"count": 0})
    try:
        r = requests.post(
            _SUPABASE_URL + "/rest/v1/rpc/increment_visits",
            headers=_sb_headers(),
            json={},
            timeout=5,
        )
        raw = r.json()
        return _json({"count": raw if isinstance(raw, int) else 0})
    except Exception:
        return _json({"count": 0})


def _json(data):
    return jsonify(data)


@app.after_request
def set_security_headers(response):
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    if SITE_URL.startswith("https://"):
        response.headers.setdefault(
            "Strict-Transport-Security",
            "max-age=31536000; includeSubDomains; preload",
        )
    return response


def _make_article_view(template, noindex=False):
    def view():
        return render_template(template, noindex=noindex)

    view.__name__ = template
    return view


def _make_redirect_view(target, route_name):
    def view():
        return redirect(target, code=301)

    view.__name__ = "redirect_" + route_name
    return view


for path, template in ARTICLE_ROUTES.items():
    is_noindex = path in NOINDEX_ROUTES
    app.add_url_rule(path, view_func=_make_article_view(template, noindex=is_noindex))

for path, target in CALC_REDIRECTS.items():
    app.add_url_rule(path, view_func=_make_redirect_view(target, path.lstrip("/")))


@app.errorhandler(404)
def page_not_found(e):
    return render_template("404.html", noindex=True), 404
