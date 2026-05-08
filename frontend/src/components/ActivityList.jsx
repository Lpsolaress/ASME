'use client';

import { 
  Check, 
  ArrowLeft, 
  Zap, 
  Mic, 
  Loader2, 
  Trash2, 
  Plus, 
  Layout, 
  Clock, 
  Target,
  ChevronRight,
  TrendingDown,
  History,
  Pencil,
  X,
  Save,
  Circle,
  Square,
  ArrowRight,
  Triangle
} from "lucide-react";

const getApiUrl = () => {
  if (typeof window === 'undefined') return 'http://127.0.0.1:8000';
  const hostname = window.location.hostname;
  return hostname === 'localhost' ? 'http://127.0.0.1:8000' : `http://${hostname}:8000`;
};
const API_URL = getApiUrl();

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState, useRef } from "react";

export default function ActivityList({ 
  session, 
  activities, 
  onDelete, 
  onUpdate,
  onAnalyze, 
  onTranscription, 
  isProcessingExternal,
  onBack 
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isManual, setIsManual] = useState(activities.length === 0);

  const [manualData, setManualData] = useState({
    name: "",
    classification: "VA",
    time_unit: 10,
    volume_daily: 1,
    category: "Operación"
  });

  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const recordingStartTime = useRef(0);

  const handleManualSubmit = () => {
    if (!manualData.name) return;
    onTranscription({
        ...manualData,
        category: manualData.category || (manualData.classification === 'VA' ? 'Operación' : 'Revisión')
    });
    setManualData({
      name: "",
      classification: "VA",
      time_unit: 10,
      volume_daily: 1,
      category: "Operación"
    });
    setIsManual(false);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Acceso denegado: El uso del micrófono requiere una conexión segura (HTTPS o localhost).");
      return;
    }
    try {
      recordingStartTime.current = Date.now();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };
      mediaRecorder.current.onstop = async () => {
        const duration = Date.now() - recordingStartTime.current;
        if (duration < 50) return; // Umbral mínimo para máxima sensibilidad

        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        if (audioBlob.size > 0) {
          await sendToTranscription(audioBlob);
        }
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access error:", err);
      alert("No se pudo acceder al micrófono.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const sendToTranscription = async (blob) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', blob, 'recording.webm');
    try {
      const response = await fetch(`${API_URL}/transcribe`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error("Error en la transcripción");
      const data = await response.json();
      onTranscription(data);
    } catch (err) {
      console.error("Transcription error:", err);
      alert("Error al procesar el audio.");
    } finally {
      setIsProcessing(false);
    }
  };


  const ASME_CONFIG = {
    "Operación": { icon: Circle, color: "#C00000", bg: "bg-[#C00000]", label: "Operación", symbol: "●", va: "VA" },
    "Revisión": { icon: Square, color: "#E46C0A", bg: "bg-[#E46C0A]", label: "Revisión", symbol: "■", va: "NVA" },
    "Traslado": { icon: ArrowRight, color: "#948A54", bg: "bg-[#948A54]", label: "Traslado", symbol: "➡", va: "NVA" },
    "Espera": { icon: Clock, color: "#31859C", bg: "bg-[#31859C]", label: "Espera", symbol: "D", va: "NVA" },
    "Archivo": { icon: Triangle, color: "#76933C", bg: "bg-[#76933C]", label: "Archivo", symbol: "▲", va: "NVA" }
  };

  const totalMinutesDaily = activities.reduce((sum, act) => sum + ((act.time_unit || 0) * (act.volume_daily || 0)), 0);

  const [editingId, setEditingId] = useState(null);

  const [editData, setEditData] = useState({});

  const startEditing = (act) => {
    setEditingId(act.id);
    setEditData({ ...act });
  };

  const handleUpdate = async () => {
    await onUpdate(editingId, editData);
    setEditingId(null);
  };


  return (
    <div className="w-full max-w-[1200px] mx-auto pb-40 animate-in fade-in duration-700 pt-4 md:pt-6 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 md:mb-10 gap-4">
        <div>
          <p className="text-[#FFD600] font-black uppercase tracking-[0.3em] text-[8px] md:text-[10px] mb-2">Fase 2: Registro de Actividades</p>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">{session?.task_name || 'Análisis de Proceso'}</h1>
          <p className="text-sm md:text-gray-500 font-medium mt-2">Inventario para {session?.company_name}.</p>
        </div>

        <div className="flex flex-row items-center gap-2 md:gap-4 w-full md:w-auto">
          <Button 
              variant="outline" 
              onClick={onBack}
              className="flex-1 md:flex-none rounded-xl px-4 md:px-6 h-10 md:h-12 font-black uppercase text-[10px] md:text-xs tracking-widest gap-2 text-gray-500 hover:text-black hover:bg-gray-100 transition-all border-gray-200"
          >
            <ArrowLeft className="w-3 md:w-4 h-3 md:h-4" /> Volver
          </Button>
          <Button 
            onClick={() => setIsManual(!isManual)}
            className="flex-1 md:flex-none bg-[#FFD600] text-black hover:bg-[#FFD600]/90 rounded-xl px-4 md:px-6 h-10 md:h-12 font-black text-[10px] md:text-xs tracking-widest shadow-sm transition-all flex items-center gap-2 border-none"
          >
            <Plus className="w-3 md:w-4 h-3 md:h-4" /> Añadir
          </Button>
        </div>
      </div>

      {isManual && (
        <Card className="border border-gray-200 rounded-[20px] md:rounded-[24px] bg-white shadow-lg animate-in slide-in-from-top-4 duration-500 overflow-hidden mb-8">
          <CardHeader className="px-4 md:px-8 pt-6 md:pt-8 pb-2 flex flex-row justify-between items-center">
            <CardTitle className="text-lg md:text-xl font-black uppercase tracking-tight">Nueva Actividad</CardTitle>
            <button 
                onClick={isRecording ? stopRecording : startRecording}
                className={`h-9 md:h-10 px-3 md:px-4 rounded-xl border flex items-center gap-2 transition-all duration-300 ${
                    isRecording 
                    ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' 
                    : 'bg-white border-gray-200 hover:border-black text-black'
                }`}
            >
                <Mic className={`w-3.5 md:w-4 h-3.5 md:h-4 ${isRecording ? 'text-red-600' : 'text-black'}`} />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">{isRecording ? "Grabando..." : "Por Voz"}</span>
            </button>
          </CardHeader>
          <CardContent className="p-4 md:p-8 space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Descripción</label>
                <input 
                    type="text" 
                    value={manualData.name}
                    onChange={(e) => setManualData({...manualData, name: e.target.value})}
                    placeholder="Ej. Revisión de inventario"
                    className="w-full h-14 border border-gray-200 rounded-2xl px-6 font-bold focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Clasificación</label>
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {Object.keys(ASME_CONFIG).map(cat => {
                        const config = ASME_CONFIG[cat];
                        const Icon = config.icon;
                        return (
                            <button 
                                key={cat}
                                onClick={() => setManualData({...manualData, classification: config.va, category: cat})}
                                className={`flex-1 min-w-[100px] h-14 flex flex-col items-center justify-center rounded-2xl border-2 transition-all ${
                                    manualData.category === cat 
                                    ? 'bg-black border-black text-white' 
                                    : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                                }`}
                            >
                                <Icon className="w-4 h-4 mb-1" />
                                <span className="text-[9px] font-black uppercase">{cat}</span>
                            </button>
                        );
                    })}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Min / Proceso</label>
                    <div className="relative">
                        <input 
                            type="number" 
                            value={manualData.time_unit === null || isNaN(manualData.time_unit) ? '' : manualData.time_unit}
                            onChange={(e) => setManualData({...manualData, time_unit: e.target.value === '' ? '' : parseFloat(e.target.value)})}
                            className="w-full h-14 border border-gray-200 rounded-2xl px-6 font-bold focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 tracking-widest">MIN</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Tareas / Día</label>
                    <div className="relative">
                        <input 
                            type="number" 
                            value={manualData.volume_daily === null || isNaN(manualData.volume_daily) ? '' : manualData.volume_daily}
                            onChange={(e) => setManualData({...manualData, volume_daily: e.target.value === '' ? '' : parseInt(e.target.value)})}
                            className="w-full h-14 border border-gray-200 rounded-2xl px-6 font-bold focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 tracking-widest">UND</span>
                    </div>
                </div>
                <div className="md:col-span-2 flex items-end">
                    <Button onClick={handleManualSubmit} className="w-full h-14 bg-black hover:bg-black/90 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg transition-all active:scale-95">
                        Guardar Actividad <Check className="ml-2 w-5 h-5 text-[#FFD600]" />
                    </Button>
                </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* LISTA DE ACTIVIDADES (Mockup Style) */}
      <div className="grid grid-cols-1 gap-4">
          {activities.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-[24px] bg-white/50">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No hay actividades registradas</p>
              </div>
          ) : (
              activities.map((act, i) => {
                  const isEditing = editingId === act.id;
                  const displayAct = isEditing ? editData : act;
                  const annualMin = (displayAct.time_unit || 0) * (displayAct.volume_daily || 0) * 20 * 12;
                  const config = ASME_CONFIG[displayAct.category] || ASME_CONFIG["Operación"];
                  const Icon = config.icon;
                  
                  return (
                    <div key={act.id || i} className={`group relative bg-white rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col md:flex-row md:items-center justify-between p-6 ${isEditing ? 'border-black ring-2 ring-black/5 shadow-xl scale-[1.01]' : 'border-gray-200 shadow-sm hover:shadow-md'}`}>
                        <div className={`absolute left-0 top-0 bottom-0 w-3 ${config.bg}`} title={displayAct.category} />
                        
                        <div className="pl-6 flex-1 mb-4 md:mb-0">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <input 
                                        className="text-xl font-black uppercase w-full bg-gray-50 border-none focus:ring-0 p-1 rounded"
                                        value={editData.name}
                                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                                    />
                                    <div className="flex flex-wrap gap-2">
                                        {Object.keys(ASME_CONFIG).map(cat => {
                                            const cfg = ASME_CONFIG[cat];
                                            const CatIcon = cfg.icon;
                                            return (
                                                <button
                                                    key={cat}
                                                    onClick={() => setEditData({...editData, category: cat, classification: cfg.va})}
                                                    className={`p-1.5 rounded-lg border transition-all ${editData.category === cat ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
                                                    title={cat}
                                                >
                                                    <CatIcon className="w-3.5 h-3.5" />
                                                </button>
                                            );
                                        })}
                                        <div className="flex gap-2 ml-auto items-center">
                                            <input 
                                                type="number"
                                                className="text-sm font-mono bg-gray-50 border-none w-16 p-1 rounded"
                                                value={editData.time_unit}
                                                onChange={(e) => setEditData({...editData, time_unit: parseFloat(e.target.value)})}
                                            />
                                            <span className="text-[10px] font-black text-gray-400">min</span>
                                            <input 
                                                type="number"
                                                className="text-sm font-mono bg-gray-50 border-none w-16 p-1 rounded"
                                                value={editData.volume_daily}
                                                onChange={(e) => setEditData({...editData, volume_daily: parseInt(e.target.value)})}
                                            />
                                            <span className="text-[10px] font-black text-gray-400">u/día</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (

                                <>
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center text-white shadow-sm`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black tracking-tight text-black uppercase">{act.name}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{act.category}</span>
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${act.classification === 'VA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {act.classification}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400 font-mono pl-12">
                                        {act.time_unit} min/unid <span className="mx-2 opacity-30">|</span> {act.volume_daily} unid/día
                                    </p>
                                </>
                            )}
                        </div>

                        <div className="text-left md:text-right md:pr-12 group-hover:pr-32 transition-all duration-300 pl-12 md:pl-0">
                            <p className="text-3xl font-black tracking-tight text-black">{annualMin.toLocaleString()}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">MINUTOS ANUALES</p>
                        </div>

                        {/* Actions */}
                        <div className={`absolute right-6 top-1/2 -translate-y-1/2 flex gap-2 transition-all duration-300 ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0'}`}>
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <Button onClick={handleUpdate} className="bg-black text-white h-10 w-10 p-0 rounded-full hover:bg-gray-800">
                                        <Check className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" onClick={() => setEditingId(null)} className="h-10 w-10 p-0 rounded-full bg-gray-100">
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Button variant="ghost" onClick={() => startEditing(act)} className="w-10 h-10 p-0 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100">
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" onClick={() => onDelete(act.id)} className="w-10 h-10 p-0 rounded-full bg-red-50 text-red-500 hover:bg-red-100">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                  );
              })
          )}
      </div>



      {/* BOTTOM FIXED BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-[1200px] mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-baseline gap-2 md:gap-4">
            <span className="text-xs md:text-sm font-bold text-black tracking-tight hidden sm:inline">Total carga diaria:</span>
            <span className="text-2xl md:text-4xl font-black tracking-tighter" style={{ WebkitTextStroke: '1px black', color: '#FFD600', textShadow: '2px 2px 0px black' }}>
              {totalMinutesDaily.toLocaleString()} min
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={onAnalyze}
              disabled={activities.length === 0 || isProcessing || isProcessingExternal}
              className="bg-black text-white hover:bg-black/90 rounded-xl px-8 h-12 font-bold text-sm tracking-tight shadow-xl shadow-black/10 transition-all active:scale-95 disabled:opacity-30"
            >
              {isProcessing || isProcessingExternal ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Analizar Tareas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
