export interface PCPartDefinition {
  componentName: string;
  searchQuery?: string;
  searchQueries?: string[];
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
        { componentName: "Processador", searchQueries: ["Processador AMD Ryzen 5 4600G", "Processador AMD Ryzen 5 5600G", "Processador AMD Ryzen 3 3200G"], minPrice: 300, maxPrice: 800, reason: "Processador com vídeo integrado forte (Radeon Graphics), ideal para cortar o custo absurdo de uma placa de vídeo dedicada." },
        { componentName: "Placa Mãe", searchQueries: ["Placa Mae A520M", "Placa Mae A320M", "Placa Mae B450M"], minPrice: 300, maxPrice: 500, reason: "Placa mãe de entrada com soquete AM4. Cumpre o básico sem desperdiçar dinheiro em overclocking." },
        { componentName: "Memória RAM", searchQueries: ["Memoria Kingston Fury Beast 16GB DDR4", "Memoria Kingston Fury Beast 8GB DDR4", "Memoria 8GB DDR4 3200MHz"], minPrice: 150, maxPrice: 800, reason: "Infelizmente os preços das memórias dispararam no mercado. Tentamos 16GB, mas se faltar orçamento, pegamos 8GB para garantir o PC funcionando." },
        { componentName: "SSD", searchQueries: ["SSD Kingston 500GB NVMe", "SSD Kingston A400 240GB", "SSD 240GB Sata"], minPrice: 150, maxPrice: 500, reason: "O objetivo é NVMe 500GB, mas em caso de crise caímos para 240GB SATA para garantir que coube no orçamento." },
        { componentName: "Fonte", searchQueries: ["Fonte 500W 80 Plus", "Fonte 400W 80 Plus", "Fonte 400W"], minPrice: 150, maxPrice: 350, reason: "Selo 80 Plus garante eficiência energética. Tentamos 500W para sobrar, mas 400W segura PCs de entrada." },
        { componentName: "Gabinete", searchQueries: ["Gabinete Gamer", "Gabinete ATX"], minPrice: 100, maxPrice: 250, reason: "Escolha baseada em melhor circulação de ar, prevenindo superaquecimento." }
      ];
    }

    // Mid-Range Gaming (AM4 + DDR4 + GPU Dedicada)
    if (b < 5500) {
      return [
        { componentName: "Processador", searchQueries: ["Processador AMD Ryzen 5 5600", "Processador AMD Ryzen 5 5500"], minPrice: 500, maxPrice: 1000, reason: "Rei absoluto do custo-benefício. Seus 6 núcleos são velozes o suficiente para não dar gargalo em 99% das placas de vídeo intermediárias." },
        { componentName: "Placa Mãe", searchQueries: ["Placa Mae MSI B550M", "Placa Mae Asus B550M", "Placa Mae Gigabyte B550M", "Placa Mae B550M"], minPrice: 500, maxPrice: 900, reason: "Chipset B550 libera o PCI-Express 4.0. Priorizamos marcas renomadas (MSI, Asus, Gigabyte) para garantir um VRM durável." },
        { componentName: "Memória RAM", searchQueries: ["Memoria Kingston Fury Beast 16GB DDR4", "Memoria Corsair Vengeance 16GB DDR4", "Memoria 16GB DDR4 3200MHz"], minPrice: 200, maxPrice: 400, reason: "16GB é a zona de conforto para rodar jogos AAA e ter o Discord/Navegador aberto sem travamentos." },
        { componentName: "Placa de Vídeo", searchQueries: ["Placa de Video RX 6600 8GB Asus", "Placa de Video RX 6600 8GB MSI", "Placa de Video RX 6600 8GB Gigabyte", "Placa de Video RX 6600"], minPrice: 1200, maxPrice: 1800, reason: "Bate as placas da Nvidia na mesma faixa de preço. Com 8GB de VRAM, é a melhor escolha atual para rodar tudo no Ultra em 1080p." },
        { componentName: "SSD", searchQueries: ["SSD Kingston NV2 1TB", "SSD WD Green 1TB NVMe", "SSD 1TB NVMe M.2"], minPrice: 300, maxPrice: 550, reason: "Jogos hoje pesam 100GB+. Com 1TB NVMe, você não sofre por espaço e tem carregamentos quase instantâneos." },
        { componentName: "Fonte", searchQueries: ["Fonte MSI 600W", "Fonte Corsair 600W", "Fonte XPG 600W", "Fonte 600W 80 Plus"], minPrice: 250, maxPrice: 450, reason: "Fontes seguras impedem curtos-circuitos. Filtramos apenas marcas Premium (MSI, Corsair, XPG) para proteger sua placa de vídeo." }
      ];
    }

    // High-End Gaming (AM5 + DDR5 + GPU Forte)
    if (b < 8000) {
      return [
        { componentName: "Processador", searchQueries: ["Processador AMD Ryzen 5 7600", "Processador AMD Ryzen 5 7600X"], minPrice: 1000, maxPrice: 1600, reason: "Passaporte de entrada para a Nova Geração (AM5). Monstruoso em jogos, esquenta pouco e suporta memórias DDR5." },
        { componentName: "Placa Mãe", searchQueries: ["Placa Mae MSI B650M", "Placa Mae Asus B650M", "Placa Mae Gigabyte B650M"], minPrice: 800, maxPrice: 1400, reason: "A plataforma do futuro. Marcas de alta qualidade para garantir que o soquete AM5 dure anos com total estabilidade térmica." },
        { componentName: "Memória RAM", searchQueries: ["Memoria Kingston Fury Beast 32GB DDR5", "Memoria Corsair Vengeance 32GB DDR5"], minPrice: 600, maxPrice: 1000, reason: "O dobro de velocidade de um PC padrão. 32GB te preparam para o futuro dos games em mundo aberto e simuladores." },
        { componentName: "Placa de Vídeo", searchQueries: ["Placa de Video RTX 4060 Asus", "Placa de Video RTX 4060 MSI", "Placa de Video RTX 4060 Gigabyte", "Placa de Video RTX 4060"], minPrice: 1800, maxPrice: 2600, reason: "Tecnologia absurda: Possui DLSS 3.0 e Frame Generation, tecnologias de IA que dobram os FPS magicamente." },
        { componentName: "SSD", searchQueries: ["SSD Kingston NV2 1TB Gen4", "SSD XPG 1TB Gen4", "SSD 1TB NVMe M.2 Gen4"], minPrice: 400, maxPrice: 650, reason: "Interface PCIe Gen4 atinge velocidades de leitura colossais (7000MB/s), sumindo com as telas de Loading." },
        { componentName: "Fonte", searchQueries: ["Fonte MSI 650W", "Fonte Corsair 650W", "Fonte XPG 650W", "Fonte 650W 80 Plus"], minPrice: 300, maxPrice: 550, reason: "Uma fonte robusta de marca consolidada é mandatória para segurar picos de energia de placas NVIDIA da série 4000." }
      ];
    }

    // Ultra-End Gaming / Workstation (LGA1700 / AM5 + DDR5)
    return [
      { componentName: "Processador", searchQueries: ["Processador AMD Ryzen 7 7800X3D"], minPrice: 2000, maxPrice: 3500, reason: "Simplesmente o melhor processador para jogos do mundo. Possui 3D V-Cache, uma memória gigante grudada no chip que destrói em FPS." },
      { componentName: "Placa Mãe", searchQueries: ["Placa Mae MSI X670E", "Placa Mae Asus X670E", "Placa Mae Gigabyte X670E", "Placa Mae X670E"], minPrice: 1500, maxPrice: 2800, reason: "Série Extreme. Traz PCI-Express 5.0, dissipadores imensos de calor e VRM preparado para overclock brutal com segurança." },
      { componentName: "Memória RAM", searchQueries: ["Memoria Corsair Dominator 64GB DDR5", "Memoria Kingston Fury 64GB DDR5"], minPrice: 1200, maxPrice: 2200, reason: "64GB elimina qualquer lentidão concebível, perfeito para editar vídeos pesados, streamar e jogar simultaneamente." },
      { componentName: "Placa de Vídeo", searchQueries: ["Placa de Video RTX 4070 Ti Super", "Placa de Video RTX 4070 Ti", "Placa de Video RTX 4080"], minPrice: 5000, maxPrice: 8500, reason: "Potência descomunal. Feita para jogar em resoluções 4K ou Monitores Ultrawide com todos os gráficos e Ray Tracing no máximo." },
      { componentName: "SSD", searchQueries: ["SSD Samsung 990 Pro 2TB", "SSD WD Black SN850X 2TB", "SSD Kingston Fury 2TB"], minPrice: 800, maxPrice: 1500, reason: "2TB de armazenamento topo de linha das marcas mais rápidas do planeta (Samsung, WD, Kingston). Velocidade extrema." },
      { componentName: "Fonte", searchQueries: ["Fonte Corsair 850W 80 Plus Gold", "Fonte MSI 850W 80 Plus Gold", "Fonte XPG 850W 80 Plus Gold"], minPrice: 600, maxPrice: 1200, reason: "Selo Gold significa eficiência extrema. Exigimos marcas tier A (Corsair, MSI) para alimentar um monstro desses com segurança de nível industrial." }
    ];
  }
}
