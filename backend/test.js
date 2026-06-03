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
(async () => {
  await test('SSD Kingston 500GB');
  await test('SSD 500GB');
  await test('Memoria Kingston 16GB DDR4');
  await test('Processador Ryzen 5 5600G');
  
  // also test without sort
  const testNoSort = async (query) => {
    const q = encodeURIComponent(query);
    const url = `https://servicespub.prod.api.aws.grupokabum.com.br/catalog/v2/products?query=${q}&page_number=1&page_size=20`;
    try {
      const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log('Query (No Sort):', query);
      res.data.data.slice(0, 5).forEach(item => {
         const price = item.attributes.price_with_discount || item.attributes.price;
         console.log(`- [${price}] ${item.attributes.title}`);
      });
    } catch (e) {
      console.log(`Query ${query} returned error: ${e.message}`);
    }
    console.log('---');
  };
  await testNoSort('Processador AMD Ryzen 5 4600G');
})();
