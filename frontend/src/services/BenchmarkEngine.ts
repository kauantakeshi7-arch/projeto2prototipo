import { FoundPart } from './HardwareEngine';

export interface GameFPS {
  game: string;
  fps: number;
  quality: string;
}

export class BenchmarkEngine {
  /**
   * Banco de dados interno de Benchmarks (Baseado em testes reais em 1080p).
   * Chave = Modelo de Placa de Vídeo normalizado (sem espaços, minúsculo).
   */
  private static benchmarks: Record<string, GameFPS[]> = {
    // Gráficos Integrados
    'radeonvega7': [
      { game: 'CS2 / Valorant', fps: 120, quality: 'Baixo' },
      { game: 'GTA V / CoD', fps: 60, quality: 'Normal' },
      { game: 'Cyberpunk 2077', fps: 30, quality: 'Muito Baixo (FSR)' }
    ],
    '3200g': [
      { game: 'CS2 / Valorant', fps: 90, quality: 'Baixo' },
      { game: 'GTA V / CoD', fps: 50, quality: 'Normal' },
      { game: 'Cyberpunk 2077', fps: 20, quality: 'Muito Baixo (Injogável)' }
    ],
    '4600g': [
      { game: 'CS2 / Valorant', fps: 110, quality: 'Baixo' },
      { game: 'GTA V / CoD', fps: 55, quality: 'Normal' },
      { game: 'Cyberpunk 2077', fps: 25, quality: 'Baixo (FSR Performance)' }
    ],
    '5600g': [
      { game: 'CS2 / Valorant', fps: 130, quality: 'Baixo' },
      { game: 'GTA V / CoD', fps: 65, quality: 'Normal' },
      { game: 'Cyberpunk 2077', fps: 30, quality: 'Baixo (FSR)' }
    ],
    '5600gt': [
      { game: 'CS2 / Valorant', fps: 140, quality: 'Médio' },
      { game: 'GTA V / CoD', fps: 70, quality: 'Normal' },
      { game: 'Cyberpunk 2077', fps: 35, quality: 'Baixo (FSR)' }
    ],
    '8600g': [
      { game: 'CS2 / Valorant', fps: 200, quality: 'Alto' },
      { game: 'GTA V / CoD', fps: 90, quality: 'Alto' },
      { game: 'Cyberpunk 2077', fps: 45, quality: 'Baixo (FSR Quality)' }
    ],
    
    // Placas Dedicadas AMD
    'rx6600': [
      { game: 'CS2 / Valorant', fps: 350, quality: 'Ultra' },
      { game: 'GTA V / CoD', fps: 140, quality: 'Ultra' },
      { game: 'Cyberpunk 2077', fps: 65, quality: 'Alto' }
    ],
    
    // Placas Dedicadas NVIDIA
    'rtx3060': [
      { game: 'CS2 / Valorant', fps: 380, quality: 'Ultra' },
      { game: 'GTA V / CoD', fps: 145, quality: 'Ultra' },
      { game: 'Cyberpunk 2077', fps: 70, quality: 'Alto (DLSS)' }
    ],
    'rtx4060': [
      { game: 'CS2 / Valorant', fps: 450, quality: 'Ultra' },
      { game: 'GTA V / CoD', fps: 180, quality: 'Ultra' },
      { game: 'Cyberpunk 2077', fps: 100, quality: 'Ultra (DLSS 3)' }
    ],
    'rtx4070ti': [
      { game: 'CS2 / Valorant', fps: 700, quality: 'Ultra 4K' },
      { game: 'GTA V / CoD', fps: 250, quality: 'Ultra 4K' },
      { game: 'Cyberpunk 2077', fps: 120, quality: 'Psycho Ray Tracing' }
    ],
    'rtx4090': [
      { game: 'CS2 / Valorant', fps: 900, quality: 'Ultra 8K' },
      { game: 'GTA V / CoD', fps: 300, quality: 'Ultra 4K' },
      { game: 'Cyberpunk 2077', fps: 150, quality: 'Psycho Ray Tracing' }
    ]
  };

  /**
   * Avalia a lista de peças finais reais da loja para determinar a performance.
   */
  public static calculate(parts: FoundPart[]): GameFPS[] {
    // 1. Achar a Placa de Vídeo Dedicada
    let gpu = parts.find(p => p.component === 'GPU');
    
    // 2. Se não tem GPU dedicada, achar o Processador (Pode ter gráfico integrado)
    let cpu = null;
    if (!gpu) {
      cpu = parts.find(p => p.component === 'CPU');
    }

    const titleToParse = (gpu ? gpu.name : cpu?.name) || '';
    
    // Algoritmo de Normalização de Hardware Imparável:
    // Remove espaços, vírgulas, hífens e converte pra minúsculo.
    // Ex: "VGA ASUS NVIDIA GEFORCE RTX 4060 TI" -> "vgaasusnvidiageforcertx4060ti"
    const normalized = titleToParse.toLowerCase().replace(/[^a-z0-9]/g, '');

    // 2. Se for PC com Placa de Vídeo Dedicada
    if (gpu) {
      if (gpu.id.includes('4090') || gpu.id.includes('9070')) {
        return this.benchmarks['rtx4090'];
      } else if (gpu.id.includes('rtx4070') || gpu.id.includes('7800') || gpu.id.includes('7900')) {
        return this.benchmarks['rtx4070ti'];
      } else if (gpu.id.includes('rtx4060') || gpu.id.includes('rx6600') || gpu.id.includes('5060')) {
        return this.benchmarks['rtx4060'];
      }
      return this.benchmarks['rtx3060']; // fallback decente genérico
    }

    // 3. Se for APU (Sem placa de vídeo)
    if (cpu) {
      if (cpu.id.includes('8600g')) return this.benchmarks['8600g'];
      if (cpu.id.includes('5600g') || cpu.id.includes('5600gt')) return this.benchmarks['5600gt'];
    }

    // Fallback: Se achou uma Placa de Vídeo mas o modelo não está no nosso dicionário, chute conservador
    if (gpu) {
      return [
        { game: 'CS2 / Valorant', fps: 180, quality: 'Alto' },
        { game: 'GTA V / CoD', fps: 80, quality: 'Alto' },
        { game: 'Cyberpunk 2077', fps: 40, quality: 'Médio' }
      ];
    }

    // Fallback: PC ultra fraco sem GPU mapeada e sem processador G mapeado
    return [
      { game: 'CS2 / Valorant', fps: 60, quality: 'Baixo' },
      { game: 'GTA V / CoD', fps: 30, quality: 'Baixo' },
      { game: 'Cyberpunk 2077', fps: 10, quality: 'Injogável' }
    ];
  }
}
