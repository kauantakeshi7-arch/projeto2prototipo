import axios from 'axios';
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
        let chosenItem: FoundPart | null = null;

        for (let i = 0; i < queries.length; i++) {
            const query = queries[i];
            const kabumUrl = `https://servicespub.prod.api.aws.grupokabum.com.br/catalog/v2/products?query=${encodeURIComponent(query)}&page_number=1&page_size=50&sort=price`;
            
            try {
              const kabumRes = await axios.get(kabumUrl, {
                headers: {
                  'Accept': 'application/json',
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                },
                timeout: 10000
              });
              
              const items = kabumRes.data?.data || [];
              
              for (const item of items) {
                  const price = parseFloat(item.attributes.price_with_discount || item.attributes.price);
                  const isMarketplace = item.attributes.is_marketplace === true;
                  
                  // BLOQUEIO ANTI-MARKETPLACE: Ignoramos lojistas terceiros que inflam preços.
                  if (isMarketplace) continue;
                  
                  // BLOQUEIO ANTI-ACESSÓRIOS: Usamos minPrice para ignorar cabos/pastas térmicas
                  if (!price || price < (part.minPrice || 50)) continue;

                  // Como filtramos marketplace e a busca já está ordenada por menor preço, 
                  // o primeiro item que respeitar o maxPrice é a nossa escolha definitiva.
                  if (price <= part.maxPrice) {
                     chosenItem = {
                        component: part.componentName,
                        name: item.attributes.title,
                        price: price,
                        link: `https://www.kabum.com.br/produto/${item.id}/${item.attributes.product_link}`,
                        photo: item.attributes.photos?.m?.[0] || `https://images.kabum.com.br/produtos/fotos/${item.id}/${item.id}_index_m.jpg`,
                        reason: part.reason
                     };
                     break;
                  }
              }
              if (chosenItem) break;
            } catch (error: any) {
              console.error(`[Scraper] Erro na query ${query}:`, error?.message);
            }
            
            // Pausa para não tomar block WAF
            await new Promise(r => setTimeout(r, 600));
        }

        if (chosenItem) {
          onPartFound(chosenItem);
          results.push(chosenItem);
        } else {
          console.error(`[FALHA CRÍTICA] Peça não encontrada dentro dos limites seguros: ${part.componentName}. Max Price Permitido: ${part.maxPrice}`);
          throw new Error(`Orçamento insuficiente para ${part.componentName} (Nenhuma peça encontrada abaixo de R$ ${part.maxPrice}). Tente aumentar o orçamento.`);
        }
      } catch (error: any) {
        console.error(`[Erro Crítico] Falha ao processar componente ${part.componentName}`, error?.message);
        throw error; // Propaga para o build.ts cancelar o PC inteiro
      }
      
      await new Promise(r => setTimeout(r, 400));
    }

    console.log(`[Scraping] Concluído! Encontradas ${results.length} peças.`);
    return results;
  }
}
