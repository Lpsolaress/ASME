import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

export default function AnalysisLoader() {
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState([
    { id: 1, text: 'Calculando potencial de automatización', completed: false },
    { id: 2, text: 'Evaluando impacto en ROI', completed: false },
    { id: 3, text: 'Generando hoja de ruta de IA', completed: false },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        const next = prev + 1;
        
        // Update steps based on progress
        if (next > 30) setSteps(s => s.map(x => x.id === 1 ? { ...x, completed: true } : x));
        if (next > 65) setSteps(s => s.map(x => x.id === 2 ? { ...x, completed: true } : x));
        if (next > 90) setSteps(s => s.map(x => x.id === 3 ? { ...x, completed: true } : x));
        
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] z-[100] flex flex-col items-center justify-center font-mono">
      {/* Top Left Coordinates */}
      <div className="absolute top-8 left-8 text-[10px] text-white/20 space-y-1">
        <div>COCRD_X: 42.921</div>
        <div>COCRD_Y: 71.002</div>
        <div>STATUS: ANALYTICS_ACTIVE</div>
      </div>

      {/* Top Right Accent */}
      <div className="absolute top-8 right-8 w-16 h-[2px] bg-white/20" />

      <div className="max-w-2xl w-full px-12 space-y-12">
        <div className="text-center space-y-6">
          <div className="text-[10px] font-black tracking-[0.4em] text-secondary uppercase">
            SYSTEM ENGINE V2.4.0
          </div>
          <h2 className="text-5xl font-black text-white tracking-tighter">
            Analizando tus actividades...
          </h2>
        </div>

        {/* Progress Bar Container */}
        <div className="space-y-3">
          <div className="w-full h-[6px] bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-secondary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-black tracking-widest">
            <span className="text-white/40">PROCESSING DATA STREAM</span>
            <span className="text-white">{progress}%</span>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-6 pt-4">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center space-x-6 group">
              <div className={`w-8 h-8 border-2 flex items-center justify-center transition-all duration-500 ${
                step.completed 
                ? 'bg-secondary border-secondary' 
                : 'border-white/20 bg-transparent'
              }`}>
                {step.completed ? (
                  <Check className="w-5 h-5 text-primary stroke-[4px]" />
                ) : (
                  <div className="w-full h-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-secondary/0 via-secondary/20 to-secondary/0 animate-shimmer" />
                  </div>
                )}
              </div>
              <span className={`text-lg font-bold tracking-tight transition-all duration-500 ${
                step.completed ? 'text-white' : 'text-white/40'
              }`}>
                {step.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Right Brand */}
      <div className="absolute bottom-8 right-8 text-right space-y-3">
        <div className="grid grid-cols-2 gap-1 ml-auto w-fit">
          <div className="w-2 h-2 bg-white/10" />
          <div className="w-2 h-2 bg-white/10" />
          <div className="w-2 h-2 bg-secondary" />
          <div className="w-2 h-2 bg-white/10" />
        </div>
        <div className="text-[10px] font-black tracking-[0.2em] text-white/20 uppercase">
          ASME_DIGITAL_KERNEL_READY
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(200%) rotate(45deg); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
}
