'use client';

export default function ReportPreview({ session, activities, analysis, onClose, onDeleteActivity }) {
  const totalVA = activities.filter(a => a.classification === 'VA').length;
  const totalNVA = activities.length - totalVA;
  const vaPercent = activities.length > 0 ? (totalVA / activities.length * 100).toFixed(1) : 0;
  const totalAnnualMin = activities.reduce((sum, a) => sum + (a.annual_minutes || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl max-h-full overflow-y-auto rounded-lg shadow-2xl flex flex-col text-black font-sans relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        <div className="p-12 space-y-12">
          {/* Header */}
          <div className="border-b-2 border-black pb-8 space-y-2">
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Informe de Análisis ASME</h1>
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-xl font-bold uppercase tracking-tight">{session?.company_name}</p>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">{session?.department}</p>
              </div>
              <p className="text-xs font-mono text-gray-400">Generado el {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Executive Summary */}
          <section className="space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest border-l-4 border-primary pl-4">Resumen Ejecutivo</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-6 bg-gray-50 rounded-2xl space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Actividades</p>
                <p className="text-3xl font-black">{activities.length}</p>
              </div>
              <div className="p-6 bg-green-50 rounded-2xl space-y-1 border border-green-100">
                <p className="text-[10px] font-bold text-green-600 uppercase">Valor Añadido</p>
                <p className="text-3xl font-black text-green-700">{vaPercent}%</p>
              </div>
              <div className="p-6 bg-red-50 rounded-2xl space-y-1 border border-red-100">
                <p className="text-[10px] font-bold text-red-600 uppercase">No Valor Añadido</p>
                <p className="text-3xl font-black text-red-700">{100 - vaPercent}%</p>
              </div>
              <div className="p-6 bg-black text-white rounded-2xl space-y-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Carga Anual</p>
                <p className="text-xl font-black">{totalAnnualMin.toLocaleString()} <span className="text-[8px]">min</span></p>
              </div>
            </div>
          </section>

          {/* Activities Table */}
          <section className="space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest border-l-4 border-primary pl-4">Detalle de Actividades</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black text-white text-[10px] uppercase font-bold tracking-widest">
                    <th className="p-4 border border-black">Actividad</th>
                    <th className="p-4 border border-black text-center">Cat.</th>
                    <th className="p-4 border border-black text-center">Tipo</th>
                    <th className="p-4 border border-black text-center">Anual (min)</th>
                    <th className="p-4 border border-black text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {activities.map((act) => (
                    <tr key={act.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 border border-gray-100 font-bold">{act.name}</td>
                      <td className="p-4 border border-gray-100 text-center text-[10px] font-bold">{act.category}</td>
                      <td className="p-4 border border-gray-100 text-center">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${act.classification === 'VA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {act.classification}
                        </span>
                      </td>
                      <td className="p-4 border border-gray-100 text-center font-mono font-bold">
                        {act.annual_minutes?.toLocaleString()}
                      </td>
                      <td className="p-4 border border-gray-100 text-center">
                        <button 
                          onClick={() => onDeleteActivity(act.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {activities.length === 0 && (
              <p className="text-center py-10 text-gray-400 italic font-mono text-sm">No hay actividades registradas en este estudio.</p>
            )}
          </section>

          {/* Analysis Section */}
          {analysis && (
            <section className="space-y-6 pt-12 border-t border-gray-100">
              <h2 className="text-lg font-black uppercase tracking-widest border-l-4 border-primary pl-4 text-primary">Plan de Optimización IA</h2>
              <div className="bg-yellow-50/50 p-8 rounded-3xl border border-primary/20 space-y-6">
                <p className="text-sm italic text-gray-700 leading-relaxed">"{analysis.executive_summary}"</p>
                <div className="grid gap-4">
                  {analysis.suggestions.map((sugg, i) => (
                    <div key={i} className="flex items-start justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <div className="space-y-1">
                        <p className="font-bold text-sm uppercase">{sugg.activity_name}</p>
                        <p className="text-[10px] text-primary font-black uppercase font-mono">{sugg.action} → {sugg.tool_type}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-[8px] font-black uppercase ${
                        sugg.impact === 'Alto' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {sugg.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Footer Branding */}
          <div className="pt-20 text-center opacity-20 flex flex-col items-center">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mb-2">
              <span className="text-primary font-bold text-xs">A</span>
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.5em]">ASME Digital Intelligence System</p>
          </div>
        </div>
      </div>
    </div>
  );
}
