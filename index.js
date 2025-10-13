const axios = require('axios');
const cheerio = require('cheerio');
const { createEvents } = require('ics');
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

  if (html) {
    $ = cheerio.load(html);
    let games = [];

    $('.match-card').each((index, element) => {
      const day = $(element).find('.date .day').text().trim();
      const month = $(element).find('.date .month').text().trim();
      const time = $(element).find('.info .hour p').text().trim();
      const homeTeam = $(element).find('.homeTeam').text().trim();
      const awayTeam = $(element).find('.awayTeam').text().trim();
      const score = $(element).find('p.score').text().trim();

      const MONTHS = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];

      const [hour, minute] = time.split(':');

      const date = {
        year: ['Aou', 'Sep', 'Oct', 'Nov', 'Dec'].includes(month) ? 2025 : 2026,
        month: MONTHS.indexOf(month) + 1,
        day: parseInt(day),
        hour: parseInt(hour),
        minute: parseInt(minute),
      };

      games.push({
        start: [date.year, date.month, date.day, date.hour, date.minute],
        duration: { hours: 2, minutes: 0 },
        title: `${homeTeam} - ${awayTeam} ${score !== '' ? `(${score})` : ''}`,
        description: '',
        location: 'Ada Blois',
        url: 'https://ada-basket.com/equipe-pro/calendrier/',
      });
    });

    createEvents(games, (error, value) => {
      if (error) {
        console.error('Error creating event:', error);
      }
      fs.writeFileSync('calendrier.ics', value);
      console.log('Events saved to calendrier.ics');
    });
  }
}

main();
