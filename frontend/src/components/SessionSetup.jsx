'use client';

import React, { useState, useRef } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Building2, 
  ArrowRight, 
  Factory,
  Loader2,
  Mic,
  ArrowLeft,
  Edit3,
  Check,
  Target
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const formSchema = z.object({
  company_name: z.string().min(2, { message: "Requerido" }),
  department: z.string().min(2, { message: "Requerido" }),
  task_name: z.string().min(2, { message: "Requerido" }),
  monthly_agreement: z.coerce.number().min(0),
  minutes_per_hour: z.coerce.number().min(0),
});

export default function SessionSetup({ onSessionCreated }) {
  const [step, setStep] = useState(1); // 1: Manual Form, 2: Voice Capture
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [initialClassification, setInitialClassification] = useState("VA");
  
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: "",
      department: "",
      task_name: "",
      monthly_agreement: 160,
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
      const data = await response.json();
      setTranscription(data.text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalSubmit = async (values) => {
    setIsLoading(true);
    try {
      const payload = {
        ...values,
        initial_classification: initialClassification,
        staff_count: 1,
        hourly_cost: 0
      };
      const response = await fetch('http://localhost:8000/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data) onSessionCreated(data);
    } catch (error) {
      console.error("Error creating session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-12">
      <Card className="max-w-2xl mx-auto border border-gray-200 rounded-[24px] shadow-sm bg-white overflow-hidden min-h-[600px] flex flex-col">
        {step === 1 ? (
          <>
            <CardHeader className="px-8 pt-8 pb-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle className="text-base font-medium text-gray-700">Detalles de la Empresa</CardTitle>
                <button 
                    onClick={() => setStep(2)}
                    className="p-2 hover:bg-secondary rounded-full transition-colors text-primary/40 hover:text-primary group"
                >
                    <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
              <Factory className="w-5 h-5 text-gray-300" />
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-8 flex-1">
              <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-md">
                Por favor, proporcione la información básica para inicializar el sistema de análisis industrial.
              </p>

              <Form {...form}>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="company_name" render={({ field }) => (
                        <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-semibold text-gray-700">Nombre de empresa</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej. Sistemas Industriales Avanzados" {...field} className="h-12 border-gray-200 rounded-xl px-4 font-medium" />
                        </FormControl>
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="department" render={({ field }) => (
                        <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-semibold text-gray-700">Departamento</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej. Ingeniería de Producción" {...field} className="h-12 border-gray-200 rounded-xl px-4 font-medium" />
                        </FormControl>
                        </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-2">
                        <FormField control={form.control} name="task_name" render={({ field }) => (
                            <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold text-gray-700">Proceso / Tarea a Analizar</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input placeholder="Ej. Proceso de Facturación Mensual" {...field} className="h-12 border-gray-200 rounded-xl px-4 pl-10 font-medium" />
                                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                </div>
                            </FormControl>
                            </FormItem>
                        )} />
                    </div>
                    <div className="space-y-2">
                        <FormLabel className="text-sm font-semibold text-gray-700">Clasificación Inicial</FormLabel>
                        <div className="flex gap-2">
                            {["VA", "NVA"].map(val => (
                                <button 
                                    key={val}
                                    type="button"
                                    onClick={() => setInitialClassification(val)}
                                    className={`flex-1 h-12 font-black uppercase tracking-widest text-[10px] rounded-xl border-2 transition-all ${
                                        initialClassification === val 
                                        ? 'bg-black border-black text-white shadow-md' 
                                        : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                                    }`}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="monthly_agreement" render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-semibold text-gray-700">Número de tareas</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type="number" {...field} className="h-12 border-gray-200 rounded-xl px-4 pr-12 font-medium" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 tracking-widest">UND</span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="minutes_per_hour" render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-semibold text-gray-700">Minutos por cada tarea</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type="number" {...field} className="h-12 border-gray-200 rounded-xl px-4 pr-12 font-medium" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 tracking-widest">MIN</span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                </form>
              </Form>
              <div className="pt-6 flex justify-end">
                <Button 
                  onClick={form.handleSubmit(handleFinalSubmit)}
                  disabled={isLoading}
                  className="bg-secondary hover:bg-secondary/90 text-black px-10 h-12 rounded-xl font-bold gap-2"
                >
                  Continuar <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="px-8 py-12 flex-1 flex flex-col items-center justify-between space-y-12 animate-in zoom-in-95 duration-500">
            <div className="text-center space-y-4">
                <CardTitle className="text-4xl font-black tracking-tight text-black uppercase italic">Paso 2: Captura de Actividad</CardTitle>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Describe la actividad en voz alta</p>
            </div>

            <div className="flex flex-col items-center space-y-6">
                <button
                  onMouseDown={startRecording} onMouseUp={stopRecording}
                  onTouchStart={startRecording} onTouchEnd={stopRecording}
                  className={`w-36 h-36 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                    isRecording ? "bg-secondary border-black scale-110 shadow-2xl" : "bg-secondary/20 border-gray-100 hover:bg-secondary/40"
                  }`}
                >
                  <Mic className={`w-16 h-16 ${isRecording ? "text-black" : "text-gray-300"}`} />
                </button>
                <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isRecording ? "text-black animate-pulse" : "text-gray-300"}`}>
                  {isRecording ? "ESCUCHANDO..." : "MANTENER PARA HABLAR"}
                </p>
            </div>

            <div className="w-full space-y-4">
                <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50/50 relative min-h-[140px]">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Transcripción en tiempo real</span>
                        <div className="flex items-center space-x-2">
                           <div className={`w-2 h-2 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-gray-300"}`} />
                           <span className={`text-[9px] font-black uppercase tracking-widest ${isRecording ? "text-red-500 font-black" : "text-gray-400"}`}>LIVE</span>
                        </div>
                    </div>
                    <p className={`text-sm font-medium leading-relaxed italic ${transcription ? "text-black" : "text-gray-300"}`}>
                        {isProcessing ? "Procesando audio..." : transcription ? `"${transcription}"` : "Tu voz aparecerá aquí..."}
                    </p>
                    <Edit3 className="absolute bottom-4 right-4 w-4 h-4 text-gray-300 hover:text-black cursor-pointer" />
                </div>
                <button 
                  onClick={() => setStep(1)}
                  className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-black mx-auto block underline underline-offset-4 transition-colors"
                >
                  o escribe aquí
                </button>
            </div>

            <div className="w-full flex justify-between items-center">
                <Button variant="outline" onClick={() => setStep(1)} className="border-gray-200 rounded-xl px-8 h-12 font-bold gap-2 text-gray-500">
                    <ArrowLeft className="w-4 h-4" /> ANTERIOR
                </Button>
                <Button 
                    onClick={() => {
                        const values = form.getValues();
                        if (!values.task_name && transcription) {
                            values.task_name = transcription;
                        }
                        handleFinalSubmit(values);
                    }}
                    disabled={isLoading || !transcription}
                    className="bg-black text-white rounded-xl px-12 h-12 font-bold tracking-widest gap-2 hover:bg-secondary hover:text-black transition-all"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "CONTINUAR"} <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
