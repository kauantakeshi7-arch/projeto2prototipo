const axios = require('axios');
const cheerio = require('cheerio');

axios.get('https://www.kabum.com.br/busca/iphone', {headers:{'User-Agent':'Mozilla/5.0'}})
  .then(r => {
    const $ = cheerio.load(r.data);
    const nextData = JSON.parse($('#__NEXT_DATA__').html());
    
    // Tentando achar onde estão os produtos
    // Normalmente em nextData.props.pageProps.initialData ou algo parecido
    const pageProps = nextData.props.pageProps;
    
    let products = [];
    if (pageProps && pageProps.catalogData && pageProps.catalogData.data) {
       products = pageProps.catalogData.data;
    } else {
       console.log(Object.keys(pageProps));
    }
    
    if (products.length > 0) {
      console.log("Found products:", products.length);
      console.log("First product:", products[0].name, products[0].price, products[0].image, products[0].link);
    } else {
      console.log("Products not found in obvious location. Data structure:", JSON.stringify(nextData).substring(0, 500));
    }
  })
  .catch(console.error);
