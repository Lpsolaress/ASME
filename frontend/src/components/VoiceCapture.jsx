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
    <div className="flex flex-col items-center justify-center p-8 space-y-8 glass-card max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center">
        {isRecording ? "Escuchando..." : "Describe la actividad"}
      </h2>
      
      <p className="text-gray-500 text-center max-w-md">
        Di qué estás haciendo o escríbelo abajo. La IA hará el resto automáticamente.
      </p>

      {/* Mic Button Area */}
      <div className="flex flex-col items-center space-y-4">
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 ${
            isRecording ? "bg-primary voice-pulse scale-110" : "bg-primary hover:scale-105"
          }`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-black"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" x2="12" y1="19" y2="22"/>
          </svg>
        </button>
        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
          {isRecording ? "Suelto para finalizar" : "Mantén para hablar"}
        </p>
      </div>

      <div className="w-full space-y-4">
        <div className="relative group">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="O escribe la actividad aquí..."
            className="w-full min-h-[120px] p-5 bg-gray-50 border border-gray-100 rounded-2xl text-lg focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none"
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-2xl flex items-center justify-center">
              <div className="flex items-center space-x-2 text-primary font-bold animate-pulse uppercase tracking-widest text-xs">
                <span>Transcribiendo...</span>
              </div>
            </div>
          )}
        </div>

        {inputText.trim() && !isProcessing && (
          <button
            onClick={handleManualSubmit}
            className="w-full primary-button flex items-center justify-center space-x-2 animate-in fade-in slide-in-from-top-2"
          >
            <span>Analizar Actividad con IA</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        )}
      </div>
    </div>
  );
}
