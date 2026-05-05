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
  Save
} from "lucide-react";
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
  const [isManual, setIsManual] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [manualData, setManualData] = useState({
    name: "",
    classification: "VA",
    time_unit: 10,
    volume_daily: 1
  });

  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const handleManualSubmit = () => {
    if (!manualData.name) return;
    onTranscription({
        ...manualData,
        category: manualData.classification === 'VA' ? 'Operación' : 'Revisión'
    });
    setManualData({
      name: "",
      classification: "VA",
      time_unit: 10,
      volume_daily: 1
    });
    setIsManual(false);
  };

  const startEdit = (activity) => {
    setEditingId(activity.id);
    setEditForm({ ...activity });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = async () => {
    if (!editForm.name) return;
    await onUpdate(editingId, editForm);
    setEditingId(null);
    setEditForm(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        await sendToTranscription(audioBlob);
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Error al acceder al micrófono.");
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
    formData.append('file', blob, 'recording.wav');
    try {
      const response = await fetch('http://localhost:8000/transcribe', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      onTranscription(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalMinutesDaily = activities.reduce((sum, act) => sum + ((act.time_unit || 0) * (act.volume_daily || 0)), 0);

  return (
    <div className="max-w-[1200px] mx-auto pb-40 animate-in fade-in duration-700 pt-6">
      {/* NAVEGACIÓN HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 px-2 gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Registro de Actividades</h1>
          <p className="text-gray-500 font-medium">Monitoreo de eficiencia y carga operativa en tiempo real.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
              variant="outline" 
              onClick={onBack}
              className="rounded-xl px-6 h-12 font-black uppercase text-xs tracking-widest gap-2 text-gray-500 hover:text-black hover:bg-gray-100 transition-all border-gray-200"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </Button>
          <Button 
            onClick={() => setIsManual(!isManual)}
            className="bg-[#FFD600] text-black hover:bg-[#FFD600]/90 rounded-xl px-6 h-12 font-black tracking-widest shadow-sm transition-all flex items-center gap-2 border-none"
          >
            <Plus className="w-4 h-4" /> Añadir actividad
          </Button>
        </div>
      </div>

      {/* FORMULARIO MANUAL PREMIUM (Expandable) */}
      {isManual && (
        <Card className="border border-gray-200 rounded-[24px] bg-white shadow-lg animate-in slide-in-from-top-4 duration-500 overflow-hidden mb-8 mx-2">
          <CardHeader className="px-8 pt-8 pb-2 flex flex-row justify-between items-center">
            <CardTitle className="text-xl font-black uppercase tracking-tight">Nueva Actividad</CardTitle>
            <button 
                onClick={isRecording ? stopRecording : startRecording}
                className={`h-10 px-4 rounded-xl border flex items-center gap-2 transition-all duration-300 ${
                    isRecording 
                    ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' 
                    : 'bg-white border-gray-200 hover:border-black text-black'
                }`}
            >
                <Mic className={`w-4 h-4 ${isRecording ? 'text-red-600' : 'text-black'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">{isRecording ? "Grabando..." : "Grabar por Voz"}</span>
            </button>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
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
                <div className="flex gap-3">
                    {["VA", "NVA"].map(val => (
                        <button 
                            key={val}
                            onClick={() => setManualData({...manualData, classification: val})}
                            className={`flex-1 h-14 font-black uppercase tracking-widest text-xs rounded-2xl border-2 transition-all ${
                                manualData.classification === val 
                                ? 'bg-black border-black text-white' 
                                : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                            }`}
                        >
                            {val === 'VA' ? 'Valor Añadido (VA)' : 'No Valor Añadido (NVA)'}
                        </button>
                    ))}
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
                    <div key={act.id || i} className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col md:flex-row md:items-center justify-between p-6">
                        {/* Yellow left border */}
                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#FFD600]" />
                        
                        <div className="pl-4 flex-1 mb-4 md:mb-0">
                            <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-xl font-bold tracking-tight text-black">{act.name}</h4>
                                <span className="bg-black text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">
                                    {categoryBadge}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 font-mono">
                                {act.time_unit} min/unid <span className="mx-2 opacity-50">|</span> {act.volume_daily} unid/día
                            </p>
                        </div>

                        <div className="text-left md:text-right md:pr-12 group-hover:pr-20 transition-all duration-300 pl-4 md:pl-0">
                            <p className="text-3xl font-black tracking-tight text-black">{annualMin.toLocaleString()}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">MIN/AÑO</p>
                        </div>

                        {/* Actions (visible on hover) */}
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 hidden md:flex">
                            <Button variant="ghost" onClick={() => onDelete(act.id)} className="w-10 h-10 p-0 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                            </Button>
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
