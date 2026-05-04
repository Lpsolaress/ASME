'use client';

import { Check, ArrowLeft, Zap, Mic, Loader2 } from "lucide-react";
import ActivityCard from "./ActivityCard";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState, useRef } from "react";

export default function ActivityList({ 
  session, 
  activities, 
  onDelete, 
  onAnalyze, 
  onTranscription, 
  isProcessingExternal,
  onBack 
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

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
      if (!response.ok) throw new Error('Transcription failed');
      const data = await response.json();
      onTranscription(data.text);
    } catch (err) {
      alert("Error en la transcripción.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stepper Step 3 */}
      <div className="flex items-center justify-between px-16 relative">
        <div className="absolute top-5 left-24 right-24 h-[2px] bg-gray-100 -z-10" />
        
        {[
          { step: 1, label: 'Setup', completed: true },
          { step: 2, label: 'Data Import', completed: true },
          { step: 3, label: 'Identification', active: true },
          { step: 4, label: 'Analysis', active: false },
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

      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black tracking-tighter uppercase text-primary">Paso 3: Análisis de Proceso</h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Identificación de tareas y clasificación ASME</p>
        </div>

        <div className="space-y-4">
          {activities.map((act) => (
            <ActivityCard key={act.id} data={act} onDelete={onDelete} />
          ))}
          
          {/* Add Activity Voice Bar */}
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-6 space-y-4 group hover:border-primary transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onMouseDown={startRecording} 
                  onMouseUp={stopRecording}
                  onClick={() => {
                    if (isRecording) stopRecording();
                    else startRecording();
                  }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isRecording ? "bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]" : "bg-secondary text-primary hover:bg-primary hover:text-secondary"
                  }`}
                >
                  {isProcessing || isProcessingExternal ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
                </button>
                <div className="space-y-0.5">
                  <p className="text-sm font-black text-primary uppercase">Agregar otra actividad</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {isRecording ? "Grabando... pulsa de nuevo para finalizar" : "Mantén presionado para hablar o usa el teclado"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isManual && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsManual(false)}
                    className="text-[10px] font-black uppercase tracking-widest text-gray-400"
                  >
                    Cancelar
                  </Button>
                )}
                <button 
                  onClick={() => setIsManual(!isManual)}
                  className="text-[10px] font-black uppercase tracking-widest text-primary/40 hover:text-primary underline underline-offset-4"
                >
                  {isManual ? "Cerrar teclado" : "Escribir manualmente"}
                </button>
              </div>
            </div>

            {isManual && (
              <div className="flex gap-3 pt-2 animate-in slide-in-from-top-2 duration-300">
                <input 
                  type="text"
                  autoFocus
                  placeholder="Ej: Revisar facturas de proveedores por 30 minutos..."
                  className="flex-1 h-12 rounded-xl border-2 border-gray-100 px-4 text-sm font-medium focus:border-primary transition-all outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      onTranscription(e.target.value);
                      e.target.value = '';
                      setIsManual(false);
                    }
                  }}
                />
                <Button 
                  onClick={(e) => {
                    const input = e.currentTarget.previousSibling;
                    if (input.value) {
                      onTranscription(input.value);
                      input.value = '';
                      setIsManual(false);
                    }
                  }}
                  className="bg-primary text-secondary h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest"
                >
                  Agregar
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="border-gray-200 rounded-xl px-8 h-12 font-black uppercase text-xs tracking-widest gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Anterior
          </Button>
          <Button 
            onClick={onAnalyze}
            className="bg-black text-white rounded-xl px-12 h-12 font-black uppercase text-xs tracking-widest gap-2 hover:bg-primary hover:text-secondary transition-all"
          >
            <Zap className="w-4 h-4" /> Generar Análisis IA
          </Button>
        </div>
      </div>
    </div>
  );
}
