const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, 'backend', 'src', 'catalog', 'catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// 1. Processar itens existentes
for (const key in catalog) {
    const item = catalog[key];
    const name = item.name.toUpperCase();
    
    // Sockets
    if (name.includes('AM5') || name.includes('A620') || name.includes('B850') || name.includes('8600G')) {
        item.socket = 'AM5';
    } else if (name.includes('AM4') || name.includes('A520') || name.includes('B450') || name.includes('B550') || name.includes('5600') || name.includes('5500') || name.includes('5700')) {
        item.socket = 'AM4';
    }

    // RAM Type
    if (name.includes('DDR5')) {
        item.ramType = 'DDR5';
    } else if (name.includes('DDR4')) {
        item.ramType = 'DDR4';
    }
}

// 2. Injetar Placa Mãe AM4 (Já que o scraper não pegou nenhuma de verdade)
catalog['mb_a520m_am4'] = {
    id: 'mb_a520m_am4',
    component: 'MB',
    name: 'Placa-Mãe Gigabyte A520M K V2, AMD AM4, mATX, DDR4',
    price: 389.99,
    socket: 'AM4',
    ramType: 'DDR4',
    link: 'https://www.kabum.com.br/',
    photo: 'https://images.kabum.com.br/produtos/fotos/428245/placa-mae-gigabyte-a520m-k-v2-amd-am4-matx-ddr4-rev-1-0-_1678888062_m.jpg'
};
catalog['mb_b550m_am4'] = {
    id: 'mb_b550m_am4',
    component: 'MB',
    name: 'Placa-Mãe MSI B550M PRO-VDH WIFI, AMD AM4, mATX, DDR4',
    price: 699.99,
    socket: 'AM4',
    ramType: 'DDR4',
    link: 'https://www.kabum.com.br/',
    photo: 'https://images.kabum.com.br/produtos/fotos/114338/placa-mae-msi-b550m-pro-vdh-wifi-amd-am4-matx_1597843477_m.jpg'
};

// 3. Injetar Memória RAM DDR5 (Já que o scraper não pegou)
catalog['ram_16gb_ddr5'] = {
    id: 'ram_16gb_ddr5',
    component: 'RAM',
    name: 'Memória Corsair Vengeance, 16GB, 5200MHz, DDR5, C40, Preto',
    price: 499.99,
    ramType: 'DDR5',
    link: 'https://www.kabum.com.br/',
    photo: 'https://images.kabum.com.br/produtos/fotos/383400/memoria-corsair-vengeance-16gb-5200mhz-ddr5-c40-preto-cmk16gx5m1b5200c40_1664369792_m.jpg'
};
catalog['ram_32gb_ddr5'] = {
    id: 'ram_32gb_ddr5',
    component: 'RAM',
    name: 'Memória Kingston Fury Beast, 32GB (2x16GB), 6000MHz, DDR5',
    price: 1099.99,
    ramType: 'DDR5',
    link: 'https://www.kabum.com.br/',
    photo: 'https://images.kabum.com.br/produtos/fotos/372370/memoria-kingston-fury-beast-rgb-16gb-6000mhz-ddr5-cl40-preto-kf560c40bbak2-32_1660312061_m.jpg'
};

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
console.log('Catálogo corrigido e salvo!');
