import { HardwareEngine } from './src/services/HardwareEngine';
import { ScraperService } from './src/services/ScraperService';

async function run() {
    const intent = { budget: 3000, category: 'gaming' as const };
    console.log('Building setup for:', intent);
    const parts = HardwareEngine.buildSetup(intent);
    console.log('Parts to search:', parts.map(p => `${p.componentName} (Max: ${p.maxPrice})`));
    
    const scraper = new ScraperService();
    try {
        await scraper.searchPartsStream(parts, (part) => {
            console.log('FOUND:', part.name, 'R$', part.price);
        });
        console.log('Success!');
    } catch (e: any) {
        console.error('FAILED:', e.message);
    }
}

run();
