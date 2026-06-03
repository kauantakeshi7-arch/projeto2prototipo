export interface PCPartDefinition {
  componentName: string;
  searchQuery?: string;
  searchQueries?: string[];
  minPrice?: number;
  maxPrice: number;
  reason: string;
}

export interface Intent {
  budget: number;
  category: 'office' | 'gaming' | 'heavy_gaming' | 'workstation';
}

export class HardwareEngine {
  /**
   * Constrói a configuração usando Constraint Matchmaker
   */
  public static buildSetup(intent: Intent): PCPartDefinition[] {
    const b = intent.budget;
    
    // Kit Básico (Aproximadamente R$ 1400)
    // Usamos maxPrices estritos. A Placa Mãe B450/B550 atende bem.
    const baseKit: PCPartDefinition[] = [
      { componentName: "Placa Mãe", searchQueries: ["Placa Mae MSI B450M", "Placa Mae Asus B450M", "Placa Mae Gigabyte B450M", "Placa Mae B550M", "Placa Mae A520M"], minPrice: 350, maxPrice: 1500, reason: "Chipset testado para durabilidade. Suporta os Ryzen com folga e mantém VRMs frios." },
      { componentName: "Memória RAM", searchQueries: ["Memoria Kingston Fury Beast 16GB DDR4", "Memoria Corsair Vengeance 16GB DDR4", "Memoria 16GB DDR4"], minPrice: 150, maxPrice: 1500, reason: "16GB em Dual Channel é o padrão ouro para não sofrer engasgos no Windows ou em jogos." },
      { componentName: "SSD", searchQueries: ["SSD Kingston NV2 1TB", "SSD 1TB NVMe"], minPrice: 300, maxPrice: 1500, reason: "1TB M.2 NVMe. Acaba com telas de loading e suporta sistemas pesados modernos." },
      { componentName: "Fonte", searchQueries: ["Fonte MSI 600W", "Fonte Corsair 600W", "Fonte XPG 600W", "Fonte 600W 80 Plus", "Fonte 500W 80 Plus"], minPrice: 250, maxPrice: 1000, reason: "Qualidade de energia pura. Marcas premium com certificação 80 Plus para não queimar as peças." },
      { componentName: "Gabinete", searchQueries: ["Gabinete Gamer Ninja", "Gabinete ATX"], minPrice: 100, maxPrice: 800, reason: "Gabinete focado em Airflow para não superaquecer sua build." }
    ];

    const baseKitCost = 600 + 280 + 480 + 380 + 200; // = 1940
    // Vamos usar um valor prático de custo base vivo estimado: 1500
    const estimatedBaseCost = 1500;
    const perfPool = b - estimatedBaseCost;

    // Constraint Matchmaker
    // Avalia do Casal mais poderoso para o mais fraco

    if (perfPool >= 4500) {
      return [
        { componentName: "Processador", searchQueries: ["Processador AMD Ryzen 7 5700X3D"], minPrice: 1000, maxPrice: 3000, reason: "O rei do AM4. Tem 3D V-Cache que destrói em FPS." },
        { componentName: "Placa de Vídeo", searchQueries: ["Placa de Video RTX 4070", "Placa de Video RX 7700 XT", "Placa de Video RTX 4060 Ti"], minPrice: 2000, maxPrice: 6000, reason: "Performance insana para 1440p Ultra com Ray Tracing." },
        ...baseKit
      ];
    }

    if (perfPool >= 2500) {
      return [
        { componentName: "Processador", searchQueries: ["Processador AMD Ryzen 5 5600", "Processador AMD Ryzen 5 5500"], minPrice: 500, maxPrice: 2000, reason: "Gargalo zero com placas mid-range e baixo aquecimento." },
        { componentName: "Placa de Vídeo", searchQueries: ["Placa de Video RTX 4060", "Placa de Video RX 7600", "Placa de Video RX 6600"], minPrice: 1200, maxPrice: 3500, reason: "DLSS 3 e Frame Gen para voar em 1080p Ultra." },
        ...baseKit
      ];
    }

    if (perfPool >= 1500) {
      return [
        { componentName: "Processador", searchQueries: ["Processador AMD Ryzen 5 5500", "Processador AMD Ryzen 5 4500"], minPrice: 400, maxPrice: 1800, reason: "Custo-benefício invencível." },
        { componentName: "Placa de Vídeo", searchQueries: ["Placa de Video RX 6600", "Placa de Video GTX 1650"], minPrice: 800, maxPrice: 2500, reason: "Roda tudo em 1080p e bate de frente com a geração atual pelo preço." },
        ...baseKit
      ];
    }

    // Downgrade Automático: APU (Sem Placa de Vídeo)
    // O valor residual não paga Placa de Vídeo + CPU. Usaremos o valor total para um CPU Monstro Integrado.
    return [
        { componentName: "Processador", searchQueries: ["Processador AMD Ryzen 5 5600G", "Processador AMD Ryzen 5 4600G"], minPrice: 500, maxPrice: 2000, reason: "Seu orçamento não cobre Placa de Vídeo dedicada. Aplicamos Downgrade Automático para um Vídeo Integrado Radeon potente para você jogar." },
        ...baseKit
    ];
  }
}
