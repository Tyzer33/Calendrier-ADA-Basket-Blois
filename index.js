const axios = require('axios');
const cheerio = require('cheerio');
const { ICalCalendar } = require('ical-generator');
const fs = require('fs');

async function fetchUrl(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

async function main() {
  const url = 'https://ada-basket.com/equipe-pro/calendrier/';

  const html = await fetchUrl(url);

  if (!html) return;

  const $ = cheerio.load(html);

  const cal = new ICalCalendar(
    {
      name: 'Ada Blois Basket',
      url: 'https://ada-basket.com/equipe-pro/calendrier/',
    },
    'Europe/Paris'
  );

  const MONTHS = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];

  $('.match-card').each((index, element) => {
    const day = $(element).find('.date .day').text().trim();
    const month = $(element).find('.date .month').text().trim();
    const time = $(element).find('.info .hour p').text().trim();
    const homeTeam = $(element).find('.homeTeam').text().trim();
    const awayTeam = $(element).find('.awayTeam').text().trim();
    const score = $(element).find('p.score').text().trim();

    const [hour, minute] = time.split(':');
    const year = ['Aou', 'Sep', 'Oct', 'Nov', 'Dec'].includes(month) ? 2025 : 2026;
    const monthIndex = MONTHS.indexOf(month); // 0-based pour JS Date
    const startDate = new Date(year, monthIndex, parseInt(day), parseInt(hour), parseInt(minute));

    cal.createEvent({
      start: startDate,
      end: new Date(startDate.getTime() + 2 * 60 * 60 * 1000), // +2h
      summary: `${homeTeam} - ${awayTeam} ${score !== '' ? `(${score})` : ''}`,
      url: 'https://ada-basket.com/equipe-pro/calendrier/',
      timezone: 'Europe/Paris',
    });
  });

  fs.writeFileSync('public/calendrier.ics', cal.toString());
  console.log('calendrier.ics généré avec ical-generator !');
}

main();
