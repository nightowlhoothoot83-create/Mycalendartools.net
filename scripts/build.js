import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getMoonData } from '../src/lib/moonPhases.js';
import zodiac = null;
import '../scripts/generateCalendarICS.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const loadJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const holidays = loadJson('src/data/holidays.json');
const uniqueHolidays = loadJson('src/data/uniqueHolidays.json');
const historicalEvents = loadJson('src/data/historicalEvents.json');
const celebrityBirthdays = loadJson('src/data/celebrityBirthdays.json');
const featuredCountdowns = loadJson('src/data/featuredCountdowns.json');

const dist = path.join(root, 'dist');
if (!fs.existsSync(dist)) {
  console.error('dist directory not found. Run astro build first.');
  process.exit(1);
}

const site = 'https://www.mycalendartools.net';
const pages = new Set();
const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function pushPage(url) { pages.add(url === '/index' ? '/' : url); }
function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function writePage(url, html) {
  const cleanUrl = url === '/' ? '' : url.replace(/^\//, '');
  const folder = cleanUrl ? path.join(dist, cleanUrl) : dist;
  ensureDir(folder);
  fs.writeFileSync(path.join(folder, 'index.html'), html);
  pushPage(url);
}
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name === 'index.html') {
      const rel = path.relative(dist, path.dirname(full)).split(path.sep).join('/');
      pushPage(rel ? `/${rel}` : '/');
    }
  }
}
walk(dist);

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function slugify(str = '') {
  return String(str).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
function fmtMonthDay(month, day) { return `${monthNames[month - 1]} ${day}`; }
function getFacts(month, day) {
  const holiday = uniqueHolidays.find((item) => item.month === month && item.day === day) || null;
  const events = historicalEvents.find((item) => item.month === month && item.day === day)?.events || [];
  const birthdays = celebrityBirthdays.find((item) => item.month === month && item.day === day)?.people || [];
  return { holiday, events, birthdays };
}
function calcDateYear(month, day) {
  const date = new Date(Date.UTC(2026, month - 1, day));
  return Number.isNaN(date.getTime()) ? new Date(Date.UTC(2026, 0, 1)) : date;
}
function baseHtml({ title, description, canonical, body, schema = null }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${site}${canonical}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${site}${canonical}">
  <meta property="og:site_name" content="MyCalendarTools">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/styles.css">
  ${schema ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>` : ''}
</head>
<body class="generated-page">
  <main class="generated-wrap">${body}</main>
</body>
</html>`;
}
function relatedLinks(items) {
  return `<div class="related-links">${items.map((item) => `<a href="${item.href}">${escapeHtml(item.label)}</a>`).join('')}</div>`;
}
function renderKnowledgePage({ title, description, canonical, eyebrow, h1, lede, bodyHtml, links, schemaType = 'WebPage' }) {
  return baseHtml({
    title,
    description,
    canonical,
    schema: { '@context': 'https://schema.org', '@type': schemaType, name: title, description, url: `${site}${canonical}` },
    body: `<div class="breadcrumbs"><a href="/">Home</a> / ${eyebrow}</div><h1>${escapeHtml(h1)}</h1><p class="lede">${escapeHtml(lede)}</p>${bodyHtml}${relatedLinks(links)}`
  });
}

for (const [year, countries] of Object.entries(holidays.years)) {
  for (const [countrySlug, country] of Object.entries(countries)) {
    for (const [regionSlug, region] of Object.entries(country.regions)) {
      const regionYearUrl = `/school-holidays/generated/${countrySlug}/${regionSlug}/${year}`;
      const rows = region.breaks.map((item) => {
        const breakSlug = slugify(item.name);
        const detailUrl = `${regionYearUrl}/${breakSlug}`;
        writePage(detailUrl, renderKnowledgePage({
          title: `${item.name} ${year} — ${region.name}, ${country.name} | MyCalendarTools`,
          description: `${item.name} dates for ${region.name}, ${country.name} in ${year}, including start date, end date, holiday length, and planning notes.`,
          canonical: detailUrl,
          eyebrow: `<a href="/school-holidays">School Holidays</a> / <a href="/school-holidays/${countrySlug}">${escapeHtml(country.name)}</a> / <span>${escapeHtml(item.name)}</span>`,
          h1: `${item.name} ${year}`,
          lede: `${region.name}, ${country.name}`,
          bodyHtml: `<div class="generated-card"><p>${escapeHtml(item.description)}</p><p><strong>Start:</strong> ${escapeHtml(item.start)}<br><strong>End:</strong> ${escapeHtml(item.end)}<br><strong>Length:</strong> ${escapeHtml(item.days)} days</p><p>Use this page to compare school break timing, travel windows, and school return periods. For final bookings, confirm against the official authority calendar for your region.</p></div><div class="generated-card"><h2>Why this page helps</h2><p>This dedicated break page is easier to bookmark and share than a full-year table. It is designed for families planning annual leave, travel, and childcare around real school break patterns.</p></div>`,
          links: [
            { href: regionYearUrl, label: `Open ${region.name} ${year} planning page` },
            { href: `/countdown/${item.start}`, label: `Countdown to ${item.name}` },
            { href: '/between', label: 'Count days between dates' },
            { href: '/year-at-glance', label: 'Open year-at-a-glance' }
          ]
        }));
        return `<tr><td><a href="${detailUrl}">${escapeHtml(item.name)}</a></td><td>${escapeHtml(item.start)}</td><td>${escapeHtml(item.end)}</td><td>${escapeHtml(item.days)}</td></tr>`;
      }).join('');
      writePage(regionYearUrl, renderKnowledgePage({
        title: `${country.name} ${region.name} school holidays ${year} | MyCalendarTools`,
        description: `${year} school holiday planning page for ${region.name}, ${country.name} with direct links to each break period.`,
        canonical: regionYearUrl,
        eyebrow: `<a href="/school-holidays">School Holidays</a> / <a href="/school-holidays/${countrySlug}">${escapeHtml(country.name)}</a> / <span>${escapeHtml(region.name)} ${year}</span>`,
        h1: `${country.name} — ${region.name} school holidays ${year}`,
        lede: `Planning-friendly school holiday calendar page with cleaner break-by-break navigation.`,
        bodyHtml: `<div class="generated-card table-wrap"><table><thead><tr><th>Break</th><th>Start</th><th>End</th><th>Days</th></tr></thead><tbody>${rows}</tbody></table></div><div class="generated-card"><h2>Planning notes</h2><p>These generated region-year pages are designed to rank for highly specific searches while giving parents a clearer booking and school return workflow than a single overstuffed table.</p></div>`,
        links: [
          { href: `/school-holidays/${countrySlug}`, label: `Back to ${country.name}` },
          { href: '/year-at-glance', label: 'Compare all countries and years' },
          { href: '/weeks', label: 'Calculate weeks between dates' },
          { href: '/countdowns', label: 'Open featured countdowns' }
        ]
      }));
    }
  }
}

for (const item of uniqueHolidays) {
  const slug = `${String(item.month).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`;
  const holidayUrl = `/unique-holidays/${slug}`;
  const knownForUrl = `/what-is-${monthNames[item.month - 1].toLowerCase()}-${item.day}-known-for`;
  const dateObj = calcDateYear(item.month, item.day);
  const moon = getMoonData(dateObj);
  const zodiac = null;
  const { events, birthdays } = getFacts(item.month, item.day);
  writePage(holidayUrl, renderKnowledgePage({
    title: `${item.name} | MyCalendarTools`,
    description: `${item.name} lands on ${fmtMonthDay(item.month, item.day)}. Discover what makes this date stand out, plus related date tools and fun planning ideas.`,
    canonical: holidayUrl,
    eyebrow: `<a href="/unique-holidays">Unique Holidays</a> / <span>${escapeHtml(item.name)}</span>`,
    h1: item.name,
    lede: `${fmtMonthDay(item.month, item.day)}`,
    bodyHtml: `<div class="generated-card"><p>${escapeHtml(item.description)}</p><p>This holiday page is part of the MyCalendarTools archive, built for daily return traffic, social sharing, and searchable date discovery beyond the usual calendar basics.</p></div><div class="generated-card"><h2>Why people search this date</h2><p>Dates like this often pull interest from parents, social media planners, classrooms, bloggers, and anyone looking for a fun or memorable talking point for the day.</p></div>`,
    links: [
      { href: knownForUrl, label: `What is ${fmtMonthDay(item.month, item.day)} known for?` },
      { href: '/moon-phase', label: 'Check moon phase for any date' },
      { href: '/zodiac', label: 'Open zodiac profile tool' },
      { href: '/between', label: 'Count days to this holiday' }
    ]
  }));
  writePage(knownForUrl, renderKnowledgePage({
    title: `What is ${fmtMonthDay(item.month, item.day)} known for? | MyCalendarTools`,
    description: `See what ${fmtMonthDay(item.month, item.day)} is known for, including unique holidays, historical events, celebrity birthdays, moon phase, and zodiac details.`,
    canonical: knownForUrl,
    eyebrow: `<a href="/special-dates">Special Dates</a> / <span>${fmtMonthDay(item.month, item.day)}</span>`,
    h1: `What is ${fmtMonthDay(item.month, item.day)} known for?`,
    lede: `A quick answer page covering holidays, history, birthdays, moon phase, and zodiac details for this date.`,
    bodyHtml: `<div class="generated-card"><h2>Today's standout holiday</h2><p><strong>${escapeHtml(item.name)}</strong> is the featured holiday for this date.</p><p>${escapeHtml(item.description)}</p></div><div class="generated-card"><h2>Historical notes</h2>${events.length ? `<ul class="list">${events.map((event) => `<li>${escapeHtml(event)}</li>`).join('')}</ul>` : '<p>This date is still useful for planning and themed content even when no historical event is featured in the current archive.</p>'}</div><div class="generated-card"><h2>Celebrity birthdays</h2>${birthdays.length ? `<p>${birthdays.map(escapeHtml).join(', ')}</p>` : '<p>There are no featured celebrity birthdays in the current archive for this date yet.</p>'}<p><strong>Moon phase:</strong> ${escapeHtml(moon.phase)} · ${moon.illumination}% illumination<br><strong>Zodiac:</strong> ${escapeHtml(zodiac.sign)} · ${escapeHtml(zodiac.element)} · ruled by ${escapeHtml(zodiac.rulingPlanet)}</p></div>`,
    links: [
      { href: holidayUrl, label: `Open ${item.name} holiday page` },
      { href: `/countdown/${dateObj.toISOString().slice(0, 10)}`, label: `Countdown to ${fmtMonthDay(item.month, item.day)}` },
      { href: '/school-holidays', label: 'Browse school holiday pages' },
      { href: '/countdowns', label: 'Explore featured countdowns' }
    ]
  }));
}

for (const item of featuredCountdowns) {
  const eventUrl = `/how-many-days-until-${slugify(item.slug || item.name)}`;
  writePage(eventUrl, renderKnowledgePage({
    title: `How many days until ${item.name}? | MyCalendarTools`,
    description: `Live countdown page for ${item.name}, including the exact date, why people search it, and quick links to related planning tools.`,
    canonical: eventUrl,
    eyebrow: `<a href="/countdowns">Countdowns</a> / <span>${escapeHtml(item.name)}</span>`,
    h1: `How many days until ${item.name}?`,
    lede: `${item.date} · ${item.type}`,
    bodyHtml: `<div class="generated-card"><p>${escapeHtml(item.description)}</p><p>This countdown hub makes it easier to jump from the search query to the live timer, nearby planning tools, and related date pages without extra clicks.</p><p><a href="/countdown/${item.date}">Open the live countdown timer →</a></p></div><div class="generated-card"><h2>Why this page exists</h2><p>People search “how many days until ${escapeHtml(item.name)}” because they are planning travel, school breaks, celebrations, campaigns, or reminders. This page is designed to be simple, fast, and easy to share.</p></div>`,
    links: [
      { href: `/countdown/${item.date}`, label: `Live countdown to ${item.name}` },
      { href: '/between', label: 'Count exact days between dates' },
      { href: '/year-at-glance', label: 'Open year-at-a-glance planner' },
      { href: '/countdowns', label: 'Browse more featured countdowns' }
    ]
  }));
}

writePage('/special-dates', renderKnowledgePage({
  title: 'Special Dates, Daily Meaning Pages & Date Ideas | MyCalendarTools',
  description: 'Browse date-meaning pages, featured countdowns, unique holidays, and other search-friendly date ideas from MyCalendarTools.',
  canonical: '/special-dates',
  eyebrow: '<span>Special Dates</span>',
  h1: 'Special dates and daily meaning pages',
  lede: 'This landing page ties together the most shareable, searchable, and repeat-use parts of MyCalendarTools.',
  bodyHtml: `<div class="generated-card grid-landing"><a class="landing-link" href="/countdowns"><strong>Featured countdowns</strong><span>High-intent countdown pages for Christmas, New Year, Easter, Halloween, and more.</span></a><a class="landing-link" href="/unique-holidays/01-01"><strong>Unique holidays archive</strong><span>Daily holiday pages built for social sharing and long-tail search discovery.</span></a><a class="landing-link" href="/what-is-january-1-known-for"><strong>What is this date known for?</strong><span>Daily meaning pages with holidays, facts, birthdays, moon phase, and zodiac context.</span></a><a class="landing-link" href="/school-holidays"><strong>School holidays</strong><span>Three-year planning pages by country and region.</span></a></div>`,
  links: [
    { href: '/countdowns', label: 'Open featured countdowns' },
    { href: '/school-holidays', label: 'Browse school holiday pages' },
    { href: '/moon-phase', label: 'Check moon phase for any date' },
    { href: '/zodiac', label: 'Explore zodiac profiles' }
  ]
}));

const xmlPages = Array.from(pages).sort();
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlPages.map((page) => `  <url><loc>${site}${page === '/' ? '' : page}</loc></url>`).join('\n')}\n</urlset>`;
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemapXml);
const htmlSitemap = baseHtml({ title: 'Generated Sitemap | MyCalendarTools', description: 'Human-readable generated sitemap for QA and crawl checks.', canonical: '/generated-sitemap.html', body: `<h1>Generated page sitemap</h1><p class="lede">A human-readable list of generated URLs to help with QA and crawl checks after deployment.</p><div class="generated-card"><ul class="list">${xmlPages.map((page) => `<li><a href="${page}">${page}</a></li>`).join('')}</ul></div>` });
fs.writeFileSync(path.join(dist, 'generated-sitemap.html'), htmlSitemap);
console.log(`Generated sitemap.xml with ${xmlPages.length} URLs.`);
