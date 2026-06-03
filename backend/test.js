const axios = require('axios');

async function test(query) {
  const q = encodeURIComponent(query);
  const url = `https://servicespub.prod.api.aws.grupokabum.com.br/catalog/v2/products?query=${q}&page_number=1&page_size=20&sort=price`;
  try {
    const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    console.log('Query:', query);
    res.data.data.slice(0, 5).forEach(item => {
       const price = item.attributes.price_with_discount || item.attributes.price;
       console.log(`- [${price}] ${item.attributes.title}`);
    });
  } catch (e) {
    console.log(`Query ${query} returned error: ${e.message}`);
  }
  console.log('---');
}

(async () => {
  await test('Processador AMD Ryzen 3 3200G');
  await test('Memoria Kingston Fury Beast 8GB DDR4');
  await test('Memoria 8GB DDR4 3200MHz');
  await test('SSD Kingston A400 240GB');
})();
