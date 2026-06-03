import catalogData from '../catalog/catalog.json';

export interface FoundPart {
  id: string;
  component: string;
  name: string;
  price: number;
  link: string;
  photo: string;
  socket?: string;
  ramType?: string;
  reason?: string;
}

export interface Intent {
  budget: number;
  category: 'office' | 'gaming' | 'heavy_gaming' | 'workstation';
}

export class HardwareEngine {
  private static getCatalog(): Record<string, FoundPart> {
    return catalogData as Record<string, FoundPart>;
  }

  public static buildSetup(intent: Intent): FoundPart[] {
    const catalog = this.getCatalog();
    const parts = Object.values(catalog);

    const cpus = parts.filter(p => p.component === 'CPU');
    const gpus = parts.filter(p => p.component === 'GPU');
    const mbs = parts.filter(p => p.component === 'MB');
    const rams = parts.filter(p => p.component === 'RAM');
    const ssds = parts.filter(p => p.component === 'SSD');
    const psus = parts.filter(p => p.component === 'PSU');
    const cases = parts.filter(p => p.component === 'CASE');

    let bestCombo: FoundPart[] = [];
    let bestScore = -1;
    let minPriceFound = Infinity;

    // Testaremos combos com e sem GPU dedicada, o solver prioriza a que der maior score (com GPU dá mais score, se couber)
    const gpusToUse: (FoundPart | null)[] = [...gpus, null];

    for (const cpu of cpus) {
        if (cpu.price > intent.budget) continue;
        for (const gpu of gpusToUse) {
            if (!gpu && !cpu.id.endsWith('g')) continue;
            const gpuPrice = gpu ? gpu.price : 0;
            if (cpu.price + gpuPrice > intent.budget) continue;
            
            for (const mb of mbs) {
                if (cpu.socket && mb.socket && cpu.socket !== mb.socket) continue;
                if (cpu.price + gpuPrice + mb.price > intent.budget) continue;
                
                for (const ram of rams) {
                    if (mb.ramType && ram.ramType && mb.ramType !== ram.ramType) continue;
                    if (cpu.price + gpuPrice + mb.price + ram.price > intent.budget) continue;

                    for (const ssd of ssds) {
                        if (cpu.price + gpuPrice + mb.price + ram.price + ssd.price > intent.budget) continue;
                        for (const psu of psus) {
                            if (cpu.price + gpuPrice + mb.price + ram.price + ssd.price + psu.price > intent.budget) continue;
                            for (const c of cases) {
                                const totalPrice = cpu.price + gpuPrice + mb.price + ram.price + ssd.price + psu.price + c.price;

                                if (totalPrice < minPriceFound) {
                                    minPriceFound = totalPrice;
                                }

                                if (totalPrice <= intent.budget) {
                                    let score = 0;
                                    if (gpu) {
                                        score = (gpu.price * 1.5) + (cpu.price * 1.0) + (ram.price * 0.5) + (ssd.price * 0.4) + (mb.price * 0.3) + (psu.price * 0.3) + (c.price * 0.1);
                                    } else {
                                        score = (cpu.price * 1.2) + (ram.price * 0.6) + (ssd.price * 0.4) + (mb.price * 0.3) + (psu.price * 0.3) + (c.price * 0.1);
                                    }

                                    if (intent.budget > 4000 && ram.price < 200) score -= 1000;

                                    if (score > bestScore) {
                                        bestScore = score;
                                        bestCombo = [cpu, mb, ram, ssd, psu, c];
                                        if (gpu) bestCombo.push(gpu);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (bestCombo.length === 0) {
        throw new Error(`Orçamento de R$ ${intent.budget} é insuficiente. O PC mais barato possível custa R$ ${minPriceFound.toFixed(2)}.`);
    }

    return bestCombo;
  }
}
