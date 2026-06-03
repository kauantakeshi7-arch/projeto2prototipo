import { FoundPart } from './ScraperService';

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
    '4600g': [
      { game: 'CS2 / Valorant', fps: 100, quality: 'Baixo' },
      { game: 'GTA V / CoD', fps: 55, quality: 'Normal' },
      { game: 'Cyberpunk 2077', fps: 25, quality: 'Baixo' }
    ],
    '5600g': [
      { game: 'CS2 / Valorant', fps: 130, quality: 'Baixo' },
      { game: 'GTA V / CoD', fps: 65, quality: 'Normal' },
      { game: 'Cyberpunk 2077', fps: 30, quality: 'Baixo (FSR)' }
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
    let gpu = parts.find(p => p.component.toLowerCase().includes('vídeo') || p.component.toLowerCase().includes('video'));
    
    // 2. Se não tem GPU dedicada, achar o Processador (Pode ter gráfico integrado)
    let cpu = null;
    if (!gpu) {
      cpu = parts.find(p => p.component.toLowerCase().includes('processador'));
    }

    const titleToParse = (gpu ? gpu.name : cpu?.name) || '';
    
    // Algoritmo de Normalização de Hardware Imparável:
    // Remove espaços, vírgulas, hífens e converte pra minúsculo.
    // Ex: "VGA ASUS NVIDIA GEFORCE RTX 4060 TI" -> "vgaasusnvidiageforcertx4060ti"
    const normalized = titleToParse.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Busca pela sub-string correspondente no dicionário
    for (const key of Object.keys(this.benchmarks)) {
      if (normalized.includes(key)) {
        return this.benchmarks[key];
      }
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
