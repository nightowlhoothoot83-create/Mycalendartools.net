import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const holidays = JSON.parse(fs.readFileSync(path.join(root, 'src/data/holidays.json'), 'utf8'));
const outDir = path.join(root, 'public', 'generated-calendars');
fs.mkdirSync(outDir, { recursive: true });
const index = [];

function toIcsDate(str) { return str.replace(/-/g, ''); }

for (const [year, countries] of Object.entries(holidays.years)) {
  for (const [countrySlug, country] of Object.entries(countries)) {
    for (const [regionSlug, region] of Object.entries(country.regions)) {
      const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//MyCalendarTools//School Holidays//EN'];
      region.breaks.forEach((item, i) => {
        lines.push('BEGIN:VEVENT');
        lines.push(`UID:${countrySlug}-${regionSlug}-${year}-${i}@mycalendartools.net`);
        lines.push(`DTSTAMP:${toIcsDate(year + '-01-01')}T000000Z`);
        lines.push(`DTSTART;VALUE=DATE:${toIcsDate(item.start)}`);
        lines.push(`DTEND;VALUE=DATE:${toIcsDate(item.end)}`);
        lines.push(`SUMMARY:${item.name} — ${region.name}`);
        lines.push(`DESCRIPTION:${item.description}`);
        lines.push('END:VEVENT');
      });
      lines.push('END:VCALENDAR');
      const filename = `${countrySlug}-${regionSlug}-${year}.ics`;
      fs.writeFileSync(path.join(outDir, filename), lines.join('\n'));
      index.push({ year, country: country.name, countrySlug, region: region.name, regionSlug, file: `/generated-calendars/${filename}` });
    }
  }
}

fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(index, null, 2));
console.log(`Generated ${index.length} ICS files.`);
