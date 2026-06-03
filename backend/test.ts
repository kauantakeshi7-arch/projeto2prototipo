import { HardwareEngine } from './src/services/HardwareEngine';
import { ScraperService } from './src/services/ScraperService';

async function runTest(budget: number) {
    console.log(`\n\n=== TESTANDO BUDGET: ${budget} ===`);
    const intent = { budget, category: 'gaming' as const };
    const parts = HardwareEngine.buildSetup(intent);
    
    const scraper = new ScraperService();
    try {
        await scraper.searchPartsStream(parts, (part) => {
            console.log(`FOUND: ${part.component} - ${part.name} (R$ ${part.price})`);
        });
        console.log(`Success for budget ${budget}!`);
    } catch (e: any) {
        console.error(`FAILED for budget ${budget}:`, e.message);
    }
}

async function runAll() {
    await runTest(2000);
    await runTest(4000);
    await runTest(6000);
}

runAll();
