'use client';

import { useState, useRef } from 'react';

export default function VoiceCapture({ onTranscription }) {
  const [isRecording, setIsRecording] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        await sendToTranscription(audioBlob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
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
    formData.append('file', blob, 'recording.wav');

    try {
      const response = await fetch('http://localhost:8000/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Transcription failed');
      
      const data = await response.json();
      setInputText(data.text);
      
      // Solo llamar a onTranscription si hay texto real (evita error 400 por silencio)
      if (data.text && data.text.trim().length > 0 && onTranscription) {
        onTranscription(data.text.trim());
      }
    } catch (err) {
      console.error("Transcription error:", err);
      setInputText("Error al transcribir. Revisa la consola.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = () => {
    if (inputText.trim() && onTranscription) {
      onTranscription(inputText.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-10 border-4 border-primary rounded-none bg-white max-w-2xl mx-auto">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black uppercase tracking-tighter">
          {isRecording ? "Capturando..." : "Describe la actividad"}
        </h2>
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] max-w-xs mx-auto">
          Sistema de entrada por voz con análisis heurístico de procesos
        </p>
      </div>
      
      {/* Mic Button Area Industrial */}
      <div className="flex flex-col items-center space-y-6">
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          className={`w-32 h-32 flex items-center justify-center transition-all duration-300 border-4 border-primary ${
            isRecording ? "bg-secondary voice-pulse" : "bg-primary text-secondary hover:bg-secondary hover:text-primary"
          }`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" x2="12" y1="19" y2="22"/>
          </svg>
        </button>
        <div className="bg-primary text-secondary px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em]">
          {isRecording ? "SOLTAR PARA PROCESAR" : "MANTENER PARA HABLAR"}
        </div>
      </div>

      <div className="w-full space-y-6">
        <div className="relative group">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="O ESCRIBE LA ACTIVIDAD AQUÍ..."
            className="w-full min-h-[140px] p-6 bg-muted border-2 border-primary rounded-none text-xl font-black uppercase tracking-tight focus:bg-white transition-colors outline-none resize-none placeholder:text-primary/20"
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center border-2 border-primary">
              <div className="flex items-center space-x-3 text-primary font-black animate-pulse uppercase tracking-[0.2em] text-sm">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Procesando...</span>
              </div>
            </div>
          )}
        </div>

        {inputText.trim() && !isProcessing && (
          <button
            onClick={handleManualSubmit}
            className="w-full h-16 bg-primary text-secondary font-black uppercase tracking-[0.2em] text-sm border-2 border-primary hover:bg-secondary hover:text-primary transition-all flex items-center justify-center gap-2 group"
          >
            <span>Ejecutar Análisis ASME</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
}

function Loader2({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
  );
}
