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
        const queries = part.searchQueries || (part.searchQuery ? [part.searchQuery] : []);
        let finalFoundPart: FoundPart | null = null;
        let lastResortItem: any = null;
        let lastResortUrl = '';

        for (let i = 0; i < queries.length; i++) {
          const query = queries[i];
          const queryEncoded = encodeURIComponent(query);
          const kabumUrl = `https://servicespub.prod.api.aws.grupokabum.com.br/catalog/v2/products?query=${queryEncoded}&page_number=1&page_size=20&sort=price`;

          // Verifica o Cache
          const cached = this.cache.get(kabumUrl);
          if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
            console.log(`[Cache Hit] ${part.componentName} -> ${cached.part.name}`);
            cached.part.reason = part.reason;
            finalFoundPart = cached.part;
            break; // Sai do loop de queries
          }

          console.log(`[Scraping] Buscando: ${query} ...`);
          
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

          // Tentativa Normal
          for (const item of items) {
            const price = item.attributes.price_with_discount || item.attributes.price;
            if (price >= part.minPrice && price <= part.maxPrice) {
              bestItem = item;
              break;
            }
          }

          // Tolerância Dinâmica (+30%)
          if (!bestItem && items.length > 0) {
            const extendedMax = part.maxPrice * 1.3;
            for (const item of items) {
              const price = item.attributes.price_with_discount || item.attributes.price;
              if (price >= part.minPrice && price <= extendedMax) {
                bestItem = item;
                console.log(`[Tolerância Ativada] Peça ${query} selecionada com margem de +30%.`);
                break;
              }
            }
          }

          // Salva o mais barato válido no Ultimate Fallback
          if (!bestItem && items.length > 0 && !lastResortItem) {
            for (const item of items) {
              const price = item.attributes.price_with_discount || item.attributes.price;
              if (price >= part.minPrice) {
                lastResortItem = item;
                lastResortUrl = kabumUrl;
                break;
              }
            }
          }

          if (bestItem) {
            const price = bestItem.attributes.price_with_discount || bestItem.attributes.price;
            const productLink = `https://www.kabum.com.br/produto/${bestItem.id}/${bestItem.attributes.product_link}`;
            const photos = bestItem.attributes.photos;
            const photoUrl = photos && photos.g && photos.g.length > 0 
                             ? photos.g[0] 
                             : (photos && photos.m && photos.m.length > 0 ? photos.m[0] : `https://images.kabum.com.br/produtos/fotos/${bestItem.id}/${bestItem.id}_index_g.jpg`);

            finalFoundPart = {
              component: part.componentName,
              name: bestItem.attributes.title,
              price: price,
              link: productLink,
              photo: photoUrl,
              reason: part.reason
            };

            this.cache.set(kabumUrl, { part: finalFoundPart, timestamp: Date.now() });
            break; // Achou! Sai do loop de queries.
          }

          // Respiro Anti-DDoS entre queries
          if (i < queries.length - 1) {
            await new Promise(r => setTimeout(r, 400));
          }
        }

        // Se não achou NADA dentro do orçamento, ativa o Ultimate Survival Fallback
        if (!finalFoundPart && lastResortItem) {
          console.log(`[Ultimate Fallback] Orçamento estourado para ${part.componentName}. Comprando o mais barato possível acima do minPrice.`);
          const price = lastResortItem.attributes.price_with_discount || lastResortItem.attributes.price;
          const productLink = `https://www.kabum.com.br/produto/${lastResortItem.id}/${lastResortItem.attributes.product_link}`;
          const photos = lastResortItem.attributes.photos;
          const photoUrl = photos && photos.g && photos.g.length > 0 
                           ? photos.g[0] 
                           : (photos && photos.m && photos.m.length > 0 ? photos.m[0] : `https://images.kabum.com.br/produtos/fotos/${lastResortItem.id}/${lastResortItem.id}_index_g.jpg`);

          finalFoundPart = {
            component: part.componentName,
            name: lastResortItem.attributes.title,
            price: price,
            link: productLink,
            photo: photoUrl,
            reason: part.reason + " [Peça inflacionada - Selecionada via Fallback de Sobrevivência]"
          };

          this.cache.set(lastResortUrl, { part: finalFoundPart, timestamp: Date.now() });
        }

        if (finalFoundPart) {
          onPartFound(finalFoundPart);
          results.push(finalFoundPart);
        } else {
          console.log(`[Aviso] Peça não encontrada no orçamento e nenhum fallback possível: ${part.componentName}`);
        }

      } catch (error) {
        console.error(`[Erro] Falha ao processar componente ${part.componentName}`);
      }

      // Respiro Anti-DDoS entre peças diferentes
      await new Promise(r => setTimeout(r, 300));
    }

    console.log(`[Scraping] Concluído! Encontradas ${results.length} peças.`);
    return results;
  }
}
