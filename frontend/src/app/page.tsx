"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Cpu } from 'lucide-react';
import { PartCard, PCPart } from '@/components/PartCard';
import { FPSPanel, GameFPS } from '@/components/FPSPanel';
import { AnimatePresence, motion } from 'framer-motion';

interface BuildData {
  setupName: string;
  totalPrice: number;
  parts: PCPart[];
  performanceMetrics?: GameFPS[];
  error?: string;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [buildData, setBuildData] = useState<BuildData | null>(null);
  const [isClient, setIsClient] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const executeBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setLoadingMessage('Inicializando construtor...');
    setBuildData({ setupName: '', totalPrice: 0, parts: [] });

    try {
      const response = await fetch('/api/build-pc-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budgetQuery: query }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`Erro na API (${response.status})`);
      }
      if (!response.body) throw new Error("Sem corpo de resposta");

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let boundary = buffer.indexOf('\n\n');
        while (boundary !== -1) {
          const chunk = buffer.slice(0, boundary).trim();
          buffer = buffer.slice(boundary + 2);
          boundary = buffer.indexOf('\n\n');

          if (chunk.startsWith('data: ')) {
            try {
              const jsonStr = chunk.replace(/^data:\s*/, '');
              const data = JSON.parse(jsonStr);
              
              if (data.status === 'NLP_PARSING' || data.status === 'ENGINE_BUILDING') {
                setLoadingMessage(data.message);
              } 
              else if (data.status === 'SCRAPING') {
                setLoadingMessage(data.message);
                setBuildData(prev => prev ? { ...prev, setupName: data.setupName } : null);
              }
              else if (data.status === 'PART_FOUND') {
                setBuildData(prev => {
                  if (!prev) return prev;
                  const exists = prev.parts.some(p => p.link === data.part.link);
                  if (exists) return prev;
                  return { ...prev, parts: [...prev.parts, data.part] };
                });
              }
              else if (data.status === 'DONE') {
                setBuildData(prev => prev ? { 
                  ...prev, 
                  totalPrice: data.totalPrice,
                  performanceMetrics: data.performanceMetrics 
                } : null);
                setLoading(false);
              }
              else if (data.status === 'ERROR') {
                setBuildData({ setupName: '', totalPrice: 0, parts: [], error: data.message });
                setLoading(false);
              }
            } catch (err) {
              console.error('Erro no parse do SSE:', err, 'Chunk com erro:', chunk);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Busca abortada pelo usuário.');
      } else {
        setBuildData({ setupName: '', totalPrice: 0, parts: [], error: "Erro ao conectar com o Servidor ou a conexão caiu." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-300 selection:bg-emerald-500/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        
        <header className={`transition-all duration-700 ease-in-out ${buildData || loading ? 'mb-8 mt-4' : 'mb-16 mt-12 md:mt-24'} text-center`}>
          <motion.div layout>
            <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 rounded-2xl mb-6 border border-emerald-500/20">
              <Cpu className="text-emerald-500 w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              AI PC Builder
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
              Diga o seu orçamento. O Arquiteto IA escolhe as melhores peças e o Buscador encontra os menores preços simultaneamente.
            </p>
          </motion.div>
        </header>

        <form onSubmit={executeBuild} className={`relative max-w-2xl mx-auto transition-all duration-700 ease-in-out ${buildData || loading ? 'mb-8 md:mb-12' : 'mb-16'}`}>
          <div className="relative flex items-center bg-[#111111] rounded-2xl border border-[#222222] focus-within:border-emerald-500/50 transition-colors shadow-2xl">
            <div className="pl-4 md:pl-6 shrink-0">
              <Search className="text-slate-500 w-5 h-5" />
            </div>
            <input 
              type="text" 
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ex: PC pra rodar Cyberpunk liso até R$ 8000"
              className="flex-1 min-w-0 bg-transparent border-none py-4 md:py-5 pl-3 md:pl-4 pr-2 md:pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0 text-base"
              disabled={loading}
            />
            <div className="pr-2 md:pr-3 shrink-0">
              <button 
                type="submit"
                disabled={loading || !query.trim()}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2.5 px-4 md:py-3 md:px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm md:text-base"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Montar Setup'}
              </button>
            </div>
          </div>
        </form>

        {(buildData || loading) && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
            
            {/* Esquerda: Painel Fixo (Dashboard) */}
            <div className="lg:col-span-4 lg:sticky lg:top-8 flex flex-col gap-6">
              <div className="bg-[#111111] rounded-3xl border border-[#222222] p-6 md:p-8 shadow-2xl">
                 <h2 className="text-xl font-bold text-white mb-4">
                   {buildData?.setupName || (loading ? 'Construindo PC...' : 'Setup Encontrado')}
                 </h2>
                 {loading && (
                   <div className="flex items-center gap-2 text-emerald-400 text-sm mb-6">
                     <Loader2 className="w-4 h-4 animate-spin" />
                     {loadingMessage}
                   </div>
                 )}
                 <div className="pt-4 border-t border-[#222222]">
                   <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-2">Custo Total Atual</span>
                   <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                     {isClient && buildData?.totalPrice && buildData.totalPrice > 0 
                       ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(buildData.totalPrice)
                       : 'R$ 0,00'
                     }
                   </span>
                 </div>
              </div>

              {!loading && buildData?.performanceMetrics && (
                <FPSPanel metrics={buildData.performanceMetrics} />
              )}
            </div>

            {/* Direita: Feed de Peças */}
            <div className="lg:col-span-8 bg-[#111111] rounded-3xl border border-[#222222] p-4 md:p-8 shadow-2xl min-h-[400px]">
               {buildData?.error ? (
                 <div className="text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-6 text-center font-medium">
                   {buildData.error}
                 </div>
               ) : (
                 <div className="space-y-4">
                   <AnimatePresence mode="popLayout">
                     {buildData?.parts.map((part, idx) => (
                       <PartCard key={idx} part={part} />
                     ))}
                   </AnimatePresence>
                   
                   {loading && (!buildData || buildData.parts.length === 0) && (
                     <div className="flex flex-col items-center justify-center h-[200px] text-slate-500">
                       <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500/50" />
                       <p className="text-sm">Buscando as melhores ofertas na Kabum...</p>
                     </div>
                   )}
                 </div>
               )}
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
