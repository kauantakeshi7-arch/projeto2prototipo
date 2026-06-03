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
}

export function PartCard({ part }: PartCardProps) {
  const [showReason, setShowReason] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-[#0f1115] border border-[#1e222a] rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg hover:border-[#2a2f3a] transition-colors"
    >
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="w-16 h-16 bg-black rounded-lg p-2 flex-shrink-0 flex items-center justify-center border border-[#1e222a]">
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
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
            <Cpu className="w-3 h-3" /> {part.component}
          </span>
          <h3 className="text-slate-200 font-medium text-sm line-clamp-2 md:line-clamp-none">{part.name}</h3>
          
          <button 
            onClick={() => setShowReason(!showReason)}
            className="flex items-center gap-1 text-xs text-slate-400 mt-2 hover:text-emerald-400 transition-colors w-fit"
          >
            <Lightbulb className="w-3 h-3" />
            {showReason ? "Ocultar motivo" : "Por que escolhi esta peça?"}
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
                <div className="bg-[#16191f] border border-[#1e222a] p-3 rounded-md text-xs text-slate-300 italic border-l-2 border-l-emerald-500">
                  "{part.reason}"
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-auto border-t md:border-t-0 border-[#1e222a] pt-4 md:pt-0 mt-2 md:mt-0">
        <span className="text-white font-bold text-lg whitespace-nowrap">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(part.price)}
        </span>
        <a 
          href={part.link.startsWith('http') ? part.link : `https://${part.link}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs bg-[#1e222a] hover:bg-[#2a2f3a] text-slate-300 py-1 px-3 rounded-full transition-colors flex items-center gap-1 mt-0 md:mt-2"
        >
          Comprar <span className="text-emerald-500">↗</span>
        </a>
      </div>
    </motion.div>
  );
}
