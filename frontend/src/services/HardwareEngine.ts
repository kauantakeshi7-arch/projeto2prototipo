import fs from 'fs';
import path from 'path';

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
    const catalogPath = path.join(process.cwd(), 'src', 'catalog', 'catalog.json');
    if (!fs.existsSync(catalogPath)) {
        throw new Error("Catálogo offline não encontrado. Rode o script de atualização.");
    }
    const data = fs.readFileSync(catalogPath, 'utf-8');
    return JSON.parse(data);
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
        for (const gpu of gpusToUse) {
            // Se não tem GPU, a CPU OBRIGATORIAMENTE precisa ter final 'g' (Vídeo Integrado)
            if (!gpu && !cpu.id.endsWith('g')) continue;
            for (const mb of mbs) {
                // Compatibilidade de Socket
                if (cpu.socket && mb.socket && cpu.socket !== mb.socket) continue;
                
                for (const ram of rams) {
                    // Compatibilidade de RAM
                    if (mb.ramType && ram.ramType && mb.ramType !== ram.ramType) continue;

                    for (const ssd of ssds) {
                        for (const psu of psus) {
                            for (const c of cases) {
                                
                                const combo = [cpu, mb, ram, ssd, psu, c];
                                if (gpu) combo.push(gpu);

                                const totalPrice = combo.reduce((sum, p) => sum + p.price, 0);

                                if (totalPrice < minPriceFound) {
                                    minPriceFound = totalPrice;
                                }

                                if (totalPrice <= intent.budget) {
                                    // Pontuação baseada no valor investido em CPU e GPU (quanto mais cara, mais fps)
                                    let score = 0;
                                    if (gpu) {
                                        score = gpu.price * 1.5 + cpu.price * 1.0;
                                    } else {
                                        score = cpu.price * 1.2; // APU
                                    }

                                    // Penalidade leve se a RAM ou SSD for fraca para um PC caro
                                    if (intent.budget > 4000 && ram.price < 200) score -= 1000;

                                    if (score > bestScore) {
                                        bestScore = score;
                                        bestCombo = combo;
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
