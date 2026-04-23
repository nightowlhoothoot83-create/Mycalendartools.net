import { getMoonData } from '../../lib/moonPhases.js';
import { getZodiac, getHoroscope } from '../../lib/zodiac.js';
import { getHolidayForDate, getTomorrowHoliday, getEventsForDate, getBirthdaysForDate } from '../../lib/holidays.js';

export async function GET() {
  const now = new Date();
  const payload = {
    date: now.toISOString().slice(0,10),
    time: now.toLocaleTimeString('en-AU'),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    weekNumber: getIsoWeek(now),
    moonPhase: getMoonData(now),
    zodiac: { ...getZodiac(now), horoscope: getHoroscope(getZodiac(now).sign) },
    uniqueHoliday: getHolidayForDate(now),
    tomorrowHoliday: getTomorrowHoliday(now),
    historicalEvents: getEventsForDate(now),
    celebrityBirthdays: getBirthdaysForDate(now)
  };
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Window': 'day'
    }
  });
}

function getIsoWeek(date){
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
