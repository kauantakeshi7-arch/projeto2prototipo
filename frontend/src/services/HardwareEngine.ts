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
  includesCooler?: boolean;
  length?: number;
  maxGpuLength?: number;
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
  targetGames?: string[];
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
    const coolers = parts.filter(p => p.component === 'COOLER');

    let bestCombo: FoundPart[] = [];
    let bestScore = -1;
    let minPriceFound = Infinity;

    // Testaremos combos com e sem GPU dedicada, e com e sem cooler
    const gpusToUse: (FoundPart | null)[] = [...gpus, null];
    const coolersToUse: (FoundPart | null)[] = [...coolers, null];

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

                                // REGRAS DE HARMONIA DE SETUP (TIER MATCHING)
                                // 1. CPU topo de linha exige Placa-Mãe robusta (VRMs não podem ferver)
                                if (cpu.price > 1500 && mb.price < 800) continue;
                                
                                // 2. GPU gigante/quente exige Gabinete premium (Airflow/Espaço)
                                if (gpu && gpu.price > 4000 && c.price < 300) continue;
                                
                                // 3. Anomalia de Prioridade: SSD não deve ser abusivamente mais caro que a Placa Mãe
                                if (ssd.price > mb.price * 2) continue;

                                // 4. Gargalo Reverso: Placa-mãe estupidamente cara para um Processador básico (Bloqueia placa de R$ 4500 com CPU de R$ 600)
                                if (mb.price > cpu.price * 2.5) continue;

                                for (const cooler of coolersToUse) {
                                    // REGRAS DE TERMODINÂMICA E FÍSICA AVANÇADA (GOD TIER)
                                    // 1. Processador topo de linha VEM SEM COOLER na caixa. É OBRIGATÓRIO comprar um.
                                    if (!cooler && cpu.includesCooler === false) continue;
                                    
                                    // 2. Thermal Throttling: Processador muito quente exige Water Cooler decente
                                    if (cooler && cpu.price > 2500 && cooler.price < 300) continue;
                                    
                                    // 3. Economia Inteligente: Processador básico já vem com cooler grátis
                                    if (cooler && cpu.includesCooler === true && intent.budget < 5000) continue;

                                    // 4. Bom Senso Extremo: O Cooler não pode custar mais que o próprio Processador
                                    if (cooler && cooler.price > cpu.price) continue;

                                    // 4. MOTOR DE GEOMETRIA 3D (Colisão GPU vs Gabinete)
                                    if (gpu && gpu.length && c.maxGpuLength) {
                                        let actualClearance = c.maxGpuLength;
                                        // Se compramos um Water Cooler e o gabinete não for Full Tower, ele vai na frente e rouba 50mm
                                        if (cooler && cooler.id.includes('water') && c.id !== 'case_fulltower') {
                                            actualClearance -= 50;
                                        }
                                        if (gpu.length > actualClearance) {
                                            continue; // A Placa de vídeo vai bater no radiador ou na lata do gabinete. Aborta.
                                        }
                                    }

                                    const coolerPrice = cooler ? cooler.price : 0;
                                    const totalPrice = cpu.price + gpuPrice + mb.price + ram.price + ssd.price + psu.price + c.price + coolerPrice;

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

                                        if (cooler) score += cooler.price * 0.2; // Cooler gera um bônus pequeno de temperatura

                                        if (intent.budget > 4000 && ram.price < 200) score -= 1000;

                                        // PENALIDADE DE GARGALO (Evitar CPU fraca com GPU forte)
                                        if (gpu && this.calculateBottleneck(cpu, gpu)) {
                                            score -= 4000;
                                        }

                                        // PENALIDADE DE REDUNDÂNCIA DE VÍDEO (Evitar APU + GPU Dedicada)
                                        if (gpu && cpu.hasIntegratedGraphics) {
                                            score -= 1500;
                                        }

                                        // PENALIDADE DE UPGRADE PATH (AM4 vs AM5)
                                        // Se o usuário tem um orçamento imenso, forçar compra de AM5. Comprar AM4 com mais de R$ 8000 é matar a longevidade do PC.
                                        if (intent.budget >= 8000 && mb.socket === 'AM4') {
                                            score -= 1500;
                                        }

                                        // PENALIDADE DE CURVA DE EFICIÊNCIA (PSU Overkill)
                                        // Evita que a IA compre uma fonte de 1000W para rodar um PC que exige 400W (desperdício de dinheiro).
                                        const psuWattageMatch = psu.name.match(/\d{3,4}W/);
                                        if (psuWattageMatch && gpu) {
                                            const psuWatts = parseInt(psuWattageMatch[0].replace('W', ''));
                                            const reqWatts = this.getGpuRequiredWattage(gpu);
                                            if (psuWatts > reqWatts + 400) {
                                                // Pune levemente se a folga da fonte for absurdamente além de 400W do recomendado da NVIDIA/AMD
                                                score -= 300;
                                            }
                                        }

                                        // BÔNUS SEMÂNTICO DE SCORE (Preferências do Usuário)
                                        if (intent.preferences) {
                                            const comboNames = [cpu.name, mb.name, ram.name, ssd.name, psu.name, c.name, gpu?.name || '', cooler?.name || ''].join(' ').toLowerCase();
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
                                            if (cooler) bestCombo.push(cooler);
                                        }
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

    // AVALIAÇÃO DE PLAYABILITY (JOGABILIDADE)
    const hasGpu = bestCombo.some(p => p.component === 'GPU');
    if (!hasGpu && intent.targetGames && intent.targetGames.length > 0) {
        const heavyGames = ['cyberpunk', 'cyberpunk 2077', 'alan wake', 'hogwarts legacy', 'starfield', 'red dead', 'rdr2', 'flight simulator', 'the last of us', 'heavy'];
        const isDemanding = intent.targetGames.some(g => heavyGames.some(hg => g.toLowerCase().includes(hg)));
        
        if (isDemanding) {
            // Se o usuário quer jogar jogo pesado e o PC gerado não tem GPU Dedicada, é Injogável!
            const minGPUPrice = gpus.length > 0 ? Math.min(...gpus.map(g => g.price)) : 1300;
            const absoluteMin = minPriceFound + minGPUPrice;
            throw new Error(`Para rodar títulos exigentes como ${intent.targetGames.join(', ')} de forma aceitável, é obrigatório o uso de uma Placa de Vídeo Dedicada. Seu orçamento construiu um PC com Placa Integrada, que não rodará esses jogos. Considere um orçamento de R$ ${absoluteMin.toFixed(2)}.`);
        }
    }

    // Injetar motivos (reason) de escolha para o front-end
    for (const part of bestCombo) {
        if (!part.reason) {
            switch(part.component) {
                case 'CPU': part.reason = `Processador escolhido pelo excelente custo-benefício de ${part.price} BRL para o seu orçamento.`; break;
                case 'GPU': part.reason = `Placa de vídeo dedicada selecionada para garantir FPS estável nos seus jogos.`; break;
                case 'MB': part.reason = `Placa-mãe (Socket ${part.socket}) 100% compatível com o processador escolhido.`; break;
                case 'RAM': part.reason = `Memória veloz e otimizada para trabalhar sem gargalos com a sua placa-mãe.`; break;
                case 'SSD': part.reason = `Armazenamento de ultra velocidade (NVMe) para que seus jogos e sistema carreguem em segundos.`; break;
                case 'PSU': part.reason = `Fonte de alimentação dimensionada com folga de segurança e proteção elétrica para as suas peças.`; break;
                case 'CASE': part.reason = `Gabinete com formato físico perfeitamente validado para caber a placa-mãe.`; break;
                case 'COOLER': part.reason = `Sistema de refrigeração termicamente dimensionado para domar o calor gerado por este processador.`; break;
                default: part.reason = `Peça selecionada pela nossa inteligência artificial como a melhor opção matemática de custo.`;
            }
        }
    }

    return bestCombo;
  }
}
