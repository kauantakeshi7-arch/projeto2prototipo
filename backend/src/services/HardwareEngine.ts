export interface PCPartDefinition {
  componentName: string;
  searchQuery: string;
  minPrice: number;
  maxPrice: number;
  reason: string;
}

export interface Intent {
  budget: number;
  category: 'office' | 'gaming' | 'heavy_gaming' | 'workstation';
}

export class HardwareEngine {
  /**
   * Constrói a configuração ideal matematicamente, respeitando Sockets e RAM
   */
  public static buildSetup(intent: Intent): PCPartDefinition[] {
    const b = intent.budget;

    // Lógica determinística e segura contra falhas físicas.
    // Se o orçamento é baixo, usamos gráficos integrados (AM4)
    if (b < 2500 || intent.category === 'office') {
      return [
        { componentName: "Processador", searchQuery: "Processador AMD Ryzen 5 4600G", minPrice: 500, maxPrice: 700, reason: "Processador com vídeo integrado forte (Radeon Graphics), ideal para cortar o custo absurdo de uma placa de vídeo dedicada." },
        { componentName: "Placa Mãe", searchQuery: "Placa Mae A520M", minPrice: 300, maxPrice: 450, reason: "Placa mãe de entrada com soquete AM4. Cumpre o básico sem desperdiçar dinheiro em overclocking." },
        { componentName: "Memória RAM", searchQuery: "Memoria RAM 16GB DDR4 3200MHz", minPrice: 150, maxPrice: 250, reason: "16GB é o mínimo absoluto hoje em dia, e a alta frequência (3200MHz) faz a placa de vídeo integrada do Ryzen render muito mais." },
        { componentName: "SSD", searchQuery: "SSD 500GB NVMe M.2", minPrice: 150, maxPrice: 250, reason: "O formato NVMe M.2 é 10x mais rápido que um HD tradicional, ligando o PC e abrindo programas em segundos." },
        { componentName: "Fonte", searchQuery: "Fonte 500W 80 Plus", minPrice: 200, maxPrice: 350, reason: "Selo 80 Plus garante eficiência energética. 500W sobra para essa máquina e garante upgrades futuros." },
        { componentName: "Gabinete", searchQuery: "Gabinete Gamer", minPrice: 150, maxPrice: 250, reason: "Escolha baseada em melhor circulação de ar, prevenindo superaquecimento." }
      ];
    }

    // Mid-Range Gaming (AM4 + DDR4 + GPU Dedicada)
    if (b < 5500) {
      return [
        { componentName: "Processador", searchQuery: "Processador AMD Ryzen 5 5600", minPrice: 600, maxPrice: 900, reason: "Rei absoluto do custo-benefício. Seus 6 núcleos são velozes o suficiente para não dar gargalo em 99% das placas de vídeo intermediárias." },
        { componentName: "Placa Mãe", searchQuery: "Placa Mae B550M", minPrice: 500, maxPrice: 800, reason: "Chipset B550 libera o PCI-Express 4.0, garantindo velocidade máxima de leitura no SSD e liberação total da Placa de Vídeo." },
        { componentName: "Memória RAM", searchQuery: "Memoria RAM 16GB DDR4 3200MHz", minPrice: 200, maxPrice: 350, reason: "16GB é a zona de conforto para rodar jogos AAA e ter o Discord/Navegador aberto sem travamentos." },
        { componentName: "Placa de Vídeo", searchQuery: "Placa de Video RX 6600 8GB", minPrice: 1200, maxPrice: 1600, reason: "Bate as placas da Nvidia na mesma faixa de preço. Com 8GB de VRAM, é a melhor escolha atual para rodar tudo no Ultra em 1080p." },
        { componentName: "SSD", searchQuery: "SSD 1TB NVMe M.2", minPrice: 300, maxPrice: 450, reason: "Jogos hoje pesam 100GB+. Com 1TB NVMe, você não sofre por espaço e tem carregamentos quase instantâneos." },
        { componentName: "Fonte", searchQuery: "Fonte 600W 80 Plus", minPrice: 250, maxPrice: 400, reason: "Fontes seguras impedem curtos-circuitos. 600W aguentam a Placa de Vídeo em carga máxima com tranquilidade." }
      ];
    }

    // High-End Gaming (AM5 + DDR5 + GPU Forte)
    if (b < 8000) {
      return [
        { componentName: "Processador", searchQuery: "Processador AMD Ryzen 5 7600", minPrice: 1000, maxPrice: 1500, reason: "Passaporte de entrada para a Nova Geração (AM5). Monstruoso em jogos, esquenta pouco e suporta memórias DDR5." },
        { componentName: "Placa Mãe", searchQuery: "Placa Mae B650M", minPrice: 800, maxPrice: 1200, reason: "A plataforma do futuro. O soquete AM5 garante que você poderá trocar de processador nos próximos 5 anos sem precisar trocar a placa mãe." },
        { componentName: "Memória RAM", searchQuery: "Memoria RAM 32GB DDR5 5200MHz", minPrice: 600, maxPrice: 900, reason: "O dobro de velocidade de um PC padrão. 32GB te preparam para o futuro dos games em mundo aberto e simuladores." },
        { componentName: "Placa de Vídeo", searchQuery: "Placa de Video RTX 4060", minPrice: 1800, maxPrice: 2500, reason: "Tecnologia absurda: Possui DLSS 3.0 e Frame Generation, tecnologias de IA que dobram os FPS magicamente." },
        { componentName: "SSD", searchQuery: "SSD 1TB NVMe M.2 Gen4", minPrice: 400, maxPrice: 600, reason: "Interface PCIe Gen4 atinge velocidades de leitura colossais (7000MB/s), sumindo com as telas de Loading." },
        { componentName: "Fonte", searchQuery: "Fonte 650W 80 Plus", minPrice: 300, maxPrice: 500, reason: "Uma fonte robusta é mandatória para segurar picos de energia instantâneos de placas NVIDIA da série 4000." }
      ];
    }

    // Ultra-End Gaming / Workstation (LGA1700 / AM5 + DDR5)
    return [
      { componentName: "Processador", searchQuery: "Processador AMD Ryzen 7 7800X3D", minPrice: 2000, maxPrice: 3000, reason: "Simplesmente o melhor processador para jogos do mundo. Possui 3D V-Cache, uma memória gigante grudada no chip que destrói em FPS." },
      { componentName: "Placa Mãe", searchQuery: "Placa Mae X670E", minPrice: 1500, maxPrice: 2500, reason: "Série Extreme. Traz PCI-Express 5.0, dissipadores imensos de calor e VRM preparado para overclock brutal." },
      { componentName: "Memória RAM", searchQuery: "Memoria RAM 64GB DDR5 6000MHz", minPrice: 1200, maxPrice: 1800, reason: "64GB a 6000MHz elimina qualquer lentidão concebível, perfeito para editar vídeos pesados, streamar e jogar simultaneamente." },
      { componentName: "Placa de Vídeo", searchQuery: "Placa de Video RTX 4070 Ti", minPrice: 5000, maxPrice: 6500, reason: "Potência descomunal. Feita para jogar em resoluções 4K ou Monitores Ultrawide com todos os gráficos e Ray Tracing no máximo." },
      { componentName: "SSD", searchQuery: "SSD 2TB NVMe M.2 Gen4", minPrice: 800, maxPrice: 1200, reason: "2TB de armazenamento topo de linha. Muito espaço para sua biblioteca da Steam inteira sem desinstalar nada." },
      { componentName: "Fonte", searchQuery: "Fonte 850W 80 Plus Gold", minPrice: 600, maxPrice: 900, reason: "Selo Gold significa eficiência extrema na conversão de energia, gerando menos calor e mantendo a máquina fria e estável." }
    ];
  }
}
