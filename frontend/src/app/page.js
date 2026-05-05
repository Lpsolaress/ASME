'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Settings, 
  BarChart3, 
  List, 
  FileText, 
  Eye, 
  Trash2, 
  Mic, 
  Database, 
  Zap,
  ChevronRight,
  TrendingDown,
  Download,
  Check,
  Home as HomeIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import VoiceCapture from "@/components/VoiceCapture";
import ActivityList from "@/components/ActivityList";
import SessionSetup from "@/components/SessionSetup";
import ProcessAnalysis from "@/components/ProcessAnalysis";
import FinalReport from "@/components/FinalReport";
import AnalysisLoader from "@/components/AnalysisLoader";
import ExportReportView from "@/components/ExportReportView";
import AnalyzedTaskList from "@/components/AnalyzedTaskList";
import { useToast } from "@/components/ui/toaster";

export default function Home() {
  const { toast } = useToast();
  const [session, setSession] = useState(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activities, setActivities] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showFinalReport, setShowFinalReport] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showExportView, setShowExportView] = useState(false);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  const resetApp = () => {
    setSession(null);
    setActivities([]);
    setAnalysis(null);
    setSelectedActivity(null);
    setShowFinalReport(false);
    setShowPreview(false);
    setShowExportView(false);
    setShowSetup(false);
    localStorage.removeItem('asme_session');
  };

  // 1. Persistencia de Sesión
  useEffect(() => {
    const savedSession = localStorage.getItem('asme_session');
    if (savedSession) {
      try {
        setSession(JSON.parse(savedSession));
      } catch (e) {
        console.error("Error loading session:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (session) {
      localStorage.setItem('asme_session', JSON.stringify(session));
    }
  }, [session]);

  // Load activities when session changes
  useEffect(() => {
    if (session?.id) {
      fetchActivities();
    }
  }, [session]);

  const fetchActivities = async () => {
    setIsLoadingActivities(true);
    try {
      const resp = await fetch(`http://localhost:8000/sessions/${session.id}/activities`);
      if (resp.ok) {
        const data = await resp.json();
        setActivities(data);
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  // Helper para peticiones con reintento
  const fetchWithRetry = async (url, options, retries = 2) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return response;
    } catch (err) {
      if (retries > 0) {
        toast({ 
          title: "Problema de Conexión", 
          description: "Reintentando comunicación con el servidor...",
          variant: "default" 
        });
        await new Promise(r => setTimeout(r, 1500));
        return fetchWithRetry(url, options, retries - 1);
      }
      throw err;
    }
  };

  const handleTranscription = async (input) => {
    setIsClassifying(true);
    try {
      let activityData;
      
      if (typeof input === 'string') {
        const classifyResp = await fetchWithRetry(`http://localhost:8000/classify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: input })
        });
        activityData = await classifyResp.json();
      } else {
        activityData = input;
      }

      const saveResp = await fetchWithRetry(`http://localhost:8000/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          session_id: session.id,
          data: activityData 
        })
      });

      if (saveResp.ok) {
        await fetchActivities();
        toast({
          title: "Actividad Guardada",
          description: "Los datos se han procesado y guardado correctamente.",
          variant: "success"
        });
      }
    } catch (err) {
      toast({
        title: "Error al Guardar",
        description: "No se pudo procesar la actividad. Por favor intente de nuevo.",
        variant: "destructive"
      });
      console.error("Activity Save error:", err);
    } finally {
      setIsClassifying(false);
    }
  };

  const updateActivity = async (id, updatedData) => {
    try {
      const response = await fetchWithRetry(`http://localhost:8000/activities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (response.ok) {
        await fetchActivities();
        toast({
          title: "Actividad Actualizada",
          description: "Los cambios se han guardado correctamente.",
          variant: "success"
        });
      }
    } catch (err) {
      toast({
        title: "Error al Actualizar",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive"
      });
      console.error("Error updating activity:", err);
    }
  };

  const deleteActivity = async (id) => {
    try {
      const response = await fetchWithRetry(`http://localhost:8000/activities/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchActivities();
        setAnalysis(null);
        toast({
          title: "Actividad Eliminada",
          description: "La actividad ha sido removida del registro.",
          variant: "default"
        });
      }
    } catch (err) {
      toast({
        title: "Error al Eliminar",
        description: "No se pudo eliminar la actividad.",
        variant: "destructive"
      });
      console.error("Error deleting activity:", err);
    }
  };

  const runFinalAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetchWithRetry(`http://localhost:8000/sessions/${session.id}/analyze`);
      const data = await response.json();
      setAnalysis(data);
      toast({
        title: "Análisis Completado",
        description: "Se han generado nuevas recomendaciones de ingeniería.",
        variant: "success"
      });
    } catch (err) {
      toast({
        title: "Fallo en el Análisis",
        description: "La IA no pudo completar el informe. Reintente.",
        variant: "destructive"
      });
      console.error("Analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = () => {
    setShowExportView(true);
  };

  const triggerRealDownload = (includeAnalysis = true) => {
    if (!session) return;
    const url = `http://localhost:8000/export-pdf/${session.id}${includeAnalysis ? '?include_analysis=true' : ''}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`min-h-screen font-sans ${!session && !showSetup ? 'bg-engineering-grid text-white' : 'bg-background text-foreground'} pb-32 transition-colors duration-500`}>
      {/* Navbar Industrial */}
      <nav className={`border-b sticky top-0 z-50 transition-all duration-500 ${!session && !showSetup ? 'bg-transparent border-white/5' : 'bg-white border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <button 
              onClick={resetApp}
              className={`p-2 rounded-xl transition-all hover:scale-110 active:scale-95 ${!session && !showSetup ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-primary'}`}
            >
              <HomeIcon className="w-6 h-6" />
            </button>
            <span className={`font-black text-xl tracking-tighter uppercase ${!session && !showSetup ? 'text-white' : 'text-primary'}`}>ASME DIGITAL</span>
          </div>
          
          {session && (
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-[10px] uppercase font-black text-muted-foreground leading-none mb-1 text-primary">Empresa</p>
                <p className="font-black text-sm tracking-tight text-primary">{session.company_name}</p>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Stepper Industrial */}
      {(session || showSetup) && !showExportView && (
        <div className="bg-gray-50/50 border-b py-8 animate-in slide-in-from-top duration-500">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex justify-between items-center relative">
              {/* Lines connecting steps */}
              <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-200 -z-10"></div>
              
              {[
                { label: "INICIO", step: 1, active: !session },
                { label: "CAPTURA", step: 2, active: session && !analysis },
                { label: "ANÁLISIS", step: 3, active: !!analysis && !showFinalReport },
                { label: "REPORTE", step: 4, active: showFinalReport }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center space-y-3 group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                    item.active 
                    ? 'bg-secondary border-black text-black scale-110 shadow-lg' 
                    : 'bg-white border-gray-200 text-gray-400 group-hover:border-gray-300'
                  }`}>
                    <span className="font-black text-sm">{item.step}</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                    item.active ? 'text-black' : 'text-gray-400'
                  }`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6">
        {!session ? (
          !showSetup ? (
            <section className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12 py-20 animate-in fade-in zoom-in duration-1000">
              <div className="space-y-6 max-w-4xl">
                <h1 className="text-8xl md:text-9xl font-black tracking-tighter leading-[0.8] text-secondary uppercase">
                  Analiza tu proceso <br />
                  en minutos
                </h1>
                <p className="text-xl text-white/50 font-medium max-w-2xl mx-auto leading-relaxed">
                  Optimizamos la automatización industrial mediante análisis de datos en tiempo real. 
                  Obtén visibilidad total de tu cadena de producción con precisión de ingeniería.
                </p>
              </div>
              
              <Button 
                onClick={() => setShowSetup(true)}
                className="bg-secondary text-primary font-black uppercase text-lg tracking-widest px-12 h-20 rounded-xl hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,214,0,0.2)]"
              >
                Empezar análisis
              </Button>
            </section>
          ) : (
            <div className="py-16">
               <SessionSetup onSessionCreated={(s) => { 
                 setSession(s); 
                 setShowSetup(false);
                 if (s.initial_transcription) {
                   handleTranscription(s.initial_transcription);
                 }
               }} />
            </div>
          )
        ) : (
          <div className="py-8">
            {isClassifying && activities.length === 0 ? (
              <div className="max-w-4xl mx-auto py-20 text-center space-y-8 animate-pulse">
                <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
                <p className="text-2xl font-black uppercase tracking-tight text-primary">Procesando Actividad...</p>
              </div>
            ) : isAnalyzing ? (
              <AnalysisLoader />
            ) : showFinalReport ? (
              <FinalReport 
                session={session}
                activities={selectedActivity ? [selectedActivity] : activities}
                analysis={analysis} 
                onExport={() => handleExport(true)} 
                onBack={() => setShowFinalReport(false)}
                onReset={() => {
                  setSession(null);
                  setActivities([]);
                  setAnalysis(null);
                  setSelectedActivity(null);
                  setShowFinalReport(false);
                  setShowSetup(true);
                }}
              />
            ) : analysis && selectedActivity ? (
              <ProcessAnalysis 
                session={session}
                activities={[selectedActivity]} // Pass exactly the selected activity
                analysis={{...analysis, suggestions: analysis.suggestions.filter(s => s.activity_name === selectedActivity.name)}} 
                onContinue={() => setShowFinalReport(true)} 
                onBack={() => setSelectedActivity(null)} 
              />
            ) : analysis ? (
              <AnalyzedTaskList
                activities={activities}
                analysis={analysis}
                onSelectTask={(task) => setSelectedActivity(task)}
                onBack={() => setAnalysis(null)}
              />
            ) : (
              <ActivityList 
                session={session}
                activities={activities}
                onDelete={deleteActivity}
                onUpdate={updateActivity}
                onAnalyze={runFinalAnalysis}
                onTranscription={handleTranscription}
                isProcessingExternal={isClassifying}
                onBack={() => {
                  setShowSetup(true);
                  setSession(null);
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* Export View Modal Overlay */}
      {showExportView && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <ExportReportView 
            session={session}
            activities={selectedActivity ? [selectedActivity] : activities}
            analysis={analysis}
            selectedActivityId={selectedActivity?.id}
            onDownload={() => triggerRealDownload(true)}
            onBack={() => setShowExportView(false)}
            onHome={resetApp}
          />
        </div>
      )}
    </div>
  );
}

function Loader2({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
  );
}
