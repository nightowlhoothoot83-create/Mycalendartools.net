
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const load = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const uniqueHolidays = load('src/data/uniqueHolidays.json');
const holidays = load('src/data/holidays.json');
const historicalEvents = load('src/data/historicalEvents.json');
const celebrityBirthdays = load('src/data/celebrityBirthdays.json');
const funFacts = load('src/data/funFacts.json');

function assert(condition, message) {
  if (!condition) {
    console.error(`✗ ${message}`);
    process.exit(1);
  }
}

assert(Array.isArray(uniqueHolidays) && uniqueHolidays.length >= 200, 'uniqueHolidays.json needs at least 200 entries');
assert(Array.isArray(historicalEvents) && historicalEvents.length >= 20, 'historicalEvents.json needs at least 20 entries');
assert(Array.isArray(celebrityBirthdays) && celebrityBirthdays.length >= 20, 'celebrityBirthdays.json needs at least 20 entries');
assert(Array.isArray(funFacts) && funFacts.length >= 20, 'funFacts.json needs at least 20 entries');
assert(holidays.years && holidays.years['2025'] && holidays.years['2026'] && holidays.years['2027'], 'holidays.json must include 2025, 2026, and 2027');

for (const year of ['2025', '2026', '2027']) {
  const countries = holidays.years[year];
  assert(Object.keys(countries).length >= 12, `${year} must include at least 12 countries`);
  for (const [countrySlug, country] of Object.entries(countries)) {
    assert(country.name, `${year}/${countrySlug} missing name`);
    assert(country.regions && Object.keys(country.regions).length >= 1, `${year}/${countrySlug} missing regions`);
    for (const [regionSlug, region] of Object.entries(country.regions)) {
      assert(region.name, `${year}/${countrySlug}/${regionSlug} missing region name`);
      assert(Array.isArray(region.breaks) && region.breaks.length >= 1, `${year}/${countrySlug}/${regionSlug} missing breaks`);
      for (const item of region.breaks) {
        assert(item.name && item.start && item.end && item.days, `${year}/${countrySlug}/${regionSlug} has incomplete break item`);
      }
    }
  }
}

console.log('✓ Data validation passed');
