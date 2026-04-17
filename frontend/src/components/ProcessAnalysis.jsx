'use client';

export default function ProcessAnalysis({ analysis, onExport }) {
  if (!analysis) return null;

  return (
    <div className="glass-card p-10 space-y-8 animate-in slide-in-from-bottom-5 duration-700">
      <div className="flex justify-between items-start border-b border-gray-100 pb-8">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
            <span className="text-[10px] uppercase font-black tracking-widest text-primary">Análisis Estratégico IA</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tighter uppercase">Plan de Optimización</h2>
        </div>
        <div className="text-right">
          <div className="text-4xl font-black text-green-500 tracking-tighter">
            -{analysis.estimated_annual_savings_min.toLocaleString()} min
          </div>
          <div className="text-[10px] uppercase font-bold text-gray-400">Ahorro Anual Estimado</div>
        </div>
      </div>

      <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed italic">
        "{analysis.executive_summary}"
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {analysis.suggestions.map((sugg, i) => (
          <div key={i} className="p-6 border border-gray-100 rounded-3xl hover:border-black/10 transition-all space-y-4 group">
            <div className="flex justify-between items-start">
              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                sugg.impact === 'Alto' ? 'bg-red-100 text-red-600' : 
                sugg.impact === 'Medio' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
              }`}>
                Impacto {sugg.impact}
              </span>
              <span className="text-[10px] font-bold text-gray-300 group-hover:text-black transition-colors uppercase">
                {sugg.tool_type}
              </span>
            </div>
            
            <div className="space-y-1">
              <h4 className="font-bold text-lg">{sugg.activity_name}</h4>
              <p className="text-xs text-primary font-bold uppercase">{sugg.action}</p>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
              {sugg.reasoning}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-8">
        <button 
          onClick={onExport}
          className="px-10 py-4 bg-black text-white rounded-full font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all transform hover:scale-105 active:scale-95 shadow-xl"
        >
          Descargar Informe Completo con IA
        </button>
      </div>
    </div>
  );
}
