import { Trash2, Clock, BarChart3, Info, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ActivityCard({ data, onDelete }) {
  const getCategoryStyle = (cat) => {
    switch (cat) {
      case 'Operación': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Revisión': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Traslado': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Espera': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <Card className="w-full border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 group">
      <CardContent className="p-0">
        <div className="p-6 flex justify-between items-start border-b border-gray-50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <h3 className="font-black text-lg tracking-tight text-primary uppercase">{data.name}</h3>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actividad Confirmada</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${getCategoryStyle(data.category)}`}>
              {data.category}
            </span>
            <span className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${data.classification === 'VA' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
              {data.classification}
            </span>
            <button 
              onClick={() => onDelete(data.id)}
              className="p-2 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 ml-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-3 gap-6 bg-gray-50/30">
          <div className="space-y-1">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Tiempo Unitario</span>
            <div className="flex items-end gap-1">
              <span className="font-black text-xl text-primary">{data.time_unit}</span>
              <span className="text-[10px] font-bold text-gray-400 mb-1">MIN</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Volumen Diario</span>
            <div className="flex items-end gap-1">
              <span className="font-black text-xl text-primary">{data.volume_daily}</span>
              <span className="text-[10px] font-bold text-gray-400 mb-1">UND</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Impacto Anual</span>
            <div className="flex items-end gap-1">
              <span className="font-black text-xl text-secondary bg-primary px-2 rounded">
                {(data.annual_minutes || (data.time_unit * data.volume_daily * 20 * 12)).toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-gray-400 mb-1">MIN</span>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-50">
          <div className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl p-4">
            <Info className="w-4 h-4 text-primary/30 mt-0.5 shrink-0" />
            <p className="text-xs font-medium text-gray-500 leading-relaxed italic">
              "{data.justification}"
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
