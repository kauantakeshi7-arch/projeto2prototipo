import { NextRequest, NextResponse } from 'next/server';
import { HardwareEngine } from '@/services/HardwareEngine';
import { BenchmarkEngine } from '@/services/BenchmarkEngine';
import { NLPService } from '@/services/NLPService';

export async function POST(req: NextRequest) {
    let budgetQuery = '';
    
    try {
        const body = await req.json();
        budgetQuery = body.budgetQuery;
    } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!budgetQuery) {
        return NextResponse.json({ error: 'Falta o parâmetro budgetQuery' }, { status: 400 });
    }

    // Usando TransformStream para criar o SSE
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const writeSSE = async (data: any) => {
        await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    };

    // A resposta deve ser retornada imediatamente com o ReadableStream
    const response = new NextResponse(stream.readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });

    // Função assíncrona que executa o pipeline real
    const runPipeline = async () => {
        try {
            await writeSSE({ status: 'NLP_PARSING', message: 'Analisando requisitos físicos e matemáticos...' });
            await new Promise(r => setTimeout(r, 600));

            const nlpService = new NLPService();
            const parsedIntent = await nlpService.extractIntent(budgetQuery);

            await writeSSE({ status: 'ENGINE_BUILDING', message: 'Calculando a melhor combinação no banco de dados...' });
            await new Promise(r => setTimeout(r, 800));

            const bestCombo = HardwareEngine.buildSetup(parsedIntent);
            const totalPrice = bestCombo.reduce((sum, p) => sum + p.price, 0);

            await writeSSE({ status: 'SCRAPING', message: 'Recuperando melhores ofertas...', setupName: parsedIntent.category === 'gaming' ? 'PC Gamer Customizado' : 'PC Customizado' });
            await new Promise(r => setTimeout(r, 600));

            for (const part of bestCombo) {
                await writeSSE({ status: 'PART_FOUND', part });
                await new Promise(r => setTimeout(r, 300));
            }

            const performanceMetrics = BenchmarkEngine.calculate(bestCombo);

            await writeSSE({ status: 'DONE', totalPrice, performanceMetrics });
        } catch (error: any) {
            await writeSSE({ status: 'ERROR', message: error.message });
        } finally {
            await writer.close();
        }
    };

    // Inicia o processamento no background sem travar o retorno do stream
    runPipeline();

    return response;
}
