import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

export interface PCPart {
  component: string;
  name: string;
  price: number;
  link: string;
  photo: string;
  reason: string;
}

interface PartCardProps {
  part: PCPart;
  index?: number;
}

export function PartCard({ part, index = 0 }: PartCardProps) {
  const [showReason, setShowReason] = useState(false);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.1, type: "spring", stiffness: 100 }}
      className="bg-[#0a0a0a] border border-[#222222] rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-[#333333] transition-colors"
    >
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="w-16 h-16 bg-[#111111] rounded-xl p-2 flex-shrink-0 flex items-center justify-center border border-[#222222]">
          {part.photo ? (
            <Image 
              src={part.photo} 
              alt={part.component} 
              width={48} 
              height={48} 
              className="object-contain" 
              unoptimized
            />
          ) : (
            <Cpu className="text-emerald-500 w-8 h-8" />
          )}
        </div>
        
        <div className="flex flex-col flex-grow">
          <span className="text-emerald-500 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Cpu className="w-3 h-3" /> {part.component}
          </span>
          <h3 className="text-slate-100 font-semibold text-sm md:text-base leading-snug">{part.name}</h3>
          
          <button 
            onClick={() => setShowReason(!showReason)}
            className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 hover:text-emerald-400 transition-colors w-fit font-medium"
          >
            <Lightbulb className="w-3 h-3" />
            {showReason ? "Ocultar motivo" : "Por que a IA escolheu essa peça para o seu &quot;setup&quot;?"}
            {showReason ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <AnimatePresence>
            {showReason && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-[#111111] border border-[#222222] p-3 md:p-4 rounded-xl text-xs md:text-sm text-slate-300 italic border-l-2 border-l-emerald-500 shadow-inner">
                  &quot;{part.reason}&quot;
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-auto border-t md:border-t-0 border-[#222222] pt-4 md:pt-0 mt-2 md:mt-0">
        <span className="text-white font-extrabold text-lg md:text-xl whitespace-nowrap tracking-tight">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(part.price)}
        </span>
        <a 
          href={part.link.startsWith('http') ? part.link : `https://${part.link}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-0 md:mt-2 text-xs font-bold bg-transparent border border-[#333333] hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 py-1.5 px-4 rounded-full transition-all flex items-center gap-1.5"
        >
          Comprar <span className="text-emerald-500">↗</span>
        </a>
      </div>
    </motion.div>
  );
}
