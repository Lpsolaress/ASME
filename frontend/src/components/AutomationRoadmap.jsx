import React from 'react';
import { Zap, Target, Cpu, TrendingUp } from "lucide-react";

export default function AutomationRoadmap({ suggestions }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h3 className="text-2xl font-black uppercase tracking-tight text-primary">RECOMENDACIONES DE AUTOMATIZACIÓN</h3>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Análisis basado en IA para la optimización de procesos industriales.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {suggestions.map((sugg, i) => {
          const percentage = 80 + Math.floor(Math.random() * 15);
          return (
            <div key={i} className="bg-white border-2 border-gray-100 rounded-2xl p-8 flex gap-8 items-center hover:border-secondary transition-all group relative overflow-hidden">
              {/* Progress Circle */}
              <div className="relative w-28 h-28 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-gray-50" />
                  <circle 
                    cx="56" 
                    cy="56" 
                    r="50" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    fill="transparent" 
                    strokeDasharray={314} 
                    strokeDashoffset={314 * (1 - percentage/100)} 
                    className="text-secondary" 
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-secondary">{percentage}%</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xl font-black text-primary uppercase tracking-tight group-hover:text-secondary transition-colors">
                    {sugg.action} en {sugg.activity_name}
                  </h4>
                  <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-2xl">
                    {sugg.reasoning}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-secondary text-[9px] font-black uppercase tracking-widest text-primary rounded-full">
                    {sugg.tool_type}
                  </span>
                  <span className="px-3 py-1 bg-secondary text-[9px] font-black uppercase tracking-widest text-primary rounded-full">
                    Industrial AI
                  </span>
                  {i % 2 === 0 && (
                    <span className="px-3 py-1 bg-secondary text-[9px] font-black uppercase tracking-widest text-primary rounded-full">
                      Predictive Model
                    </span>
                  )}
                </div>
              </div>

              {/* Priority Badge */}
              <div className="absolute bottom-4 left-40">
                <div className="bg-black text-white px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em]">
                  ALTA PRIORIDAD
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
