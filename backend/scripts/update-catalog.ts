import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { CATALOG_PARTS } from '../src/catalog/parts';

const CATALOG_PATH = path.join(__dirname, '../src/catalog/catalog.json');

async function scrapeKabum() {
    console.log(`Iniciando Raspagem Offline da Kabum para ${CATALOG_PARTS.length} peças...`);
    const catalogData: any = {};

    for (const part of CATALOG_PARTS) {
        console.log(`Buscando: ${part.searchQuery}`);
        
        const kabumUrl = `https://servicespub.prod.api.aws.grupokabum.com.br/catalog/v2/products?query=${encodeURIComponent(part.searchQuery)}&page_number=1&page_size=20&sort=relevance`;
        
        try {
            const response = await axios.get(kabumUrl, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                }
            });
            
            const items = response.data?.data || [];
            let chosenItem = null;

            for (const item of items) {
                const isMarketplace = item.attributes.is_marketplace === true;
                const price = parseFloat(item.attributes.price_with_discount || item.attributes.price);
                
                // Ignora lojistas terceiros
                if (isMarketplace) continue;
                
                // Sanity check de preço
                if (price < 100 && part.type !== 'CASE') continue;

                chosenItem = {
                    id: part.id,
                    component: part.type,
                    name: item.attributes.title,
                    price: price,
                    link: `https://www.kabum.com.br/produto/${item.id}/${item.attributes.product_link}`,
                    photo: item.attributes.photos?.m?.[0] || `https://images.kabum.com.br/produtos/fotos/${item.id}/${item.id}_index_m.jpg`,
                };
                break; // Pega o primeiro item RELEVANTE que não é marketplace
            }

            if (chosenItem) {
                catalogData[part.id] = chosenItem;
                console.log(` -> FOUND: ${chosenItem.name} (R$ ${chosenItem.price})`);
            } else {
                console.log(` -> NOT FOUND`);
            }

        } catch (error: any) {
            console.error(`Erro ao buscar ${part.id}:`, error.message);
        }

        // Delay para evitar Rate Limit
        await new Promise(r => setTimeout(r, 800));
    }

    // Salvar JSON
    fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalogData, null, 2), 'utf-8');
    console.log(`Catálogo atualizado com sucesso em: ${CATALOG_PATH}`);
}

scrapeKabum();
