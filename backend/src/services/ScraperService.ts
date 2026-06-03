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
        
        let bestItemStrict: any = null;
        let bestItemStrictUrl = '';

        let bestItemExtended: any = null;
        let bestItemExtendedUrl = '';

        let lastResortItem: any = null;
        let lastResortUrl = '';

        // FASE 1: Baixar os dados de todas as queries e tentar achar no Preço Estrito
        for (let i = 0; i < queries.length; i++) {
          const query = queries[i];
          const queryEncoded = encodeURIComponent(query);
          const kabumUrl = `https://servicespub.prod.api.aws.grupokabum.com.br/catalog/v2/products?query=${queryEncoded}&page_number=1&page_size=20&sort=price`;

          // Verifica o Cache
          const cached = this.cache.get(kabumUrl);
          if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
             finalFoundPart = cached.part;
             finalFoundPart.reason = part.reason;
             break; // Achou no cache, confia
          }

          console.log(`[Scraping] Buscando: ${query} ...`);
          const kabumRes = await axios.get(kabumUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
            timeout: 8000,
            httpsAgent: new https.Agent({ keepAlive: true })
          });

          const items = kabumRes.data?.data || [];

          // Avalia para Strict e Extended
          for (const item of items) {
            const price = item.attributes.price_with_discount || item.attributes.price;
            
            // Grava o Strict
            if (!bestItemStrict && price >= part.minPrice && price <= part.maxPrice) {
              bestItemStrict = item;
              bestItemStrictUrl = kabumUrl;
            }

            // Grava o Extended (+30%)
            if (!bestItemExtended && price >= part.minPrice && price <= (part.maxPrice * 1.3)) {
              bestItemExtended = item;
              bestItemExtendedUrl = kabumUrl;
            }

            // Grava o Ultimate (Qualquer coisa acima do minPrice)
            if (!lastResortItem && price >= part.minPrice) {
              lastResortItem = item;
              lastResortUrl = kabumUrl;
            }
          }

          // Se já achou no Strict, nem precisa continuar batendo na API pras outras queries
          if (bestItemStrict) {
            break;
          }

          if (i < queries.length - 1) await new Promise(r => setTimeout(r, 400));
        }

        // FASE 2: Decisão de qual item usar
        let chosenItem = null;
        let chosenUrl = '';
        let appliedReason = part.reason;

        if (finalFoundPart) {
           // Já veio do cache
        } else if (bestItemStrict) {
           chosenItem = bestItemStrict;
           chosenUrl = bestItemStrictUrl;
        } else if (bestItemExtended) {
           chosenItem = bestItemExtended;
           chosenUrl = bestItemExtendedUrl;
           console.log(`[Tolerância Ativada] ${part.componentName} estourou o maxPrice estrito, usando margem +30%.`);
           appliedReason += " [Nota: O mercado está em alta, usamos uma margem extra de orçamento para garantir essa peça.]";
        } else if (lastResortItem) {
           chosenItem = lastResortItem;
           chosenUrl = lastResortUrl;
           console.log(`[Ultimate Fallback] Orçamento completamente estourado para ${part.componentName}.`);
           appliedReason += " [⚠️ PEÇA INFLACIONADA - Fallback de Sobrevivência Ativado. Não havia peças no orçamento.]";
        }

        // FASE 3: Montagem e Envio
        if (!finalFoundPart && chosenItem) {
           const price = chosenItem.attributes.price_with_discount || chosenItem.attributes.price;
           const productLink = `https://www.kabum.com.br/produto/${chosenItem.id}/${chosenItem.attributes.product_link}`;
           const photos = chosenItem.attributes.photos;
           const photoUrl = photos && photos.g && photos.g.length > 0 ? photos.g[0] : 
                            (photos && photos.m && photos.m.length > 0 ? photos.m[0] : `https://images.kabum.com.br/produtos/fotos/${chosenItem.id}/${chosenItem.id}_index_g.jpg`);

           finalFoundPart = {
             component: part.componentName,
             name: chosenItem.attributes.title,
             price: price,
             link: productLink,
             photo: photoUrl,
             reason: appliedReason
           };

           this.cache.set(chosenUrl, { part: finalFoundPart, timestamp: Date.now() });
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

      await new Promise(r => setTimeout(r, 300));
    }

    console.log(`[Scraping] Concluído! Encontradas ${results.length} peças.`);
    return results;
  }
}
