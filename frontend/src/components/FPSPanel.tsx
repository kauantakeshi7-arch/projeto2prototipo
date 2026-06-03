import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Gauge } from 'lucide-react';

export interface GameFPS {
  game: string;
  fps: number;
  quality: string;
}

interface FPSPanelProps {
  metrics: GameFPS[];
}

export function FPSPanel({ metrics }: FPSPanelProps) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="pt-6 mt-6 border-t border-[#222222]"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-500/10 rounded-lg">
          <Gamepad2 className="text-emerald-500 w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Performance Estimada</h2>
          <p className="text-sm text-slate-400">FPS médio baseado na Placa de Vídeo em 1080p</p>
        </div>
      </div>

      <div className="space-y-5">
        {metrics.map((m, idx) => {
          // Calcula a largura da barra (Max 300 FPS para a barra não estourar)
          const fillPercentage = Math.min(100, Math.max(5, (m.fps / 200) * 100));
          
          return (
            <div key={idx} className="relative">
              <div className="flex justify-between items-end mb-1">
                <span className="text-sm font-medium text-slate-200">{m.game}</span>
                <span className="text-xs text-slate-500">{m.quality}</span>
              </div>
              
              <div className="w-full h-6 bg-[#0a0a0a] rounded-full overflow-hidden border border-[#222222] relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${fillPercentage}%` }}
                  transition={{ duration: 1.5, delay: 0.8 + (idx * 0.2), ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                />
                
                <div className="absolute inset-0 flex items-center px-3 justify-end">
                  <span className="text-xs font-bold text-white flex items-center gap-1 drop-shadow-md">
                    {m.fps} FPS <Gauge className="w-3 h-3 opacity-70" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
