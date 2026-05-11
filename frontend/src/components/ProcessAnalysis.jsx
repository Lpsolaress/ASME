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
  Target,
  Users,
  Euro,
  Calculator
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import AutomationRoadmap from "./AutomationRoadmap";

export default function ProcessAnalysis({ session, analysis, activities, onContinue, onBack }) {
  const [view, setView] = React.useState('details'); // 'details' or 'roadmap'
  const [hourlyCost, setHourlyCost] = React.useState(25); // Default for calculation
  const [staffCount, setStaffCount] = React.useState(1); // Default for calculation
  
  if (!analysis) return null;

  // Calculate metrics based on Simplified Model
  const totalActivities = analysis.suggestions.length;
  const hoursPaidPerPerson = 8; 
  
  // Use actual activities for calculation
  const totalMinutesDaily = activities 
    ? activities.reduce((acc, act) => acc + ((act.time_unit || 0) * (act.volume_daily || 0)), 0)
    : analysis.suggestions.reduce((acc, sugg) => acc + (sugg.daily_minutes || 60), 0);
    
  const totalHoursEffectiveDaily = totalMinutesDaily / 60;
  
  const totalHoursPaidDaily = staffCount * hoursPaidPerPerson;
  const excessHoursDaily = Math.max(0, totalHoursPaidDaily - totalHoursEffectiveDaily);
  const annualSavingsEuro = Math.round(excessHoursDaily * hourlyCost * 20 * 12);

  const renderContent = () => {
    if (view === 'roadmap') {
      return <AutomationRoadmap suggestions={analysis.suggestions} />;
    }
    
    return (
      <div className="space-y-12">
        {/* Simplified Capacity Input (Editable here for real-time ROI) */}
        <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Plantilla (Personas)</label>
                <input 
                    type="number" 
                    value={staffCount} 
                    onChange={(e) => setStaffCount(parseInt(e.target.value) || 0)}
                    className="w-full h-14 border border-gray-200 rounded-2xl px-6 font-bold text-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all"
                />
            </div>
            <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Costo por Hora (€)</label>
                <input 
                    type="number" 
                    value={hourlyCost} 
                    onChange={(e) => setHourlyCost(parseInt(e.target.value) || 0)}
                    className="w-full h-14 border border-gray-200 bg-gray-50 rounded-2xl px-6 font-bold text-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all"
                />
            </div>
            <div className="flex items-end pb-1">
                <div className="bg-secondary/20 text-black px-6 py-3 rounded-2xl border border-secondary/30 w-full flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary-foreground/70">Pérdida por Exceso</p>
                    <p className="text-2xl font-black">{(excessHoursDaily * hourlyCost).toFixed(2)} €<span className="text-sm">/Día</span></p>
                </div>
            </div>
        </div>

        {/* CARGA DIARIA TABLE (Exact replica of Excel Logic) */}
        <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
          <div className="bg-gray-50/50 p-6 border-b border-gray-100">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 text-gray-500">
              <Calculator className="w-4 h-4 text-black" /> Balance de Carga de Trabajo (Modelo ASME)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100">
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Estado</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Plantilla</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">H. Pagadas/P</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">H. Efectivas</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">H. Pagadas Totales</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-black bg-secondary/10">Exceso Horas Diario</th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-bold text-base hover:bg-gray-50/50 transition-colors">
                  <td className="p-6 text-gray-500 text-xs font-black tracking-widest uppercase">PROCESO</td>
                  <td className="p-6">{staffCount}</td>
                  <td className="p-6">{hoursPaidPerPerson}</td>
                  <td className="p-6 font-black">{totalHoursEffectiveDaily.toFixed(2)}</td>
                  <td className="p-6">{totalHoursPaidDaily}</td>
                  <td className="p-6 font-black bg-secondary/10 text-secondary-foreground">{excessHoursDaily.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between px-2 pt-4">
          <h3 className="text-lg font-black uppercase tracking-tight text-black flex items-center gap-2"><Target className="w-5 h-5 text-secondary" /> Inventario de Actividades Clasificadas</h3>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">{analysis.suggestions.length} Registros</div>
        </div>

        <div className="grid grid-cols-1 gap-6">
        {analysis.suggestions.map((sugg, i) => {
          // Attempt to find the real activity data from the activities prop
          const relatedAct = activities ? activities.find(a => a.name.toLowerCase() === sugg.activity_name.toLowerCase()) : null;
          const isVA = relatedAct ? relatedAct.classification === 'VA' : (sugg.classification === 'VA');
          const timeUnit = relatedAct ? relatedAct.time_unit : (sugg.time_unit || 0);
          const volumeDaily = relatedAct ? relatedAct.volume_daily : (sugg.volume_daily || 0);

          return (
            <div key={i} className="bg-white border border-gray-100 rounded-[24px] overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-12 rounded-full ${isVA ? 'bg-secondary' : 'bg-gray-200'}`} />
                  <div>
                    <h4 className="text-xl font-black uppercase tracking-tight leading-none mb-1.5">{sugg.activity_name}</h4>
                    <div className="flex gap-3 items-center">
                        <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${isVA ? 'bg-secondary' : 'bg-gray-400'}`} />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isVA ? 'Valor Añadido' : 'No Valor Añadido'}</span>
                        </div>
                        <span className="text-[10px] font-black text-gray-300">•</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{timeUnit} min • {volumeDaily} ud/día</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50/50 p-6 border-t border-gray-50 flex gap-4">
                <Zap className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Optimización Sugerida</h5>
                  <p className="text-sm font-bold text-gray-600 leading-relaxed">
                    {sugg.reasoning}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-black bg-secondary/20 px-4 py-2 rounded-xl w-fit text-[10px] font-black uppercase tracking-[0.3em]">
            <Target className="w-4 h-4 text-secondary" /> ASME SIMPLIFIED REPORT
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black leading-none">
                ASME <span className="text-gray-300 italic">DIGITAL</span>
            </h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-3">
                {session?.company_name} • {session?.department} • {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex bg-gray-50 p-1.5 rounded-[20px] border border-gray-100">
          <button 
            onClick={() => setView('details')}
            className={`flex items-center gap-2 px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all rounded-2xl ${
              view === 'details' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Resultados
          </button>
          <button 
            onClick={() => setView('roadmap')}
            className={`flex items-center gap-2 px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all rounded-2xl ${
              view === 'roadmap' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Zap className="w-4 h-4" /> Plan de Mejora
          </button>
        </div>
      </div>

      {/* Top Cards Grid - Premium Look */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Tiempo de Producción", value: `${totalHoursEffectiveDaily.toFixed(1)} H`, sub: "Efectivas al día", icon: <Clock className="w-4 h-4 text-black" /> },
          { label: "Eficiencia de Plantilla", value: `${((totalHoursEffectiveDaily / totalHoursPaidDaily) * 100).toFixed(1)}%`, sub: `Para ${staffCount} pers.`, icon: <TrendingUp className="w-4 h-4 text-black" /> },
          { label: "Ahorro Potencial", value: `${annualSavingsEuro.toLocaleString()} €`, sub: `Anual estimado`, icon: <Euro className="w-4 h-4 text-black" />, isAlert: true }
        ].map((card, i) => (
          <Card key={i} className={`border border-gray-100 rounded-[32px] overflow-hidden shadow-sm ${card.isAlert ? 'bg-secondary border-secondary text-black' : 'bg-white text-black'}`}>
            <CardContent className="p-8 space-y-4">
              <div className="space-y-1">
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${card.isAlert ? 'text-black/60' : 'text-gray-400'}`}>{card.label}</p>
                <div className="text-4xl font-black tracking-tighter">{card.value}</div>
              </div>
              <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${card.isAlert ? 'text-black/60' : 'text-gray-400'}`}>
                {card.icon} {card.sub}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {renderContent()}

      {/* Footer Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-center pt-8 gap-4 border-t border-gray-100">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="rounded-xl px-8 h-14 font-black uppercase text-xs tracking-widest gap-2 text-gray-400 hover:text-black hover:bg-gray-50 transition-all w-full md:w-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Regresar
        </Button>
        <Button 
          onClick={onContinue}
          className="bg-black text-white hover:bg-secondary hover:text-black rounded-2xl px-12 h-16 font-black uppercase text-xs tracking-widest gap-3 shadow-lg shadow-black/5 transition-all active:scale-95 w-full md:w-auto"
        >
          Finalizar y Certificar Reporte <CheckCircle2 className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
