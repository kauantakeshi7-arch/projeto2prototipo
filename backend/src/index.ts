import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import { NLPService } from './services/NLPService';
import { HardwareEngine } from './services/HardwareEngine';
import { ScraperService } from './services/ScraperService';
import { BenchmarkEngine } from './services/BenchmarkEngine';

const app = express();
const PORT = process.env.PORT || 3001;

// Blindagem de Segurança 1: CORS restrito (em produção, mude o * para a URL do seu frontend)
app.use(cors({ origin: '*' }));

// Blindagem de Segurança 2: Limite no JSON contra DDoS (Poisoning)
app.use(express.json({ limit: '10kb' }));

// Inicialização dos Serviços Core
const nlpService = new NLPService();
const scraperService = new ScraperService();

/**
 * Novo Endpoint SSE (Server-Sent Events)
 * Retorna as peças em tempo real ao invés de esperar todas terminarem.
 */
app.post('/api/build-pc-stream', async (req: Request, res: Response) => {
  const { budgetQuery } = req.body;
  
  if (!budgetQuery || budgetQuery.length > 255) {
    return res.status(400).json({ error: 'Orçamento inválido ou texto muito longo.' });
  }

  // Configuração dos Headers para Streaming (SSE)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Estabelece a conexão imediatamente

  let isConnectionClosed = false;
  req.on('close', () => {
    console.log('[Sistema] req.on(close) disparado. Conexão TCP caiu? req.socket.destroyed:', req.socket.destroyed);
    if (req.socket.destroyed) {
      isConnectionClosed = true;
    }
  });

  try {
    res.write(`data: ${JSON.stringify({ status: 'NLP_PARSING', message: 'Analisando requisitos físicos e matemáticos...' })}\n\n`);
    
    // 1. NLP: Entende o texto e extrai o valor
    const intent = await nlpService.extractIntent(budgetQuery);
    console.log(`[NLP] Intenção mapeada:`, intent);
    
    if (isConnectionClosed) return res.end();
    res.write(`data: ${JSON.stringify({ status: 'ENGINE_BUILDING', message: 'Construindo o chassi lógico compatível (Sockets e Tiers)...' })}\n\n`);

    // 2. Motor Determinístico: Gera as queries absolutas
    const partsList = HardwareEngine.buildSetup(intent);
    
    if (isConnectionClosed) return res.end();
    res.write(`data: ${JSON.stringify({ status: 'SCRAPING', message: 'Buscando os melhores preços nas lojas (Tempo Real)...', setupName: 'PC Gamer Customizado (R$ ' + intent.budget + ')' })}\n\n`);

    // 3. Scraper Sequencial com Eventos
    const foundParts = await scraperService.searchPartsStream(partsList, (part) => {
      if (!isConnectionClosed) {
        // Envia cada peça assim que é encontrada
        res.write(`data: ${JSON.stringify({ status: 'PART_FOUND', part })}\n\n`);
      }
    });

    if (isConnectionClosed) return res.end();

    const totalPrice = foundParts.reduce((acc, curr) => acc + curr.price, 0);
    const performanceMetrics = BenchmarkEngine.calculate(foundParts);

    // 4. Finalização
    res.write(`data: ${JSON.stringify({ status: 'DONE', totalPrice, performanceMetrics })}\n\n`);
    res.end();

  } catch (error: any) {
    console.error('Erro no servidor SSE:', error);
    if (!isConnectionClosed) {
      res.write(`data: ${JSON.stringify({ status: 'ERROR', message: error.message || 'Falha crítica interna no servidor.' })}\n\n`);
      res.end();
    }
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Motor V5 rodando na porta ${PORT}`);
});
