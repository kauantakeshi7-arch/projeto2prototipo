import axios from 'axios';
import https from 'https';
import { PCPartDefinition } from './HardwareEngine';

export interface FoundPart {
  component: string;
  name: string;
  price: number;
  link: string;
  photo: string;
  reason: string;
}

export class ScraperService {
  // Cache em memória (Duração: 15 minutos)
  private cache = new Map<string, { part: FoundPart, timestamp: number }>();
  private CACHE_TTL = 15 * 60 * 1000; 

  /**
   * Busca as peças sequencialmente. Dispara um callback `onPartFound` assim que acha cada peça.
   */
  public async searchPartsStream(
    parts: PCPartDefinition[], 
    onPartFound: (part: FoundPart) => void
  ): Promise<FoundPart[]> {
    const results: FoundPart[] = [];
    
    for (const part of parts) {
      try {
        const query = encodeURIComponent(part.searchQuery);
        const kabumUrl = `https://servicespub.prod.api.aws.grupokabum.com.br/catalog/v2/products?query=${query}&page_number=1&page_size=20&facet_filters=eyJoYXNfb2ZmZXIiOlsiZmFsc2UiXX0=&sort=price`;

        // Verifica o Cache
        const cached = this.cache.get(kabumUrl);
        if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
          console.log(`[Cache Hit] ${part.componentName} -> ${cached.part.name}`);
          // Garante que a razão atualizada da Engine sobrescreva a do cache antigo, por segurança
          cached.part.reason = part.reason;
          onPartFound(cached.part);
          results.push(cached.part);
          
          // Respiro Anti-DDoS
          await new Promise(r => setTimeout(r, 300));
          continue;
        }

        console.log(`[Scraping] Buscando: ${part.searchQuery} ...`);
        
        const kabumRes = await axios.get(kabumUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Accept': 'application/json'
          },
          timeout: 8000,
          httpsAgent: new https.Agent({ keepAlive: true })
        });

        const items = kabumRes.data?.data || [];
        
        let bestItem = null;

        for (const item of items) {
          const price = item.attributes.price_with_discount || item.attributes.price;
          if (price >= part.minPrice && price <= part.maxPrice) {
            bestItem = item;
            break;
          }
        }

        if (bestItem) {
          const price = bestItem.attributes.price_with_discount || bestItem.attributes.price;
          const productLink = `https://www.kabum.com.br/produto/${bestItem.id}/${bestItem.attributes.product_link}`;
          
          const photos = bestItem.attributes.photos;
          const photoUrl = photos && photos.g && photos.g.length > 0 
                           ? photos.g[0] 
                           : (photos && photos.m && photos.m.length > 0 ? photos.m[0] : `https://images.kabum.com.br/produtos/fotos/${bestItem.id}/${bestItem.id}_index_g.jpg`);

          const foundPart: FoundPart = {
            component: part.componentName,
            name: bestItem.attributes.title,
            price: price,
            link: productLink,
            photo: photoUrl,
            reason: part.reason
          };

          // Salva no Cache
          this.cache.set(kabumUrl, { part: foundPart, timestamp: Date.now() });

          onPartFound(foundPart);
          results.push(foundPart);
        } else {
          console.log(`[Aviso] Peça não encontrada no orçamento: ${part.searchQuery}`);
        }

      } catch (error) {
        console.error(`[Erro] Falha ao buscar ${part.searchQuery}`);
      }

      // Respiro Anti-DDoS (300ms entre as requisições)
      await new Promise(r => setTimeout(r, 300));
    }

    console.log(`[Scraping] Concluído! Encontradas ${results.length} peças.`);
    return results;
  }
}
