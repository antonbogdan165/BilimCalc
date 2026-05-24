from flask import Flask, render_template, send_from_directory, redirect, Response, request
import os
import time
import requests as req_lib
from datetime import date

try:
    from flask_limiter import Limiter
    from flask_limiter.util import get_remote_address
    _limiter_available = True
except ImportError:
    _limiter_available = False


app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", os.urandom(24))
BUILD_TIME = str(int(time.time()))

_SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
_SUPABASE_KEY = os.environ.get('SUPABASE_KEY', '')
_INDEXNOW_KEY = os.environ.get('INDEXNOW_KEY', 'bilimcalc2026key')

from config import SITE_URL


def _abs_url(path):
    return SITE_URL + path


def _canonical_for_path(path):
    """Canonical URL for a route path (must match sitemap loc format)."""
    if not path or path == "/":
        return SITE_URL + "/"
    return SITE_URL + path.rstrip("/")

_ALLOWED_ORIGINS = {
    'bilimcalc.vercel.app',
    'localhost',
    '127.0.0.1',
}

def _sb_headers():
    return {
        'apikey':        _SUPABASE_KEY,
        'Authorization': 'Bearer ' + _SUPABASE_KEY,
        'Content-Type':  'application/json',
        'Prefer':        'return=representation',
    }

def _is_allowed_origin():
    origin  = request.headers.get('Origin', '')
    referer = request.headers.get('Referer', '')
    combined = origin + referer
    return any(h in combined for h in _ALLOWED_ORIGINS)

if _limiter_available:
    limiter = Limiter(
        get_remote_address,
        app=app,
        default_limits=["200 per minute"],
        storage_uri="memory://",
    )


ARTICLE_ROUTES = {
    "/kak-rasschitat-soch":                          "kak-rasschitat-soch.html",
    "/kak-rasschitat-sor":                           "kak-rasschitat-sor.html",
    "/kak-rasschitat-so":                            "kak-rasschitat-so.html",
    "/itogovaya-ocenka-za-chetvert":                 "itogovaya-ocenka-za-chetvert.html",
    "/metodika-rascheta-mon-rk":                     "metodika-rascheta-mon-rk.html",
    "/kalkulator-ekzamena":                          "kalkulator-ekzamena.html",
    "/kak-rasschitat-itogovuyu-otsenku-za-god":      "kak-rasschitat-itogovuyu-otsenku-za-god.html",
    "/kak-perevesti-procenty-v-otsenku":             "kak-perevesti-procenty-v-otsenku.html",
    "/articles":                                     "articles.html",
    "/perehod-na-12-letku-kazakhstan":               "perehod-na-12-letku-kazakhstan.html",
    "/disable-adblock":                              "disable-adblock.html",
}

CALC_REDIRECTS = {
    "/kalkulator-sor":   "/",
    "/kalkulator-soch":  "/",
    "/kalkulator-so":    "/",
    "/calculator":       "/",
}

NOINDEX_ROUTES = {"/disable-adblock"}

TODAY = date.today().isoformat()

_SITEMAP_PATHS = [
    ("/",                                          "weekly",  "1.0"),
    ("/kalkulator-ekzamena",                       "monthly", "0.9"),
    ("/kak-rasschitat-itogovuyu-otsenku-za-god",   "monthly", "0.9"),
    ("/itogovaya-ocenka-za-chetvert",              "monthly", "0.85"),
    ("/articles",                                  "weekly",  "0.8"),
    ("/kak-perevesti-procenty-v-otsenku",          "monthly", "0.8"),
    ("/kak-rasschitat-soch",                       "monthly", "0.8"),
    ("/kak-rasschitat-sor",                        "monthly", "0.8"),
    ("/kak-rasschitat-so",                         "monthly", "0.8"),
    ("/metodika-rascheta-mon-rk",                  "monthly", "0.7"),
    ("/perehod-na-12-letku-kazakhstan",            "monthly", "0.7"),
]

SITEMAP_URLS = [
    {
        "loc": SITE_URL + path,
        "lastmod": TODAY,
        "changefreq": freq,
        "priority": pri,
    }
    for path, freq, pri in _SITEMAP_PATHS
]

SITEMAP_IMAGES = [
    {"loc": SITE_URL + "/", "image": SITE_URL + "/static/icons/preview.png", "title": "BilimCalc — калькулятор ФО, СОР и СОЧ"},
    {"loc": SITE_URL + "/kalkulator-ekzamena", "image": SITE_URL + "/static/icons/preview.png", "title": "BilimExam — итоговая оценка за год"},
]

RSS_ARTICLES = [
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
        canonical_url=_canonical_for_path(request.path),
        ya_ad_block_id=os.environ.get('YA_AD_BLOCK_ID', ''),
        ya_ad_block_left=os.environ.get('YA_AD_BLOCK_LEFT', ''),
        ya_ad_block_right=os.environ.get('YA_AD_BLOCK_RIGHT', ''),
        ya_ad_article_1=os.environ.get('YA_AD_ARTICLE_1', ''),
        ya_ad_article_2=os.environ.get('YA_AD_ARTICLE_2', ''),
        ya_ad_article_3=os.environ.get('YA_AD_ARTICLE_3', ''),
        ya_ad_sticky=os.environ.get('YA_AD_STICKY', ''),
    )

@app.before_request
def force_non_www():
    if request.host.startswith("www."):
        return redirect(SITE_URL + request.full_path, code=301)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/robots.txt")
def robots():
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
        f"Sitemap: {SITE_URL}/sitemap.xml\n"
    )
    return Response(body, mimetype="text/plain")


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
    for u in SITEMAP_URLS:
        img = image_map.get(u["loc"])
        img_block = ""
        if img:
            img_block = (
                f'<image:image>'
                f'<image:loc>{img["image"]}</image:loc>'
                f'<image:title>{img["title"]}</image:title>'
                f'</image:image>'
            )
        lines.append(
            f'  <url>'
            f'<loc>{u["loc"]}</loc>'
            f'<lastmod>{u["lastmod"]}</lastmod>'
            f'<changefreq>{u["changefreq"]}</changefreq>'
            f'<priority>{u["priority"]}</priority>'
            f'{img_block}'
            f'</url>'
        )
    lines.append('</urlset>')
    return Response("\n".join(lines), mimetype="application/xml")


@app.route("/feed.xml")
def rss_feed():
    items = ""
    for a in RSS_ARTICLES:
        items += (
            f"\n    <item>"
            f"\n      <title><![CDATA[{a['title']}]]></title>"
            f"\n      <link>{a['link']}</link>"
            f"\n      <guid isPermaLink=\"true\">{a['link']}</guid>"
            f"\n      <description><![CDATA[{a['desc']}]]></description>"
            f"\n      <pubDate>{a['date']}</pubDate>"
            f"\n    </item>"
        )
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'
        '  <channel>\n'
        '    <title>BilimCalc — Статьи о системе оценивания в Казахстане</title>\n'
        f'    <link>{SITE_URL}/articles</link>\n'
        '    <description>Подробные руководства по ФО, СОР, СОЧ и итоговым оценкам по методике МОН РК</description>\n'
        '    <language>ru</language>\n'
        f'    <atom:link href="{SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>\n'
        f'{items}\n'
        '  </channel>\n'
        '</rss>'
    )
    return Response(xml, mimetype="application/xml")


@app.route("/sw.js")
def service_worker():
    sw_path = os.path.join(app.root_path, "static", "js", "sw.js")
    with open(sw_path, "r", encoding="utf-8") as f:
        content = f.read().replace("__BUILD_TIME__", BUILD_TIME)
    response = app.response_class(response=content, mimetype="application/javascript")
    response.headers["Service-Worker-Allowed"] = "/"
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    return response


@app.route("/favicon.ico")
def favicon():
    return send_from_directory("static/icons", "favicon.ico")


@app.route("/bilimcalc2026key.txt")
def indexnow_key():
    return _INDEXNOW_KEY, 200, {"Content-Type": "text/plain"}


@app.route("/api/visits", methods=["GET"])
def api_visits_get():
    if not _SUPABASE_URL or not _SUPABASE_KEY:
        return _json({"count": 0})
    try:
        r = req_lib.get(
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
        r = req_lib.post(
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
    from flask import jsonify
    return jsonify(data)


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