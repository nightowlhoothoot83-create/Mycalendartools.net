const SIGNS = [
  { sign:'Capricorn', start:[12,22], end:[1,19], element:'Earth', planet:'Saturn', luckyNumbers:[4,8,13], luckyColors:['Charcoal','Forest Green'], luckyStones:['Garnet'], luckyFlowers:['Carnation'], compatibility:['Taurus','Virgo'] },
  { sign:'Aquarius', start:[1,20], end:[2,18], element:'Air', planet:'Uranus', luckyNumbers:[7,11,22], luckyColors:['Electric Blue','Silver'], luckyStones:['Amethyst'], luckyFlowers:['Orchid'], compatibility:['Gemini','Libra'] },
  { sign:'Pisces', start:[2,19], end:[3,20], element:'Water', planet:'Neptune', luckyNumbers:[3,9,12], luckyColors:['Sea Green','Lavender'], luckyStones:['Aquamarine'], luckyFlowers:['Water Lily'], compatibility:['Cancer','Scorpio'] },
  { sign:'Aries', start:[3,21], end:[4,19], element:'Fire', planet:'Mars', luckyNumbers:[1,9,17], luckyColors:['Red','Crimson'], luckyStones:['Diamond'], luckyFlowers:['Honeysuckle'], compatibility:['Leo','Sagittarius'] },
  { sign:'Taurus', start:[4,20], end:[5,20], element:'Earth', planet:'Venus', luckyNumbers:[2,6,15], luckyColors:['Emerald','Rose'], luckyStones:['Emerald'], luckyFlowers:['Poppy'], compatibility:['Capricorn','Virgo'] },
  { sign:'Gemini', start:[5,21], end:[6,20], element:'Air', planet:'Mercury', luckyNumbers:[5,14,23], luckyColors:['Yellow','Sky Blue'], luckyStones:['Agate'], luckyFlowers:['Lavender'], compatibility:['Aquarius','Libra'] },
  { sign:'Cancer', start:[6,21], end:[7,22], element:'Water', planet:'Moon', luckyNumbers:[2,7,16], luckyColors:['Silver','Pearl'], luckyStones:['Moonstone'], luckyFlowers:['White Rose'], compatibility:['Pisces','Scorpio'] },
  { sign:'Leo', start:[7,23], end:[8,22], element:'Fire', planet:'Sun', luckyNumbers:[1,10,19], luckyColors:['Gold','Orange'], luckyStones:['Ruby'], luckyFlowers:['Sunflower'], compatibility:['Aries','Sagittarius'] },
  { sign:'Virgo', start:[8,23], end:[9,22], element:'Earth', planet:'Mercury', luckyNumbers:[5,14,24], luckyColors:['Olive','Beige'], luckyStones:['Peridot'], luckyFlowers:['Buttercup'], compatibility:['Taurus','Capricorn'] },
  { sign:'Libra', start:[9,23], end:[10,22], element:'Air', planet:'Venus', luckyNumbers:[6,15,24], luckyColors:['Blush','Blue'], luckyStones:['Opal'], luckyFlowers:['Rose'], compatibility:['Gemini','Aquarius'] },
  { sign:'Scorpio', start:[10,23], end:[11,21], element:'Water', planet:'Pluto', luckyNumbers:[9,18,27], luckyColors:['Maroon','Black'], luckyStones:['Topaz'], luckyFlowers:['Geranium'], compatibility:['Cancer','Pisces'] },
  { sign:'Sagittarius', start:[11,22], end:[12,21], element:'Fire', planet:'Jupiter', luckyNumbers:[3,12,21], luckyColors:['Purple','Indigo'], luckyStones:['Turquoise'], luckyFlowers:['Narcissus'], compatibility:['Aries','Leo'] },
];

export function getZodiac(input = new Date()){
  const date = new Date(input);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return SIGNS.find(({start,end}) => {
    const [sm, sd] = start;
    const [em, ed] = end;
    if (sm <= em) return (month > sm || (month === sm && day >= sd)) && (month < em || (month === em && day <= ed));
    return (month > sm || (month === sm && day >= sd)) || (month < em || (month === em && day <= ed));
  }) || SIGNS[0];
}

export function getHoroscope(sign){
  const ideas = {
    Aries:'Push the important task forward before lunch. Momentum is your superpower today.',
    Taurus:'A slower, steadier pace wins. Protect your time and keep the plan simple.',
    Gemini:'Conversations open doors today. Ask the follow-up question instead of guessing.',
    Cancer:'Home, family, and comfort matter. A small reset clears mental clutter.',
    Leo:'Be visible in a useful way. Confident but practical beats dramatic.',
    Virgo:'A tidy list solves more than a perfect plan. Ship the next helpful thing.',
    Libra:'Choose balance over delay. One firm decision will remove the drag.',
    Scorpio:'Your instincts are sharp. Use them with evidence, not just emotion.',
    Sagittarius:'A bigger idea wants structure. Turn inspiration into one concrete move.',
    Capricorn:'Consistency wins. The quiet work you do today compounds fast.',
    Aquarius:'Your unusual angle is useful. Share it clearly and keep it grounded.',
    Pisces:'Rest and creativity work together. Protect your energy and trust your taste.'
  };
  return ideas[sign] || 'Today is good for practical momentum, a clear list, and one strong decision.';
}

export { SIGNS };
