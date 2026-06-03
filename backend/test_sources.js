const axios = require('axios');
const headers = {'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'};

async function test(url) {
  try {
    const res = await axios.get(url, {headers, timeout: 10000});
    console.log(url, "=> OK, HTML length:", res.data.length);
  } catch(e) {
    console.log(url, "=> FAILED:", e.response ? e.response.status : e.message);
  }
}

async function run() {
  await test('https://www.zoom.com.br/search?q=iphone');
  await test('https://www.kabum.com.br/busca/iphone');
  await test('https://lista.mercadolivre.com.br/iphone');
  await test('https://www.amazon.com.br/s?k=iphone');
}

run();
