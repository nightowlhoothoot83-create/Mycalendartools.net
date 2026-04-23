export const MOON_PHASES = [
  'New Moon','Waxing Crescent','First Quarter','Waxing Gibbous',
  'Full Moon','Waning Gibbous','Last Quarter','Waning Crescent'
];

export function getMoonData(inputDate = new Date()) {
  const date = new Date(inputDate);
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const synodicMonth = 29.53058867;
  const daysSince = (date.getTime() - knownNewMoon.getTime()) / 86400000;
  const cycle = ((daysSince % synodicMonth) + synodicMonth) % synodicMonth;
  const phaseIndex = Math.floor((cycle / synodicMonth) * 8) % 8;
  const illumination = Math.round((1 - Math.cos((2 * Math.PI * cycle) / synodicMonth)) * 50);
  const nextFullMoonDays = ((synodicMonth / 2) - cycle + synodicMonth) % synodicMonth;
  const sunriseBase = 18.6 + Math.sin((date.getMonth()+1)/12 * Math.PI*2) * 1.8;
  const moonriseHour = (sunriseBase + cycle / synodicMonth * 24) % 24;
  const moonsetHour = (moonriseHour + 12.3) % 24;
  return {
    phase: MOON_PHASES[phaseIndex],
    illumination,
    cycleDay: Number(cycle.toFixed(2)),
    moonrise: decimalHourToString(moonriseHour),
    moonset: decimalHourToString(moonsetHour),
    nextFullMoonDays: Number(nextFullMoonDays.toFixed(1)),
    isGoodForStargazing: cycle < 2 || cycle > 27,
    isGoodForPhotography: Math.abs(cycle - synodicMonth / 2) < 2,
    phaseIndex
  };
}

export function decimalHourToString(value) {
  const hours = Math.floor(value);
  const minutes = Math.round((value - hours) * 60);
  const safeHours = ((hours % 24) + 24) % 24;
  return `${String(safeHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
