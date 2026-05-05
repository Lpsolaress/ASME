import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, ChevronRight } from "lucide-react";

export default function AnalyzedTaskList({ activities, analysis, onSelectTask, onBack }) {
  const totalMinutesDaily = activities.reduce((sum, act) => sum + ((act.time_unit || 0) * (act.volume_daily || 0)), 0);

  return (
    <div className="max-w-[1200px] mx-auto pb-40 animate-in fade-in duration-700 pt-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 px-2 gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Tareas Analizadas</h1>
          <p className="text-gray-500 font-medium">Selecciona una tarea para ver su reporte individual.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
              variant="outline" 
              onClick={onBack}
              className="rounded-xl px-6 h-12 font-black uppercase text-xs tracking-widest gap-2 text-gray-500 hover:text-black hover:bg-gray-100 transition-all border-gray-200"
          >
            <ArrowLeft className="w-4 h-4" /> Editar Actividades
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 px-2">
          {activities.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-[24px] bg-white/50">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No hay actividades registradas</p>
              </div>
          ) : (
              activities.map((act, i) => {
                  const annualMin = (act.time_unit || 0) * (act.volume_daily || 0) * 20 * 12;
                  const categoryBadge = act.classification === 'VA' ? 'OPERACIÓN' : (act.classification === 'NVA' ? 'SOPORTE' : (act.classification || 'GENERAL'));
                  
                  return (
                    <div 
                        key={act.id || i} 
                        onClick={() => onSelectTask(act)}
                        className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col md:flex-row md:items-center justify-between p-6 cursor-pointer hover:border-black"
                    >
                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-black group-hover:bg-[#FFD600] transition-colors" />
                        
                        <div className="pl-4 flex-1 mb-4 md:mb-0">
                            <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-xl font-bold tracking-tight text-black">{act.name}</h4>
                                <span className="bg-black text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">
                                    {categoryBadge}
                                </span>
                                <span className="bg-[#FFD600] text-black text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Analizado
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 font-mono">
                                {act.time_unit} min/unid <span className="mx-2 opacity-50">|</span> {act.volume_daily} unid/día
                            </p>
                        </div>

                        <div className="text-left md:text-right md:pr-12 group-hover:pr-16 transition-all duration-300 pl-4 md:pl-0">
                            <p className="text-3xl font-black tracking-tight text-black">{annualMin.toLocaleString()}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">MIN/AÑO</p>
                        </div>

                        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 hidden md:flex text-[#FFD600]">
                            <ChevronRight className="w-8 h-8" />
                        </div>
                    </div>
                  );
              })
          )}
      </div>
      
      {/* BOTTOM FIXED BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-[1200px] mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-baseline gap-4">
            <span className="text-sm font-bold text-black tracking-tight hidden md:inline">Total carga diaria:</span>
            <span className="text-3xl md:text-4xl font-black tracking-tighter" style={{ WebkitTextStroke: '1px black', color: '#FFD600', textShadow: '2px 2px 0px black' }}>
              {totalMinutesDaily.toLocaleString()} min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
