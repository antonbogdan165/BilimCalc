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
