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
  hasIntegratedGraphics?: boolean;
  formFactor?: string;
  supportedFormFactors?: string[];
}

export interface Intent {
  budget: number;
  category: 'office' | 'gaming' | 'heavy_gaming' | 'workstation';
  preferences?: {
    brands?: string[];
    colors?: string[];
  };
}

export class HardwareEngine {
  private static getCatalog(): Record<string, FoundPart> {
    return catalogData as Record<string, FoundPart>;
  }

  private static getPsuWattage(psu: FoundPart): number {
    const match = psu.name.match(/(\d{3,4})W/i);
    if (match) return parseInt(match[1]);
    if (psu.id.includes('650')) return 650;
    if (psu.id.includes('750')) return 750;
    if (psu.id.includes('850')) return 850;
    if (psu.id.includes('1000')) return 1000;
    return 500; 
  }

  private static getGpuRequiredWattage(gpu: FoundPart | null): number {
    if (!gpu) return 300; 
    const id = gpu.id.toLowerCase();
    if (id.includes('4090') || id.includes('9070')) return 850;
    if (id.includes('4080') || id.includes('7900')) return 750;
    if (id.includes('4070') || id.includes('7800')) return 650;
    if (id.includes('4060') || id.includes('6700')) return 550;
    if (id.includes('3060') || id.includes('6600')) return 500;
    return 500;
  }

  public static calculateBottleneck(cpu: FoundPart, gpu: FoundPart | null): string | null {
    if (!gpu) return null; 
    
    const cpuId = cpu.id.toLowerCase();
    const gpuId = gpu.id.toLowerCase();

    // GPUs de altíssima performance
    if (gpuId.includes('4070') || gpuId.includes('4080') || gpuId.includes('4090') || gpuId.includes('9070')) {
        // CPUs de entrada ou média performance
        if (cpuId.includes('4600') || cpuId.includes('5600') || cpuId.includes('5500') || cpuId.includes('12400') || cpuId.includes('3200')) {
            return `Atenção: O processador pode limitar ("dar gargalo") no potencial da sua placa de vídeo. Considere um upgrade futuro para um Ryzen 7 ou superior.`;
        }
    }
    return null;
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
            if (!gpu && !cpu.hasIntegratedGraphics) continue;
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
                            
                            // CRÍTICO: Prevenção de queima/desarme da fonte de alimentação
                            if (this.getPsuWattage(psu) < this.getGpuRequiredWattage(gpu)) continue;
                            for (const c of cases) {
                                // CRÍTICO: Trava de dimensão física da Placa-Mãe vs Gabinete
                                if (mb.formFactor && c.supportedFormFactors && !c.supportedFormFactors.includes(mb.formFactor)) continue;

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

                                    // BÔNUS SEMÂNTICO DE SCORE (Preferências do Usuário)
                                    if (intent.preferences) {
                                        const comboNames = [cpu.name, mb.name, ram.name, ssd.name, psu.name, c.name, gpu?.name || ''].join(' ').toLowerCase();
                                        if (intent.preferences.brands) {
                                            for (const brand of intent.preferences.brands) {
                                                if (comboNames.includes(brand.toLowerCase())) score += 800; // Boost moderado
                                            }
                                        }
                                        if (intent.preferences.colors) {
                                            for (const color of intent.preferences.colors) {
                                                if (comboNames.includes(color.toLowerCase())) score += 600; 
                                            }
                                        }
                                    }

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
