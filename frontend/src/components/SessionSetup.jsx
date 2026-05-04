'use client';

import { useState, useRef } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Building2, ChevronRight, Loader2, Mic, ArrowLeft, ArrowRight, Check, Edit3 } from "lucide-react";

const formSchema = z.object({
  company_name: z.string().min(2, { message: "Requerido" }),
  department: z.string().min(2, { message: "Requerido" }),
  task_name: z.string().min(2, { message: "Requerido" }),
  monthly_agreement: z.coerce.number().min(0),
  minutes_per_hour: z.coerce.number().min(0),
});

export default function SessionSetup({ onSessionCreated }) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: "",
      department: "",
      task_name: "",
      monthly_agreement: 0,
      minutes_per_hour: 60,
    },
  });

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
      setTranscription(data.text);
    } catch (err) {
      setTranscription("Error en la transcripción.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalSubmit = async (transcriptionValue = "") => {
    setIsLoading(true);
    const values = form.getValues();
    try {
      const response = await fetch('http://localhost:8000/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, initial_transcription: transcriptionValue || transcription }),
      });
      if (!response.ok) throw new Error('Failed');
      const sessionData = await response.json();
      onSessionCreated({ 
        ...sessionData, 
        initial_transcription: transcriptionValue || transcription 
      });
    } catch (err) {
      alert("Error al finalizar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stepper Industrial Updated */}
      <div className="flex items-center justify-between px-16 relative">
        <div className="absolute top-5 left-24 right-24 h-[2px] bg-gray-100 -z-10" />
        
        {[
          { step: 1, label: 'Inicio', active: step >= 1, completed: step > 1 },
          { step: 2, label: 'Captura', active: step >= 2, completed: step > 2 },
          { step: 3, label: 'Análisis', active: step >= 3, completed: step > 3 },
          { step: 4, label: 'Reporte', active: step >= 4, completed: step > 4 },
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

      <Card className="border border-gray-200 rounded-2xl shadow-sm bg-white overflow-hidden max-w-3xl mx-auto min-h-[500px] flex flex-col">
        {step === 1 ? (
          <>
            <CardHeader className="border-b border-gray-50 px-8 py-6 flex flex-row items-center justify-between">
              <div className="flex items-center space-x-3">
                <CardTitle className="text-lg font-black tracking-tight text-primary uppercase">Detalles de la Empresa</CardTitle>
                <button 
                  onClick={() => setStep(2)}
                  className="p-2 hover:bg-secondary rounded-full transition-colors text-primary/40 hover:text-primary"
                  title="Captura por voz"
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>
              <Building2 className="w-5 h-5 text-gray-300" />
            </CardHeader>
            <CardContent className="p-8 space-y-8 flex-1">
              <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-md">
                Por favor, proporcione la información básica para inicializar el sistema de análisis industrial.
              </p>
              <Form {...form}>
                <form className="space-y-6">
                  <div className="space-y-4">
                    <FormField control={form.control} name="company_name" render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[11px] uppercase font-black tracking-widest text-primary/70">Nombre de empresa</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ej. Sistemas Industriales Avanzados" 
                            {...field} 
                            className="h-14 rounded-full border-2 border-black px-6 focus:ring-0 focus:border-secondary transition-all font-bold" 
                          />
                        </FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="department" render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[11px] uppercase font-black tracking-widest text-primary/70">Departamento</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ej. Ingeniería de Producción" 
                            {...field} 
                            className="h-14 rounded-full border-2 border-black px-6 focus:ring-0 focus:border-secondary transition-all font-bold" 
                          />
                        </FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="task_name" render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[11px] uppercase font-black tracking-widest text-primary/70">Tarea / Proceso a Analizar</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ej. Proceso de Facturación Mensual" 
                            {...field} 
                            className="h-14 rounded-full border-2 border-black px-6 focus:ring-0 focus:border-secondary transition-all font-bold" 
                          />
                        </FormControl>
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="monthly_agreement" render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-[11px] uppercase font-black tracking-widest text-primary/70">Convenio mensual</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="number" 
                                {...field} 
                                className="h-14 rounded-full border-2 border-black px-6 pr-12 focus:ring-0 focus:border-secondary transition-all font-bold" 
                              />
                              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">MIN</span>
                            </div>
                          </FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="minutes_per_hour" render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-[11px] uppercase font-black tracking-widest text-primary/70">Minutos por hora</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="number" 
                                {...field} 
                                className="h-14 rounded-full border-2 border-black px-6 pr-12 focus:ring-0 focus:border-secondary transition-all font-bold" 
                              />
                              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">M/H</span>
                            </div>
                          </FormControl>
                        </FormItem>
                      )} />
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
            <div className="p-8 bg-gray-50/50 flex justify-end">
              <Button 
                onClick={form.handleSubmit(() => handleFinalSubmit())} 
                disabled={isLoading}
                className="bg-black text-white font-black uppercase text-xs tracking-widest px-10 h-12 rounded-xl hover:bg-primary hover:text-secondary gap-2 group"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continuar"} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <CardHeader className="px-8 py-12 text-center space-y-4">
              <CardTitle className="text-4xl font-black tracking-tighter uppercase text-primary">Paso 2: Captura de Actividad</CardTitle>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Describe la actividad en voz alta</p>
            </CardHeader>
            <CardContent className="px-8 pb-8 flex-1 flex flex-col items-center space-y-10">
              <div className="flex flex-col items-center space-y-4">
                <button
                  onMouseDown={startRecording} onMouseUp={stopRecording}
                  onTouchStart={startRecording} onTouchEnd={stopRecording}
                  className={`w-32 h-32 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    isRecording ? "bg-secondary border-primary voice-pulse scale-110" : "bg-secondary/20 border-gray-100 hover:bg-secondary/40"
                  }`}
                >
                  <Mic className={`w-12 h-12 ${isRecording ? "text-primary" : "text-gray-400"}`} />
                </button>
                <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isRecording ? "text-primary animate-pulse" : "text-gray-300"}`}>
                  {isRecording ? "ESCUCHANDO..." : "MANTENER PARA HABLAR"}
                </p>
              </div>

              <div className="w-full max-w-xl space-y-4">
                <div className="border border-gray-200 rounded-xl p-6 bg-gray-50/30 relative min-h-[140px]">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Transcripción en tiempo real</span>
                    <div className="flex items-center space-x-2">
                       <div className={`w-2 h-2 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-gray-300"}`} />
                       <span className={`text-[9px] font-black uppercase tracking-widest ${isRecording ? "text-red-500" : "text-gray-400"}`}>LIVE</span>
                    </div>
                  </div>
                  <p className={`text-sm font-medium leading-relaxed italic ${transcription ? "text-primary" : "text-gray-300"}`}>
                    {isProcessing ? "Procesando audio..." : transcription ? `"${transcription}"` : "Tu voz aparecerá aquí..."}
                  </p>
                  <Edit3 className="absolute bottom-4 right-4 w-4 h-4 text-gray-300 hover:text-primary cursor-pointer" />
                </div>
                <button 
                  onClick={() => setStep(1)}
                  className="text-[10px] font-black uppercase tracking-widest text-primary/40 hover:text-primary mx-auto block underline underline-offset-4"
                >
                  o escribe aquí
                </button>
              </div>
            </CardContent>
            <div className="p-8 border-t border-gray-50 flex justify-between items-center">
              <Button variant="outline" onClick={() => setStep(1)} className="border-gray-200 rounded-xl px-8 h-12 font-black uppercase text-xs tracking-widest gap-2">
                <ArrowLeft className="w-4 h-4" /> Anterior
              </Button>
              <Button 
                onClick={handleFinalSubmit}
                disabled={isLoading || (!transcription && !isProcessing)}
                className="bg-black text-white rounded-xl px-12 h-12 font-black uppercase text-xs tracking-widest gap-2 hover:bg-primary hover:text-secondary transition-all"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continuar"} <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
