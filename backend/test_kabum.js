const axios = require('axios');
const cheerio = require('cheerio');

axios.get('https://www.kabum.com.br/busca/iphone', {headers:{'User-Agent':'Mozilla/5.0'}})
  .then(r => {
    const $ = cheerio.load(r.data);
    const names = [];
    $('.productCard').each((i, el) => {
       const title = $(el).find('.nameCard').text().trim();
       names.push(title);
    });
    console.log("Using productCard:", names.length);
    
    if (names.length === 0) {
      // Let's print a bit of the HTML to see what's up
      const nextData = $('#__NEXT_DATA__').html();
      if(nextData) console.log("__NEXT_DATA__ found. Length:", nextData.length);
    }
  })
  .catch(console.error);
