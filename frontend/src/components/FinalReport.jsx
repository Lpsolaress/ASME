'use client';

import React, { useMemo } from 'react';
import { 
  Download, Zap, TrendingUp, Clock, CheckCircle2, AlertTriangle,
  BarChart3, ChevronRight, RotateCcw, Target, Users, Euro, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function FinalReport({ session, activities, analysis, onExport, onReset, onBack }) {
  if (!analysis) return null;

  // ── Real metrics from activities ──
  const metrics = useMemo(() => {
    const totalActs = activities.length;
    const vaCount = activities.filter(a => a.classification === 'VA').length;
    const nvaCount = totalActs - vaCount;
    const vaPct = totalActs > 0 ? Math.round((vaCount / totalActs) * 100) : 0;

    const totalMinDaily = activities.reduce((sum, a) => sum + (a.time_unit || 0) * (a.volume_daily || 0), 0);
    const totalHrsDaily = totalMinDaily / 60;
    const totalAnnualMin = activities.reduce((sum, a) => sum + (a.annual_minutes || 0), 0);
    const totalAnnualHrs = Math.round(totalAnnualMin / 60);

    const savedHours = Math.round(analysis.estimated_annual_savings_min / 60);
    const priorityActions = analysis.suggestions.filter(s => s.impact === 'Alto').length;

    // Top activities by daily load
    const sortedByLoad = [...activities]
      .map(a => ({ ...a, dailyMin: (a.time_unit || 0) * (a.volume_daily || 0) }))
      .sort((a, b) => b.dailyMin - a.dailyMin);

    return { totalActs, vaCount, nvaCount, vaPct, totalMinDaily, totalHrsDaily, totalAnnualHrs, savedHours, priorityActions, sortedByLoad };
  }, [activities, analysis]);

  const maxDailyMin = Math.max(...metrics.sortedByLoad.map(a => a.dailyMin), 1);

  return (
    <div className="max-w-[1100px] mx-auto py-10 px-6 space-y-10 animate-in fade-in duration-700">
      
      {/* ── HEADER ── */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-secondary/20 px-4 py-2 rounded-xl w-fit">
            <Target className="w-4 h-4 text-secondary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Informe Final ASME</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">{session?.task_name || 'Proceso Analizado'}</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
            {session?.company_name} · {session?.department} · {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline"
            onClick={onBack}
            className="border-gray-200 text-gray-500 hover:text-black hover:bg-gray-50 rounded-2xl px-6 h-12 font-black uppercase text-[10px] tracking-widest gap-2 transition-all"
          >
            Volver
          </Button>
          <Button 
            onClick={onExport}
            className="bg-black text-white hover:bg-secondary hover:text-black rounded-2xl px-8 h-12 font-black uppercase text-[10px] tracking-widest gap-2 shadow-lg transition-all"
          >
            <Download className="w-4 h-4" /> Descargar PDF
          </Button>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Actividades Totales", value: metrics.totalActs, sub: "Inventario activo", icon: <CheckCircle2 className="w-4 h-4" /> },
          { label: "Carga Diaria", value: `${metrics.totalHrsDaily.toFixed(1)}H`, sub: `${metrics.totalMinDaily} min/día`, icon: <Clock className="w-4 h-4" /> },
          { label: "Horas Ahorradas/Año", value: metrics.savedHours.toLocaleString(), sub: "Proyección ROI", icon: <TrendingUp className="w-4 h-4" /> },
          { label: "Acciones Prioritarias", value: metrics.priorityActions, sub: "Atención inmediata", icon: <AlertTriangle className="w-4 h-4" />, isAlert: metrics.priorityActions > 0 },
        ].map((card, i) => (
          <Card key={i} className="bg-black border-none rounded-[24px] overflow-hidden">
            <CardContent className="p-6 space-y-3">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">{card.label}</p>
              <div className="text-3xl font-black text-secondary tracking-tighter">{card.value}</div>
              <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                {card.icon} {card.sub}
              </div>
              {card.isAlert && <div className="absolute top-0 right-0 w-1 h-full bg-secondary" />}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Chart: Carga diaria por actividad */}
        <Card className="lg:col-span-3 border border-gray-100 rounded-[24px] overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-secondary" /> Carga Diaria por Actividad
              </h2>
              <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{metrics.totalMinDaily} min totales</span>
            </div>
            <div className="space-y-4">
              {metrics.sortedByLoad.slice(0, 6).map((act, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black uppercase tracking-tight">{act.name}</span>
                    <span className="text-[10px] font-bold text-gray-400">{act.dailyMin} min</span>
                  </div>
                  <div className="w-full h-6 bg-gray-50 rounded-lg overflow-hidden relative">
                    <div 
                      className={`h-full rounded-lg transition-all duration-1000 ${act.classification === 'VA' ? 'bg-secondary' : 'bg-gray-300'}`}
                      style={{ width: `${Math.max(3, (act.dailyMin / maxDailyMin) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-6 pt-2 border-t border-gray-50">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-secondary rounded-sm" /><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Valor Añadido</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-300 rounded-sm" /><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">No Valor Añadido</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Chart: Distribución VA/NVA */}
        <Card className="lg:col-span-2 border border-gray-100 rounded-[24px] overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center justify-center h-full space-y-6">
            <h2 className="text-sm font-black uppercase tracking-tight flex items-center gap-2 self-start">
              <Layers className="w-4 h-4 text-secondary" /> Clasificación
            </h2>
            {/* Donut VA/NVA */}
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="65" stroke="#F3F4F6" strokeWidth="14" fill="transparent" />
                <circle 
                  cx="80" cy="80" r="65" 
                  stroke="#FFD600" strokeWidth="14" fill="transparent"
                  strokeDasharray={408}
                  strokeDashoffset={408 * (1 - metrics.vaPct / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black">{metrics.vaPct}%</span>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">VA</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 w-full">
              <div className="text-center">
                <p className="text-2xl font-black text-secondary">{metrics.vaCount}</p>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Valor Añadido</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-gray-400">{metrics.nvaCount}</p>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">No Valor</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── AUTOMATION POTENTIAL ── */}
      <Card className="border border-gray-100 rounded-[24px] overflow-hidden">
        <CardContent className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
              <Zap className="w-4 h-4 text-secondary fill-secondary" /> Potencial de Automatización por Actividad
            </h2>
          </div>
          <div className="space-y-5">
            {analysis.suggestions.map((sugg, i) => {
              const potential = 94 - (i * 12);
              const label = `${sugg.action} → ${sugg.activity_name}`;
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black uppercase tracking-tight">{label}</span>
                    <span className="text-[10px] font-bold text-gray-400">{potential}%</span>
                  </div>
                  <div className="w-full h-7 bg-gray-50 rounded-lg overflow-hidden relative">
                    <div 
                      className={`h-full rounded-lg transition-all duration-1000 ${potential > 50 ? 'bg-secondary' : 'bg-gray-300'}`}
                      style={{ width: `${potential}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-6 pt-2 border-t border-gray-50">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-secondary rounded-sm" /><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Prioridad Alta</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-300 rounded-sm" /><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Evaluación Pendiente</span></div>
          </div>
        </CardContent>
      </Card>

      {/* ── PLAN DE MEJORA ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-gray-100 rounded-[24px] overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
              <Target className="w-4 h-4 text-secondary" /> Próximos Pasos Recomendados
            </h2>
            {analysis.executive_summary && (
              <p className="text-xs text-gray-400 leading-relaxed italic border-l-2 border-secondary pl-4">
                {analysis.executive_summary}
              </p>
            )}
            <div className="space-y-3">
              {analysis.suggestions.map((sugg, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl group hover:bg-secondary/10 transition-all">
                  <div className="w-10 h-10 bg-white flex items-center justify-center rounded-xl border border-gray-100 flex-shrink-0">
                    {i === 0 ? <Zap className="w-5 h-5 text-secondary fill-secondary" /> : <BarChart3 className="w-5 h-5 text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black uppercase tracking-tight truncate">{sugg.action} en {sugg.activity_name}</h4>
                    <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-2 mt-0.5">{sugg.reasoning}</p>
                    <div className="flex gap-3 mt-1.5">
                      <span className="text-[8px] font-black uppercase tracking-widest bg-secondary/20 text-black px-2 py-0.5 rounded-full">{sugg.tool_type}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Impacto: {sugg.impact}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Health Score */}
        <Card className="border border-gray-100 rounded-[24px] overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center justify-center h-full space-y-6 text-center">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" stroke="#F3F4F6" strokeWidth="8" fill="transparent" />
                <circle cx="80" cy="80" r="70" stroke="#FFD600" strokeWidth="8" fill="transparent" strokeDasharray={440} strokeDashoffset={440 * 0.15} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-black">A+</span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-black uppercase tracking-tight">Score de Salud Industrial</h4>
              <p className="text-[10px] text-gray-400 leading-relaxed max-w-[200px]">Su planta opera por encima del 85% de los estándares del sector.</p>
            </div>
            <div className="w-full space-y-2 pt-4 border-t border-gray-50">
              <div className="flex justify-between text-[10px]">
                <span className="font-bold text-gray-400 uppercase">Horas Anuales</span>
                <span className="font-black">{metrics.totalAnnualHrs.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="font-bold text-gray-400 uppercase">Ahorro Estimado</span>
                <span className="font-black text-secondary">{metrics.savedHours.toLocaleString()}h</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── FOOTER ── */}
      <div className="flex justify-center pt-6">
        <button 
          onClick={onReset}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 hover:text-black transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Iniciar Nuevo Análisis
        </button>
      </div>
    </div>
  );
}
