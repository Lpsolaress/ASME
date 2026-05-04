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
  Check
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

export default function Home() {
  const [session, setSession] = useState(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activities, setActivities] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [showFinalReport, setShowFinalReport] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

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

  const handleTranscription = async (text) => {
    setIsClassifying(true);
    try {
      // 1. Classify the transcription
      const classifyResp = await fetch(`http://localhost:8000/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (!classifyResp.ok) throw new Error("Classification failed");
      const classifiedData = await classifyResp.json();

      // 2. Save the classified activity
      const saveResp = await fetch(`http://localhost:8000/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          session_id: session.id,
          data: classifiedData 
        })
      });

      if (saveResp.ok) {
        await fetchActivities();
      }
    } catch (err) {
      console.error("Classification/Save error:", err);
    } finally {
      setIsClassifying(false);
    }
  };

  const deleteActivity = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/activities/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchActivities();
        setAnalysis(null);
      }
    } catch (err) {
      console.error("Error deleting activity:", err);
    }
  };

  const runFinalAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch(`http://localhost:8000/sessions/${session.id}/analyze`);
      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error("Analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = (includeAnalysis = false) => {
    if (!session) return;
    const url = `http://localhost:8000/export-pdf/${session.id}${includeAnalysis ? '?include_analysis=true' : ''}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`min-h-screen font-sans ${!session && !showSetup ? 'bg-engineering-grid text-white' : 'bg-background text-foreground'} pb-32 transition-colors duration-500`}>
      {/* Navbar Industrial */}
      <nav className={`border-b sticky top-0 z-50 transition-all duration-500 ${!session && !showSetup ? 'bg-transparent border-white/5' : 'bg-white border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className={`font-black text-xl tracking-tighter uppercase ${!session && !showSetup ? 'text-white' : 'text-primary'}`}>ASME Digital</span>
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
                activities={activities}
                analysis={analysis} 
                onExport={() => handleExport(true)} 
                onReset={() => {
                  setSession(null);
                  setActivities([]);
                  setAnalysis(null);
                  setShowFinalReport(false);
                  setShowSetup(true);
                }}
              />
            ) : analysis ? (
              <ProcessAnalysis 
                session={session}
                analysis={analysis} 
                onContinue={() => setShowFinalReport(true)} 
                onBack={() => setAnalysis(null)} 
              />
            ) : (
              <ActivityList 
                session={session}
                activities={activities}
                onDelete={deleteActivity}
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
    </div>
  );
}

function Loader2({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
  );
}
