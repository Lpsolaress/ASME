import React from 'react';
import { 
  Download, 
  Zap, 
  ArrowLeft, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Cpu,
  BarChart3,
  Check,
  ChevronRight,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";

import AutomationRoadmap from "./AutomationRoadmap";

export default function ProcessAnalysis({ session, analysis, onContinue, onBack }) {
  const [view, setView] = React.useState('details'); // 'details' or 'roadmap'
  if (!analysis) return null;

  // Calculate metrics
  const totalActivities = analysis.suggestions.length;
  const avgPotential = 78; // Mocked or calculated
  const savedHours = Math.round(analysis.estimated_annual_savings_min / 60);
  const priorityActions = analysis.suggestions.filter(s => s.impact === 'Alto').length;

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-6 space-y-10 animate-in fade-in duration-700">
      
      {/* Stepper Step 4 */}
      <div className="flex items-center justify-between px-32 relative pb-4">
        <div className="absolute top-5 left-40 right-40 h-[2px] bg-gray-100 -z-10" />
        
        {[
          { step: 1, label: 'Setup', completed: true },
          { step: 2, label: 'Data Import', completed: true },
          { step: 3, label: 'Identification', completed: true },
          { step: 4, label: 'Analysis', active: true },
          { step: 5, label: 'Final Report', active: false },
        ].map((s) => (
          <div key={s.step} className="flex flex-col items-center space-y-3">
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-sm transition-all duration-500 ${
              s.completed ? 'bg-black border-black text-white' : 
              s.active ? 'bg-secondary border-primary text-primary' : 'bg-[#F3F4F6] border-transparent text-[#9CA3AF]'
            }`}>
              {s.completed ? <Check className="w-5 h-5" /> : s.step}
            </div>
            <span className={`text-[11px] font-bold tracking-tight transition-colors duration-500 ${s.active || s.completed ? 'text-primary' : 'text-[#9CA3AF]'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-primary uppercase italic">Resumen General de Resultados</h1>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Análisis detallado de eficiencia industrial para {session?.company_name}</p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="border-2 border-black rounded-none px-6 font-black uppercase text-xs tracking-widest"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
          </Button>
          <Button 
            onClick={onContinue}
            className="bg-black text-white hover:bg-secondary hover:text-primary rounded-none px-8 font-black uppercase text-xs tracking-widest transition-all"
          >
            Continuar <ChevronRight className="w-4 h-4 ml-2" />
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
             <span className="px-3 py-1 bg-gray-100 text-[9px] font-black uppercase tracking-widest">Filtrar</span>
          </div>
        </div>

        <div className="space-y-6">
          {analysis.suggestions.map((sugg, i) => {
            const potential = 94 - (i * 12); // Dynamic mock value
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
        
        <div className="flex gap-6 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-secondary" />
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Prioridad Alta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Evaluación Pendiente</span>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-4 border-b-2 border-gray-100 pb-6">
        <button 
          onClick={() => setView('details')}
          className={`flex items-center gap-2 px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${
            view === 'details' ? 'bg-black text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
        >
          <Cpu className="w-4 h-4" /> Módulos Técnicos
        </button>
        <button 
          onClick={() => setView('roadmap')}
          className={`flex items-center gap-2 px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${
            view === 'roadmap' ? 'bg-black text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
        >
          <Zap className="w-4 h-4" /> Hoja de Ruta de Automatización
        </button>
      </div>

      {view === 'roadmap' ? (
        <AutomationRoadmap suggestions={analysis.suggestions} />
      ) : (
        <div className="space-y-12">
          <div className="flex items-center justify-between border-b-2 border-gray-100 pb-4">
            <h3 className="text-2xl font-black uppercase tracking-tight text-primary italic">Desglose de Ingeniería por Actividad</h3>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{analysis.suggestions.length} Módulos de Análisis</div>
          </div>
          {/* Rest of the detail modules... */}

        {analysis.suggestions.map((sugg, i) => {
          // Find matching activity data if possible (mocked for now to match the UI perfectly)
          const potential = 94 - (i * 12);
          return (
            <div key={i} className="bg-white border-2 border-black rounded-none overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Card Header */}
              <div className="p-6 border-b-2 border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <h4 className="text-3xl font-black uppercase tracking-tighter text-primary">{sugg.activity_name}</h4>
                  <div className="px-3 py-1 bg-secondary text-[10px] font-black uppercase tracking-widest">Revisión</div>
                </div>
                <div className="flex items-center gap-2 text-primary">
                  <Cpu className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">AI Activity Analysis</span>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-black text-secondary p-6 text-center space-y-1">
                    <div className="text-xs font-bold uppercase tracking-widest opacity-70 italic">Cycle Time</div>
                    <div className="text-2xl font-black tracking-tighter uppercase">1.5 Min/Unidad</div>
                  </div>
                  <div className="bg-black text-secondary p-6 text-center space-y-1">
                    <div className="text-xs font-bold uppercase tracking-widest opacity-70 italic">Throughput</div>
                    <div className="text-2xl font-black tracking-tighter uppercase">450 Unid/Día</div>
                  </div>
                  <div className="bg-black text-secondary p-6 text-center space-y-1">
                    <div className="text-xs font-bold uppercase tracking-widest opacity-70 italic">Total Load</div>
                    <div className="text-2xl font-black tracking-tighter uppercase">162,000 Min/Año</div>
                  </div>
                </div>

                {/* Content Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Visual Context */}
                  <div className="lg:col-span-7 relative group cursor-crosshair">
                    <div className="aspect-video bg-gray-900 overflow-hidden relative border-2 border-black">
                      <img 
                        src={`https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800`} 
                        className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" 
                        alt="Process Context"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-widest">
                        <BarChart3 className="w-4 h-4 text-secondary" /> Visual inspection process mapped via sensor data
                      </div>
                    </div>
                  </div>

                  {/* AI Suggestion Box */}
                  <div className="lg:col-span-5 bg-gray-50 border-2 border-gray-100 p-6 space-y-6 relative overflow-hidden">
                    <div className="space-y-2 relative z-10">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400">AI Suggestion</h5>
                      <p className="text-lg font-bold text-primary leading-tight">
                        {sugg.reasoning}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest relative z-10 pt-4">
                      <TrendingUp className="w-4 h-4" /> Confidence {potential}%
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-5 rotate-12">
                      <Zap className="w-32 h-32" />
                    </div>
                  </div>
                </div>

                {/* Footer Analysis Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t-2 border-gray-100">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      <h5 className="text-[11px] font-black uppercase tracking-widest text-primary">Classification Details</h5>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-tight text-gray-400">
                        <span>VA (Value Added)</span>
                        <span>0%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-tight text-gray-400">
                        <span>SVA (Support VA)</span>
                        <span>0%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-black uppercase tracking-tight text-red-500 border-t border-gray-100 pt-2">
                        <span>NVA (Non-Value Added)</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-primary" />
                      <h5 className="text-[11px] font-black uppercase tracking-widest text-primary">Related Equipment</h5>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['CMM Machine A-04', 'Laser Scanner S2', 'Vernier Caliper'].map(eq => (
                        <span key={eq} className="px-3 py-1 border-2 border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-500">
                          {eq}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-2">
                      System status: <span className="text-green-500">Operational</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex justify-between items-center pt-12 border-t-4 border-black">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="border-2 border-black rounded-none px-8 h-14 font-black uppercase text-xs tracking-widest gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Anterior
        </Button>
        <Button 
          onClick={onContinue}
          className="bg-black text-white rounded-none px-16 h-14 font-black uppercase text-sm tracking-widest gap-2 hover:bg-secondary hover:text-primary transition-all"
        >
          Finalizar y Certificar Reporte <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
