export interface CatalogPartDef {
    id: string;
    type: 'CPU' | 'GPU' | 'MB' | 'RAM' | 'SSD' | 'PSU' | 'CASE';
    socket?: 'AM4' | 'AM5'; // Para compatibilidade CPU/MB
    ramType?: 'DDR4' | 'DDR5'; // Para compatibilidade MB/RAM
    hasIntegratedGraphics?: boolean; // Para CPUs
    tier: number; // 1 (Entry), 2 (Mid), 3 (High), 4 (Enthusiast)
    searchQuery: string;
}

export const CATALOG_PARTS: CatalogPartDef[] = [
    // === CPUs ===
    { id: 'cpu_4600g', type: 'CPU', socket: 'AM4', hasIntegratedGraphics: true, tier: 1, searchQuery: 'Processador AMD Ryzen 5 4600G' },
    { id: 'cpu_5600g', type: 'CPU', socket: 'AM4', hasIntegratedGraphics: true, tier: 2, searchQuery: 'Processador AMD Ryzen 5 5600G' },
    { id: 'cpu_5500', type: 'CPU', socket: 'AM4', tier: 2, searchQuery: 'Processador AMD Ryzen 5 5500' },
    { id: 'cpu_5600', type: 'CPU', socket: 'AM4', tier: 3, searchQuery: 'Processador AMD Ryzen 5 5600 ' },
    { id: 'cpu_5700x3d', type: 'CPU', socket: 'AM4', tier: 4, searchQuery: 'Processador AMD Ryzen 7 5700X3D' },

    // === Placas Mãe ===
    { id: 'mb_a520m', type: 'MB', socket: 'AM4', ramType: 'DDR4', tier: 1, searchQuery: 'Placa Mae A520M' },
    { id: 'mb_b450m', type: 'MB', socket: 'AM4', ramType: 'DDR4', tier: 2, searchQuery: 'Placa Mae B450M' },
    { id: 'mb_b550m', type: 'MB', socket: 'AM4', ramType: 'DDR4', tier: 3, searchQuery: 'Placa Mae B550M' },

    // === RAM ===
    { id: 'ram_8gb_ddr4', type: 'RAM', ramType: 'DDR4', tier: 1, searchQuery: 'Memoria 8GB DDR4 3200' },
    { id: 'ram_16gb_ddr4', type: 'RAM', ramType: 'DDR4', tier: 2, searchQuery: 'Memoria 16GB DDR4 3200' },
    { id: 'ram_32gb_ddr4', type: 'RAM', ramType: 'DDR4', tier: 3, searchQuery: 'Memoria 32GB DDR4 3200' },

    // === SSD ===
    { id: 'ssd_500gb', type: 'SSD', tier: 1, searchQuery: 'SSD 500GB NVMe M.2' },
    { id: 'ssd_1tb', type: 'SSD', tier: 2, searchQuery: 'SSD 1TB NVMe M.2' },
    { id: 'ssd_2tb', type: 'SSD', tier: 4, searchQuery: 'SSD 2TB NVMe M.2' },

    // === GPU ===
    { id: 'gpu_rx6600', type: 'GPU', tier: 1, searchQuery: 'Placa de Video RX 6600 8GB' },
    { id: 'gpu_rtx4060', type: 'GPU', tier: 2, searchQuery: 'Placa de Video RTX 4060 8GB' },
    { id: 'gpu_rtx4060ti', type: 'GPU', tier: 3, searchQuery: 'Placa de Video RTX 4060 Ti' },
    { id: 'gpu_rtx4070', type: 'GPU', tier: 4, searchQuery: 'Placa de Video RTX 4070' },

    // === PSU ===
    { id: 'psu_500w', type: 'PSU', tier: 1, searchQuery: 'Fonte 500W 80 Plus' },
    { id: 'psu_600w', type: 'PSU', tier: 2, searchQuery: 'Fonte 600W 80 Plus MSI' },
    { id: 'psu_650w', type: 'PSU', tier: 3, searchQuery: 'Fonte 650W 80 Plus MSI' },
    { id: 'psu_750w', type: 'PSU', tier: 4, searchQuery: 'Fonte 750W 80 Plus MSI' },

    // === CASE ===
    { id: 'case_office', type: 'CASE', tier: 1, searchQuery: 'Gabinete ATX M-ATX' },
    { id: 'case_gamer', type: 'CASE', tier: 2, searchQuery: 'Gabinete Gamer Ninja' },
    { id: 'case_premium', type: 'CASE', tier: 3, searchQuery: 'Gabinete Gamer Montech' }
];
