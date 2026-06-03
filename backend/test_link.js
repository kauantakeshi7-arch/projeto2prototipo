const axios = require('axios');
const cheerio = require('cheerio');

axios.get('https://www.buscape.com.br/search?q=iphone', {headers:{'User-Agent':'Mozilla'}})
  .then(r => {
    const $ = cheerio.load(r.data);
    const card = $('[data-testid="product-card::card"]').first();
    console.log("Card is anchor?", card[0].tagName);
    console.log("Card HTML:", card.html().substring(0, 500));
    console.log("Anchors inside:", card.find('a').length);
    if(card.find('a').length > 0) {
       console.log("First anchor href:", card.find('a').attr('href'));
    }
    
    // Also let's check Method 2 elements
    const inner = $('.SearchCard_ProductCard_Inner__7JhKb').first();
    console.log("Method 2 is anchor?", inner[0]?.tagName);
    console.log("Method 2 href:", inner.attr('href'));
  })
  .catch(console.error);
