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
          // ==========================================
          // SOBREVIVÊNCIA NA NUVEM (MOCK PARA VERCEL)
          // Se a API da Kabum bloqueou por WAF (403), geramos um mock em vez de quebrar a aplicação.
          // ==========================================
          console.warn(`[WAF BYPASS] Vercel bloqueada pela Kabum ao buscar ${part.componentName}. Gerando Mock de Sobrevivência.`);
          const mockPrice = Math.floor(part.minPrice! + ((part.maxPrice - part.minPrice!) * 0.7)); // Preço plausível
          
          const fallbackMock: FoundPart = {
             component: part.componentName,
             name: `${queries[0]} (Simulado)`,
             price: mockPrice,
             link: `https://www.kabum.com.br/`,
             photo: `https://images.kabum.com.br/produtos/fotos/114587/114587_1592398249_index_m.jpg`, // Foto genérica Kabum
             reason: part.reason + " [NOTA: Preço simulado devido a bloqueio do Firewall da Loja na Nuvem]"
          };
          
          onPartFound(fallbackMock);
          results.push(fallbackMock);
        }
      } catch (error: any) {
        console.error(`[Erro Crítico] Falha ao processar componente ${part.componentName}`, error?.message);
        throw error; // Propaga para o build.ts cancelar o PC inteiro se até o mock falhar
      }
      
      await new Promise(r => setTimeout(r, 400));
    }

    console.log(`[Scraping] Concluído! Encontradas ${results.length} peças.`);
    return results;
  }
}
