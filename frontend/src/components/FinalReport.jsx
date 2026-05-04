import React from 'react';
import { 
  Download, 
  Zap, 
  ArrowLeft, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  BarChart3,
  ChevronRight,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FinalReport({ session, activities, analysis, onExport, onReset }) {
  if (!analysis) return null;

  const totalActivities = activities.length;
  const avgPotential = 78;
  const savedHours = Math.round(analysis.estimated_annual_savings_min / 60);
  const priorityActions = analysis.suggestions.filter(s => s.impact === 'Alto').length;

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-6 space-y-8 animate-in fade-in zoom-in duration-700">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-primary uppercase italic">Resumen General de Resultados</h1>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Análisis detallado de eficiencia industrial para {session?.company_name}</p>
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={onExport}
            className="bg-black text-white hover:bg-secondary hover:text-primary rounded-none px-8 h-12 font-black uppercase text-xs tracking-widest transition-all"
          >
            <Download className="w-4 h-4 mr-2" /> Descargar Informe PDF
          </Button>
        </div>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Actividades Totales", value: totalActivities, sub: "Inventario de procesos activo", icon: <CheckCircle2 className="w-4 h-4 text-secondary" /> },
          { label: "Potencial de Automatización", value: `${avgPotential}%`, sub: "+12% vs trimestre anterior", icon: <TrendingUp className="w-4 h-4 text-secondary" /> },
          { label: "Horas Ahorradas/Año", value: savedHours.toLocaleString(), sub: "Proyección estimada ROI", icon: <Clock className="w-4 h-4 text-secondary" /> },
          { label: "Acciones Prioritarias", value: priorityActions, sub: "Requiere atención inmediata", icon: <AlertTriangle className="w-4 h-4 text-secondary" />, isAlert: true }
        ].map((card, i) => (
          <div key={i} className="bg-black p-6 space-y-4 relative overflow-hidden group">
            <div className="space-y-1 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{card.label}</p>
              <div className="text-4xl font-black text-secondary tracking-tighter">{card.value}</div>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest relative z-10">
              {card.icon} {card.sub}
            </div>
            {card.isAlert && <div className="absolute top-0 right-0 w-1 h-full bg-secondary" />}
          </div>
        ))}
      </div>

      {/* Middle Section: Potential Chart */}
      <div className="bg-white border-2 border-gray-100 p-8 space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black uppercase tracking-tight text-primary">Potencial de Automatización por Actividad</h2>
          <div className="flex gap-2">
             <span className="px-4 py-2 border-2 border-gray-100 text-[10px] font-black uppercase tracking-widest">Exportar</span>
             <span className="px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest">Filtrar</span>
          </div>
        </div>

        <div className="space-y-6">
          {analysis.suggestions.map((sugg, i) => {
            const potential = 94 - (i * 12);
            return (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-black uppercase tracking-tight text-primary">{sugg.activity_name}</span>
                  <span className="text-[10px] font-bold text-gray-400">{potential}%</span>
                </div>
                <div className="w-full h-8 bg-gray-50 relative overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${potential > 50 ? 'bg-secondary' : 'bg-gray-400'}`} 
                    style={{ width: `${potential}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-secondary" />
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Prioridad Alta</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Evaluación Pendiente</span>
            </div>
          </div>
          <div className="text-[9px] font-bold text-gray-300 uppercase">Última actualización: Hoy, {new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border-2 border-gray-100 p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black uppercase tracking-tight text-primary">Próximos Pasos Recomendados</h3>
            <button className="text-gray-300">•••</button>
          </div>
          <div className="space-y-4">
            {analysis.suggestions.slice(0, 2).map((sugg, i) => (
              <div key={i} className="flex items-center gap-6 p-4 bg-gray-50 group hover:bg-secondary transition-all cursor-pointer border-2 border-transparent hover:border-black">
                <div className="w-12 h-12 bg-white flex items-center justify-center border-2 border-gray-100 group-hover:border-primary">
                  {i === 0 ? <Zap className="w-6 h-6 text-primary fill-secondary" /> : <BarChart3 className="w-6 h-6 text-primary" />}
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="text-sm font-black uppercase tracking-tight text-primary">{sugg.action} en {sugg.activity_name}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Impacto estimado del {sugg.impact === 'Alto' ? '15%' : '8%'} en errores humanos</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border-2 border-gray-100 p-8 flex flex-col items-center justify-center space-y-6 text-center">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={440} strokeDashoffset={440 * 0.15} className="text-secondary" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-5xl font-black text-primary">A+</span>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-black uppercase tracking-tight text-primary">Score de Salud Industrial</h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed max-w-[200px]">Su planta está operando por encima del 85% de los estándares del sector.</p>
          </div>
          <Button className="w-full bg-black text-white rounded-none font-black uppercase text-xs tracking-widest h-12 hover:bg-secondary hover:text-primary">
            Ver Benchmark
          </Button>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button 
          onClick={onReset}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 hover:text-primary transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Iniciar Nuevo Análisis Estratégico
        </button>
      </div>
    </div>
  );
}
