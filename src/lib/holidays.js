import uniqueHolidays from '../data/uniqueHolidays.json';
import historicalEvents from '../data/historicalEvents.json';
import celebrityBirthdays from '../data/celebrityBirthdays.json';
import holidays from '../data/holidays.json';

export function getHolidayForDate(input = new Date()){
  const date = new Date(input);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return uniqueHolidays.find((item) => item.month === month && item.day === day);
}
export function getTomorrowHoliday(input = new Date()){
  const date = new Date(input);
  date.setDate(date.getDate() + 1);
  return getHolidayForDate(date);
}
export function getEventsForDate(input = new Date()){
  const date = new Date(input);
  return historicalEvents.find((item)=> item.month === date.getMonth() + 1 && item.day === date.getDate())?.events || [];
}
export function getBirthdaysForDate(input = new Date()){
  const date = new Date(input);
  return celebrityBirthdays.find((item)=> item.month === date.getMonth() + 1 && item.day === date.getDate())?.people || [];
}
export function getSchoolHolidayData(year, country){
  return holidays.years[String(year)]?.[country] || null;
}
export function flattenSchoolHolidayPages(){
  const pages = [];
  Object.entries(holidays.years).forEach(([year, countries]) => {
    Object.entries(countries).forEach(([countrySlug, country]) => {
      Object.entries(country.regions).forEach(([regionSlug, region]) => {
        pages.push({ year, countrySlug, countryName: country.name, regionSlug, regionName: region.name, breaks: region.breaks });
      });
    });
  });
  return pages;
}
export { uniqueHolidays, historicalEvents, celebrityBirthdays, holidays };
