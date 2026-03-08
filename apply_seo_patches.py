import re, os, shutil
from datetime import datetime

TEMPLATES_DIR = "templates"
STATIC_DIR    = "static"
BACKUP        = True   # создавать .bak перед заменой

# ─── Карта: файл → новый блок schema_extra ───────────────────────────────────

PATCHES = {

# ════════════════════════════════════════════════════════════════════════════
"kak-rasschitat-so.html": """\
{% block schema_extra %}
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Как рассчитать СО в школе Казахстана",
    "description": "Формула расчёта суммативного оценивания, пример с числами, официальная методика МОН РК",
    "url": "https://bilimcalc.vercel.app/kak-rasschitat-so",
    "datePublished": "2025-09-01",
    "dateModified": "2026-02-01",
    "image": "https://bilimcalc.vercel.app/static/icons/preview.png",
    "inLanguage": "ru",
    "author": { "@type": "Person", "name": "Anton", "url": "https://github.com/antonbogdan165" },
    "publisher": { "@type": "Organization", "name": "BilimCalc", "logo": { "@type": "ImageObject", "url": "https://bilimcalc.vercel.app/static/icons/favicon-32x32.png" } },
    "mainEntityOfPage": { "@type": "WebPage", "@id": "https://bilimcalc.vercel.app/kak-rasschitat-so" }
}
</script>
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://bilimcalc.vercel.app/" },
        { "@type": "ListItem", "position": 2, "name": "Как рассчитать СО", "item": "https://bilimcalc.vercel.app/kak-rasschitat-so" }
    ]
}
</script>
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Как рассчитать СО (суммативное оценивание)",
    "description": "Пошаговый расчёт СО по официальной методике МОН РК для школ Казахстана",
    "image": "https://bilimcalc.vercel.app/static/icons/preview.png",
    "totalTime": "PT2M",
    "step": [
        { "@type": "HowToStep", "position": 1, "name": "Запишите все оценки СО", "text": "Соберите все полученные оценки суммативного оценивания за четверть по шкале 1–10." },
        { "@type": "HowToStep", "position": 2, "name": "Найдите среднее арифметическое", "text": "Сложите все оценки СО и разделите на их количество. Например: (7+8+9+6+8) ÷ 5 = 7,6." },
        { "@type": "HowToStep", "position": 3, "name": "Рассчитайте вклад СО в итоговую оценку", "text": "Разделите среднее на 10 и умножьте на 25: 7,6 ÷ 10 × 25 = 19%. Это вклад СО в итоговую оценку за четверть." }
    ]
}
</script>
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Можно ли пересдать СО?",
            "acceptedAnswer": { "@type": "Answer", "text": "Чаще всего пересдача СО не предусмотрена. Формативные оценки в Казахстане используются как фиксация результата на конкретный момент. В редких случаях учитель может дать дополнительное задание." }
        },
        {
            "@type": "Question",
            "name": "Сколько СО ставится за четверть?",
            "acceptedAnswer": { "@type": "Answer", "text": "Точного количества нет — зависит от предмета и программы. Обычно это 12–16 СО за четверть. Все они учитываются при расчёте среднего балла." }
        },
        {
            "@type": "Question",
            "name": "Как СО влияет на итоговую оценку за четверть?",
            "acceptedAnswer": { "@type": "Answer", "text": "СО составляет 25% итоговой оценки за четверть. Формула: (среднее всех СО ÷ 10) × 25. Даже при хорошем СОЧ слабые СО снижают итог." }
        }
    ]
}
</script>
{% endblock %}""",

# ════════════════════════════════════════════════════════════════════════════
"kak-rasschitat-sor.html": """\
{% block schema_extra %}
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Как рассчитать СОР в школе Казахстана",
    "description": "Формула расчёта суммативного оценивания за раздел, пример с числами, официальная методика МОН РК",
    "url": "https://bilimcalc.vercel.app/kak-rasschitat-sor",
    "datePublished": "2025-09-01",
    "dateModified": "2026-02-01",
    "image": "https://bilimcalc.vercel.app/static/icons/preview.png",
    "inLanguage": "ru",
    "author": { "@type": "Person", "name": "Anton", "url": "https://github.com/antonbogdan165" },
    "publisher": { "@type": "Organization", "name": "BilimCalc", "logo": { "@type": "ImageObject", "url": "https://bilimcalc.vercel.app/static/icons/favicon-32x32.png" } },
    "mainEntityOfPage": { "@type": "WebPage", "@id": "https://bilimcalc.vercel.app/kak-rasschitat-sor" }
}
</script>
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://bilimcalc.vercel.app/" },
        { "@type": "ListItem", "position": 2, "name": "Как рассчитать СОР", "item": "https://bilimcalc.vercel.app/kak-rasschitat-sor" }
    ]
}
</script>
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Как рассчитать СОР (суммативное оценивание за раздел)",
    "description": "Пошаговый расчёт СОР по официальной методике МОН РК",
    "image": "https://bilimcalc.vercel.app/static/icons/preview.png",
    "totalTime": "PT2M",
    "step": [
        { "@type": "HowToStep", "position": 1, "name": "Переведите каждый СОР в проценты", "text": "Для каждого СОР: набранные баллы ÷ максимум × 100. Например: 12 ÷ 15 × 100 = 80%." },
        { "@type": "HowToStep", "position": 2, "name": "Найдите среднее по всем СОР", "text": "Сложите проценты всех СОР и разделите на количество. Например: (80% + 60%) ÷ 2 = 70%." },
        { "@type": "HowToStep", "position": 3, "name": "Рассчитайте вклад СОР", "text": "Умножьте среднее на 0,25: 70% × 0,25 = 17,5 из 25 возможных баллов." }
    ]
}
</script>
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Когда проводится СОР в казахстанских школах?",
            "acceptedAnswer": { "@type": "Answer", "text": "Обычно два СОР за четверть — после завершения крупных разделов программы. Иногда больше, если тема большая." }
        },
        {
            "@type": "Question",
            "name": "Можно ли пересдать СОР?",
            "acceptedAnswer": { "@type": "Answer", "text": "Только с разрешения учителя. Обычно назначают индивидуальную сдачу или перенос при наличии уважительной причины." }
        },
        {
            "@type": "Question",
            "name": "Сколько весит СОР в итоговой оценке за четверть?",
            "acceptedAnswer": { "@type": "Answer", "text": "СОР составляет 25% итоговой оценки за четверть. Формула: средний процент по всем СОР × 0,25." }
        }
    ]
}
</script>
{% endblock %}""",

# ════════════════════════════════════════════════════════════════════════════
"kak-rasschitat-soch.html": """\
{% block schema_extra %}
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Как рассчитать СОЧ в школе Казахстана",
    "description": "Формула расчёта суммативного оценивания за четверть, пример с числами, официальная методика МОН РК",
    "url": "https://bilimcalc.vercel.app/kak-rasschitat-soch",
    "datePublished": "2025-09-01",
    "dateModified": "2026-02-01",
    "image": "https://bilimcalc.vercel.app/static/icons/preview.png",
    "inLanguage": "ru",
    "author": { "@type": "Person", "name": "Anton", "url": "https://github.com/antonbogdan165" },
    "publisher": { "@type": "Organization", "name": "BilimCalc", "logo": { "@type": "ImageObject", "url": "https://bilimcalc.vercel.app/static/icons/favicon-32x32.png" } },
    "mainEntityOfPage": { "@type": "WebPage", "@id": "https://bilimcalc.vercel.app/kak-rasschitat-soch" }
}
</script>
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://bilimcalc.vercel.app/" },
        { "@type": "ListItem", "position": 2, "name": "Как рассчитать СОЧ", "item": "https://bilimcalc.vercel.app/kak-rasschitat-soch" }
    ]
}
</script>
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Как рассчитать СОЧ (суммативное оценивание за четверть)",
    "description": "Пошаговый расчёт СОЧ по официальной методике МОН РК",
    "image": "https://bilimcalc.vercel.app/static/icons/preview.png",
    "totalTime": "PT1M",
    "step": [
        { "@type": "HowToStep", "position": 1, "name": "Узнайте набранные и максимальные баллы", "text": "Запишите, сколько баллов набрано за СОЧ и каков максимум. Например: 18 из 25." },
        { "@type": "HowToStep", "position": 2, "name": "Переведите в проценты", "text": "Набранные ÷ максимум × 100: 18 ÷ 25 × 100 = 72%." },
        { "@type": "HowToStep", "position": 3, "name": "Рассчитайте вклад СОЧ", "text": "Умножьте процент на 0,5: 72% × 0,5 = 36 из 50 возможных баллов." }
    ]
}
</script>
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Можно ли пересдать СОЧ?",
            "acceptedAnswer": { "@type": "Answer", "text": "Пересдача возможна только по правилам школы — как правило, с разрешения учителя при уважительной причине." }
        },
        {
            "@type": "Question",
            "name": "Когда проводится СОЧ?",
            "acceptedAnswer": { "@type": "Answer", "text": "СОЧ проходит в конце каждой четверти по всем основным предметам." }
        },
        {
            "@type": "Question",
            "name": "Сколько весит СОЧ в итоговой оценке?",
            "acceptedAnswer": { "@type": "Answer", "text": "СОЧ составляет 50% итоговой оценки за четверть — это самый весомый компонент. Формула: (набранные ÷ максимум) × 50." }
        }
    ]
}
</script>
{% endblock %}""",

# ════════════════════════════════════════════════════════════════════════════
"itogovaya-ocenka-za-chetvert.html": """\
{% block schema_extra %}
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Итоговая оценка за четверть в школах Казахстана: как рассчитывается",
    "description": "Формула расчёта итоговой оценки за четверть: СО + СОР + СОЧ, пошаговый пример и переводная шкала по методике МОН РК",
    "url": "https://bilimcalc.vercel.app/itogovaya-ocenka-za-chetvert",
    "datePublished": "2025-09-01",
    "dateModified": "2026-02-01",
    "image": "https://bilimcalc.vercel.app/static/icons/preview.png",
    "inLanguage": "ru",
    "author": { "@type": "Person", "name": "Anton", "url": "https://github.com/antonbogdan165" },
    "publisher": { "@type": "Organization", "name": "BilimCalc", "logo": { "@type": "ImageObject", "url": "https://bilimcalc.vercel.app/static/icons/favicon-32x32.png" } },
    "mainEntityOfPage": { "@type": "WebPage", "@id": "https://bilimcalc.vercel.app/itogovaya-ocenka-za-chetvert" }
}
</script>
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://bilimcalc.vercel.app/" },
        { "@type": "ListItem", "position": 2, "name": "Итоговая оценка за четверть", "item": "https://bilimcalc.vercel.app/itogovaya-ocenka-za-chetvert" }
    ]
}
</script>
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Как рассчитать итоговую оценку за четверть",
    "description": "Пошаговый расчёт по формуле МОН РК: СО × 25% + СОР × 25% + СОЧ × 50%",
    "image": "https://bilimcalc.vercel.app/static/icons/preview.png",
    "totalTime": "PT3M",
    "step": [
        { "@type": "HowToStep", "position": 1, "name": "Рассчитайте вклад СО", "text": "Среднее СО ÷ 10 × 25. Например: среднее 8 → 8 ÷ 10 × 25 = 20%." },
        { "@type": "HowToStep", "position": 2, "name": "Рассчитайте вклад СОР", "text": "Средний процент по СОР × 0,25. Например: 70% × 0,25 = 17,5%." },
        { "@type": "HowToStep", "position": 3, "name": "Рассчитайте вклад СОЧ", "text": "Набранные ÷ максимум × 50. Например: 18/25 × 50 = 36%." },
        { "@type": "HowToStep", "position": 4, "name": "Сложите все компоненты", "text": "Итог = СО% + СОР% + СОЧ%. Например: 20 + 17,5 + 36 = 73,5% → оценка «4»." }
    ]
}
</script>
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Как рассчитывается итоговая оценка за четверть?",
            "acceptedAnswer": { "@type": "Answer", "text": "По формуле МОН РК: СО × 25% + СОР × 25% + СОЧ × 50%. Если СОЧ не проводилось — (СО + СОР) × 2." }
        },
        {
            "@type": "Question",
            "name": "Что важнее для итоговой оценки — СОЧ или СОР?",
            "acceptedAnswer": { "@type": "Answer", "text": "СОЧ важнее — он составляет 50% итога. СОР и СО — по 25%. Один слабый СОЧ может снизить оценку за четверть на целый балл." }
        },
        {
            "@type": "Question",
            "name": "Какой процент соответствует оценке 5 за четверть?",
            "acceptedAnswer": { "@type": "Answer", "text": "85% и выше — оценка «5». 65–84% — «4». 40–64% — «3». Ниже 40% — «2»." }
        }
    ]
}
</script>
{% endblock %}""",

# ════════════════════════════════════════════════════════════════════════════
"metodika-rascheta-mon-rk.html": """\
{% block schema_extra %}
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Официальная методика расчёта оценок МОН РК",
    "description": "Критериальное оценивание в школах Казахстана: нормативная база, три вида суммативного оценивания, официальная формула итоговой оценки",
    "url": "https://bilimcalc.vercel.app/metodika-rascheta-mon-rk",
    "datePublished": "2025-09-01",
    "dateModified": "2026-02-01",
    "image": "https://bilimcalc.vercel.app/static/icons/preview.png",
    "inLanguage": "ru",
    "author": { "@type": "Person", "name": "Anton", "url": "https://github.com/antonbogdan165" },
    "publisher": { "@type": "Organization", "name": "BilimCalc", "logo": { "@type": "ImageObject", "url": "https://bilimcalc.vercel.app/static/icons/favicon-32x32.png" } },
    "mainEntityOfPage": { "@type": "WebPage", "@id": "https://bilimcalc.vercel.app/metodika-rascheta-mon-rk" }
}
</script>
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://bilimcalc.vercel.app/" },
        { "@type": "ListItem", "position": 2, "name": "Методика расчёта МОН РК", "item": "https://bilimcalc.vercel.app/metodika-rascheta-mon-rk" }
    ]
}
</script>
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "С какого класса применяется критериальное оценивание в Казахстане?",
            "acceptedAnswer": { "@type": "Answer", "text": "Критериальное оценивание по методике МОН РК применяется с начальных классов. К средней школе (5–11 класс) система используется в полном объёме по всем основным предметам." }
        },
        {
            "@type": "Question",
            "name": "Чем критериальное оценивание отличается от традиционного?",
            "acceptedAnswer": { "@type": "Answer", "text": "Результат сравнивается с заранее установленными критериями, а не с другими учениками. Итоговая оценка рассчитывается по формуле: СО × 25% + СОР × 25% + СОЧ × 50% — прозрачно и проверяемо." }
        },
        {
            "@type": "Question",
            "name": "Одинакова ли методика МОН для всех школ Казахстана?",
            "acceptedAnswer": { "@type": "Answer", "text": "Методика МОН РК обязательна для государственных школ. Большинство частных школ также её придерживаются, что обеспечивает единый стандарт по всей стране." }
        }
    ]
}
</script>
{% endblock %}""",

# ════════════════════════════════════════════════════════════════════════════
"kak-rasschitat-itogovuyu-otsenku-za-god.html": """\
{% block schema_extra %}
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Как рассчитать итоговую оценку за год в Казахстане",
    "description": "Формула 70/30 для 9 и 11 классов: годовая оценка × 70% + оценка за экзамен × 30%",
    "url": "https://bilimcalc.vercel.app/kak-rasschitat-itogovuyu-otsenku-za-god",
    "datePublished": "2026-03-01",
    "dateModified": "2026-03-01",
    "image": "https://bilimcalc.vercel.app/static/icons/preview.png",
    "inLanguage": "ru",
    "author": { "@type": "Person", "name": "Anton", "url": "https://github.com/antonbogdan165" },
    "publisher": { "@type": "Organization", "name": "BilimCalc", "logo": { "@type": "ImageObject", "url": "https://bilimcalc.vercel.app/static/icons/favicon-32x32.png" } },
    "mainEntityOfPage": { "@type": "WebPage", "@id": "https://bilimcalc.vercel.app/kak-rasschitat-itogovuyu-otsenku-za-god" }
}
</script>
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://bilimcalc.vercel.app/" },
        { "@type": "ListItem", "position": 2, "name": "Как рассчитать итоговую оценку за год", "item": "https://bilimcalc.vercel.app/kak-rasschitat-itogovuyu-otsenku-za-god" }
    ]
}
</script>
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Как рассчитать итоговую оценку за год — формула 70/30",
    "description": "Пошаговый расчёт итоговой оценки за год для 9 и 11 классов Казахстана по формуле МОН РК",
    "image": "https://bilimcalc.vercel.app/static/icons/preview.png",
    "totalTime": "PT3M",
    "step": [
        { "@type": "HowToStep", "position": 1, "name": "Рассчитайте годовую оценку", "text": "(Q1 + Q2 + Q3 + Q4) ÷ 4. Например: (4+3+4+5) ÷ 4 = 4,0." },
        { "@type": "HowToStep", "position": 2, "name": "Примените веса", "text": "Годовая × 0,70 + Экзамен × 0,30. Например: 4,0 × 0,70 + 4 × 0,30 = 2,80 + 1,20." },
        { "@type": "HowToStep", "position": 3, "name": "Округлите результат", "text": "Сложите компоненты: 2,80 + 1,20 = 4,00. Округление: дробная часть ≥ 0,5 → вверх. Итог: 4." }
    ]
}
</script>
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Как рассчитывается итоговая оценка за год в 9 и 11 классе Казахстана?",
            "acceptedAnswer": { "@type": "Answer", "text": "По формуле МОН РК: Итог = Годовая × 0,70 + Экзамен × 0,30. Годовая — среднее по четвертям. Результат округляется: ≥ 0,5 → вверх." }
        },
        {
            "@type": "Question",
            "name": "Что такое формула 70/30 в школах Казахстана?",
            "acceptedAnswer": { "@type": "Answer", "text": "Официальная методика МОН РК: 70% — годовая оценка (среднее за четверти), 30% — оценка за итоговый экзамен. Применяется в 9 и 11 классах." }
        },
        {
            "@type": "Question",
            "name": "Как рассчитать нужный балл на экзамене?",
            "acceptedAnswer": { "@type": "Answer", "text": "Нужный балл = (желаемый итог − годовая × 0,7) ÷ 0,3. Например, при годовой 4,0 для итоговой «5»: (4,5 − 2,8) ÷ 0,3 = 5,67 — недостижимо, «5» закрыта." }
        },
        {
            "@type": "Question",
            "name": "Чем отличается годовая оценка от итоговой за год?",
            "acceptedAnswer": { "@type": "Answer", "text": "Годовая — среднее за четыре четверти. Итоговая — результат формулы 70/30, включающий и годовую, и экзамен. В аттестат идёт именно итоговая." }
        }
    ]
}
</script>
{% endblock %}""",

# ════════════════════════════════════════════════════════════════════════════
"articles.html": """\
{% block schema_extra %}
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://bilimcalc.vercel.app/" },
        { "@type": "ListItem", "position": 2, "name": "Статьи", "item": "https://bilimcalc.vercel.app/articles" }
    ]
}
</script>
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Статьи о системе оценивания в школах Казахстана",
    "description": "Подробные руководства по расчёту СО, СОР, СОЧ и итоговых оценок по методике МОН РК",
    "url": "https://bilimcalc.vercel.app/articles",
    "numberOfItems": 7,
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "url": "https://bilimcalc.vercel.app/kak-rasschitat-itogovuyu-otsenku-za-god", "name": "Итоговая оценка за год: формула 70/30" },
        { "@type": "ListItem", "position": 2, "url": "https://bilimcalc.vercel.app/itogovaya-ocenka-za-chetvert", "name": "Итоговая оценка за четверть" },
        { "@type": "ListItem", "position": 3, "url": "https://bilimcalc.vercel.app/kak-rasschitat-soch", "name": "Как рассчитать СОЧ" },
        { "@type": "ListItem", "position": 4, "url": "https://bilimcalc.vercel.app/kak-rasschitat-sor", "name": "Как рассчитать СОР" },
        { "@type": "ListItem", "position": 5, "url": "https://bilimcalc.vercel.app/kak-rasschitat-so", "name": "Как рассчитать СО" },
        { "@type": "ListItem", "position": 6, "url": "https://bilimcalc.vercel.app/metodika-rascheta-mon-rk", "name": "Методика расчёта МОН РК" },
        { "@type": "ListItem", "position": 7, "url": "https://bilimcalc.vercel.app/kak-perevesti-procenty-v-otsenku", "name": "Как перевести проценты в оценку" }
    ]
}
</script>
{% endblock %}""",

}  # end PATCHES


SITEMAP_NEW = """\
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://bilimcalc.vercel.app/</loc><lastmod>2026-03-07</lastmod><changefreq>monthly</changefreq><priority>1.0</priority></url>
  <url><loc>https://bilimcalc.vercel.app/kalkulator-ekzamena</loc><lastmod>2026-03-07</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>https://bilimcalc.vercel.app/articles</loc><lastmod>2026-03-07</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://bilimcalc.vercel.app/kak-rasschitat-itogovuyu-otsenku-za-god</loc><lastmod>2026-03-01</lastmod><changefreq>yearly</changefreq><priority>0.9</priority></url>
  <url><loc>https://bilimcalc.vercel.app/kak-perevesti-procenty-v-otsenku</loc><lastmod>2026-03-07</lastmod><changefreq>yearly</changefreq><priority>0.8</priority></url>
  <url><loc>https://bilimcalc.vercel.app/itogovaya-ocenka-za-chetvert</loc><lastmod>2026-02-01</lastmod><changefreq>yearly</changefreq><priority>0.8</priority></url>
  <url><loc>https://bilimcalc.vercel.app/kak-rasschitat-soch</loc><lastmod>2026-02-01</lastmod><changefreq>yearly</changefreq><priority>0.8</priority></url>
  <url><loc>https://bilimcalc.vercel.app/kak-rasschitat-sor</loc><lastmod>2026-02-01</lastmod><changefreq>yearly</changefreq><priority>0.8</priority></url>
  <url><loc>https://bilimcalc.vercel.app/kak-rasschitat-so</loc><lastmod>2026-02-01</lastmod><changefreq>yearly</changefreq><priority>0.8</priority></url>
  <url><loc>https://bilimcalc.vercel.app/metodika-rascheta-mon-rk</loc><lastmod>2026-02-01</lastmod><changefreq>yearly</changefreq><priority>0.7</priority></url>
</urlset>
"""


# ─── Применяем патчи ─────────────────────────────────────────────────────────

BLOCK_RE = re.compile(
    r"\{%[-\s]* block schema_extra [-\s]*%\}.*?\{%[-\s]* endblock [-\s]*%\}",
    re.DOTALL
)

ok = 0
skip = 0

for fname, new_block in PATCHES.items():
    path = os.path.join(TEMPLATES_DIR, fname)
    if not os.path.exists(path):
        print(f"⚠  НЕ НАЙДЕН: {path}")
        skip += 1
        continue

    with open(path, "r", encoding="utf-8") as f:
        src = f.read()

    if BACKUP:
        shutil.copy2(path, path + ".bak")

    if BLOCK_RE.search(src):
        new_src = BLOCK_RE.sub(new_block, src)
    else:
        # блока нет — добавляем перед {% block content %}
        new_src = src.replace("{% block content %}", new_block + "\n{% block content %}", 1)

    with open(path, "w", encoding="utf-8") as f:
        f.write(new_src)

    print(f"✓ {fname}")
    ok += 1

# Обновляем sitemap
smap_path = os.path.join(STATIC_DIR, "sitemap.xml")
if BACKUP and os.path.exists(smap_path):
    shutil.copy2(smap_path, smap_path + ".bak")
with open(smap_path, "w", encoding="utf-8") as f:
    f.write(SITEMAP_NEW)
print("✓ static/sitemap.xml")

print(f"\nГотово: обновлено {ok} шаблонов, пропущено {skip}.")
print("Резервные копии сохранены с суффиксом .bak")
