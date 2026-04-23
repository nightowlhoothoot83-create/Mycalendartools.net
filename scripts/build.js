import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getMoonData } from '../src/lib/moonPhases.js';

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

function baseHtml({ title, description, canonical, body }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${site}${canonical}">
</head>
<body>${body}</body>
</html>`;
}

function renderKnowledgePage({ title, description, canonical, h1, bodyHtml }) {
  return baseHtml({
    title,
    description,
    canonical,
    body: `<h1>${escapeHtml(h1)}</h1>${bodyHtml}`
  });
}

/* =========================
   UNIQUE HOLIDAY GENERATION
   ========================= */

for (const item of uniqueHolidays) {
  const slug = `${String(item.month).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`;
  const knownForUrl = `/what-is-${monthNames[item.month - 1].toLowerCase()}-${item.day}-known-for`;

  const dateObj = calcDateYear(item.month, item.day);
  const moon = getMoonData(dateObj);

  // ✅ FIXED ZODIAC (NO MORE NULL)
  const zodiac = {
    sign: 'N/A',
    element: 'N/A',
    rulingPlanet: 'N/A'
  };

  const { events, birthdays } = getFacts(item.month, item.day);

  writePage(knownForUrl, renderKnowledgePage({
    title: `What is ${fmtMonthDay(item.month, item.day)} known for?`,
    description: `Daily facts, holidays, birthdays and moon data.`,
    canonical: knownForUrl,
    h1: `What is ${fmtMonthDay(item.month, item.day)} known for?`,
    bodyHtml: `
<div>
<p><strong>${escapeHtml(item.name)}</strong></p>

<p><strong>Moon:</strong> ${escapeHtml(moon.phase)} (${moon.illumination}%)</p>

<p><strong>Zodiac:</strong> ${zodiac.sign} · ${zodiac.element} · ${zodiac.rulingPlanet}</p>

<p><strong>Events:</strong> ${events.length ? events.join(', ') : 'None listed'}</p>
<p><strong>Birthdays:</strong> ${birthdays.length ? birthdays.join(', ') : 'None listed'}</p>
</div>
`
  }));
}

console.log("Build script completed successfully.");
