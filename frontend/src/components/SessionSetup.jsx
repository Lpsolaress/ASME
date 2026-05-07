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
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
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
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };
      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        if (audioBlob.size > 0) {
          await sendToTranscription(audioBlob);
        }
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access error:", err);
      alert("No se pudo acceder al micrófono. Por favor, verifica los permisos.");
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
      const response = await fetch('http://127.0.0.1:8000/transcribe', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error en la transcripción");
      }
      const data = await response.json();
      
      if (data.text) {
        // Now use the text to fill the whole setup
        const classifyResp = await fetch('http://127.0.0.1:8000/classify-setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: data.text })
        });
        if (classifyResp.ok) {
          const setup = await classifyResp.json();
          if (setup.company_name) form.setValue('company_name', setup.company_name);
          if (setup.department) form.setValue('department', setup.department);
          if (setup.task_name) form.setValue('task_name', setup.task_name);
        } else {
          // Fallback: just put it in task_name
          form.setValue('task_name', data.text);
        }
      }
    } catch (err) {
      console.error("Transcription error:", err);
      alert(`No se pudo procesar el audio: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalSubmit = async (values) => {
    setIsLoading(true);
    try {
      const payload = {
        ...values,
        initial_classification: "VA",
        staff_count: 1,
        hourly_cost: 0
      };
      const response = await fetch('http://127.0.0.1:8000/sessions', {
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
      <Card className="max-w-2xl mx-auto border border-gray-200 rounded-[24px] shadow-sm bg-white overflow-hidden flex flex-col">
        <CardHeader className="px-8 pt-8 pb-4 flex flex-row items-center justify-between border-b border-gray-50 mb-6">
          <div className="flex items-center gap-4">
            <CardTitle className="text-base font-medium text-gray-700">Configuración del Análisis</CardTitle>
            <button
              type="button"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`p-2 rounded-xl transition-all ${
                isRecording 
                ? 'bg-red-500 text-white animate-pulse shadow-lg scale-110' 
                : 'bg-secondary/10 text-primary hover:bg-secondary/20 hover:scale-110'
              }`}
              title="Mantén presionado para dictar toda la información"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          </div>
          <Factory className="w-5 h-5 text-gray-300" />
        </CardHeader>
        <CardContent className="px-8 pb-8 space-y-8 flex-1">
          <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-md">
            {isProcessing 
              ? "Extrayendo información con IA..." 
              : "Por favor, proporcione la información básica o use el micrófono para dictar todo el contexto."}
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

              <div className="grid grid-cols-1 gap-4 items-end">
                <FormField control={form.control} name="task_name" render={({ field }) => (
                    <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold text-gray-700">Proceso / Tarea a Analizar</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <Input 
                              placeholder="Ej. Proceso de Facturación Mensual" 
                              {...field} 
                              className="h-12 border-gray-200 rounded-xl px-4 pl-10 font-medium" 
                            />
                            <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
              </div>
            </form>
          </Form>

          <div className="pt-6 flex justify-end">
            <Button 
              onClick={form.handleSubmit(handleFinalSubmit)}
              disabled={isLoading || isProcessing}
              className="bg-secondary hover:bg-secondary/90 text-black px-10 h-12 rounded-xl font-bold gap-2 shadow-sm"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              Iniciar Análisis <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


