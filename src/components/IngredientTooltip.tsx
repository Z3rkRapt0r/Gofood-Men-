'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '@/hooks/useTranslation';

interface IngredientInfo {
  it: string;
  en: string;
}

interface IngredientTooltipProps {
  term: string;
  info: IngredientInfo;
}

export default function IngredientTooltip({ term, info }: IngredientTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [arrowOffset, setArrowOffset] = useState(50); // Posizione freccia in percentuale
  const [mounted, setMounted] = useState(false);
  const { language } = useTranslation();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        spanRef.current &&
        !spanRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleResize = () => {
      // Chiudi il tooltip al resize/rotazione per evitare problemi di posizionamento
      if (isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [isOpen]);

  const handleClick = () => {
    if (!spanRef.current) return;

    const rect = spanRef.current.getBoundingClientRect();
    const tooltipWidth = 224; // 56 * 4 = 224px (w-56 in tailwind)
    const margin = 16; // Margine di sicurezza dai bordi

    // Posizione centrale ideale del tooltip
    const idealLeft = rect.left + rect.width / 2 + window.scrollX;

    // Calcola i limiti dello schermo
    const minLeft = margin;


    // Aggiusta la posizione se esce dai bordi
    let finalLeft = idealLeft;
    let arrowPos = 50; // Posizione della freccia in percentuale (default: centro)

    if (idealLeft - tooltipWidth / 2 < minLeft) {
      // Tooltip esce a sinistra
      finalLeft = tooltipWidth / 2 + margin;
      // Calcola dove deve puntare la freccia (offset dall'ideale)
      arrowPos = ((idealLeft - margin) / tooltipWidth) * 100;
    } else if (idealLeft + tooltipWidth / 2 > window.innerWidth - margin) {
      // Tooltip esce a destra
      finalLeft = window.innerWidth - tooltipWidth / 2 - margin;
      // Calcola dove deve puntare la freccia
      arrowPos = ((idealLeft - (window.innerWidth - tooltipWidth - margin)) / tooltipWidth) * 100;
    }

    // Limita la freccia tra 10% e 90% per non farla uscire dal tooltip
    arrowPos = Math.max(10, Math.min(90, arrowPos));

    setPosition({
      top: rect.top + window.scrollY,
      left: finalLeft,
    });
    setArrowOffset(arrowPos);
    setIsOpen(!isOpen);
  };

  const tooltip = mounted && isOpen ? (
    <div
      ref={tooltipRef}
      style={{
        position: 'absolute',
        top: `${position.top - 8}px`,
        left: `${position.left}px`,
        transform: 'translate(-50%, -100%)',
      }}
      className="w-56 z-[9999] animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      {/* Freccia verso il basso - posizionata dinamicamente */}
      <div
        className="absolute top-full transform -translate-x-1/2 -mt-px"
        style={{ left: `${arrowOffset}%` }}
      >
        <div className="border-6 border-transparent border-t-white" />
      </div>
      <div
        className="absolute top-full transform -translate-x-1/2 -mt-0.5"
        style={{ left: `${arrowOffset}%` }}
      >
        <div className="border-6 border-transparent border-t-[#D4AF37]/20" />
      </div>

      {/* Contenuto tooltip */}
      <div className="bg-white rounded-lg shadow-lg border border-[#D4AF37]/20 p-3 relative">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="pr-5 text-gray-700 text-xs leading-relaxed">
          {info[language]}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <span
        ref={spanRef}
        onClick={handleClick}
        className="underline decoration-dotted decoration-[#D4AF37] cursor-help hover:text-[#D4AF37] transition-colors"
        title={language === 'it' ? 'Clicca per info ingredienti' : 'Click for ingredient info'}
      >
        {term}
      </span>
      {mounted && tooltip && createPortal(tooltip, document.body)}
    </>
  );
}

