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
  Download
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import VoiceCapture from "@/components/VoiceCapture";
import ActivityCard from "@/components/ActivityCard";
import SessionSetup from "@/components/SessionSetup";
import ProcessAnalysis from "@/components/ProcessAnalysis";
import ReportPreview from "@/components/ReportPreview";
import DashboardCharts from "@/components/DashboardCharts";

export default function Home() {
  const [session, setSession] = useState(null);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activities, setActivities] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

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
    setAnalysis(null); 
    setIsClassifying(true);
    try {
      const response = await fetch('http://localhost:8000/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Classification failed');
      const data = await response.json();
      setCurrentActivity(data);
    } catch (err) {
      console.error("Classification error:", err);
    } finally {
      setIsClassifying(false);
    }
  };

  const confirmActivity = async (data) => {
    try {
      const response = await fetch('http://localhost:8000/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          data: data
        }),
      });

      if (!response.ok) throw new Error('Failed to save activity');
      await fetchActivities();
      setCurrentActivity(null);
    } catch (err) {
      console.error("Error saving activity:", err);
    }
  };

  const deleteActivity = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta actividad?')) return;
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
    <div className="min-h-screen bg-slate-50/50 font-sans text-black pb-32">
      {/* Navbar Moderno shadcn */}
      <nav className="border-b bg-white/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
              <span className="text-primary font-black text-xl">A</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tighter uppercase italic leading-none">ASME Digital</span>
              <span className="text-[8px] uppercase font-black tracking-[0.3em] text-gray-400">Process Intelligence</span>
            </div>
          </div>
          
          {session && (
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPreview(true)}
                className="rounded-full font-bold uppercase text-[10px] tracking-widest hidden md:flex"
              >
                <Eye className="w-3.5 h-3.5 mr-2" />
                Vista Previa
              </Button>
              <div className="h-8 w-px bg-gray-200" />
              <div className="text-right">
                <p className="text-[10px] uppercase font-black text-gray-400 leading-none mb-1">Empresa</p>
                <p className="font-bold text-sm tracking-tight">{session.company_name}</p>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {!session ? (
          <SessionSetup onSessionCreated={setSession} />
        ) : (
          <>
            {/* Area de Captura e IA */}
            <section className="space-y-10">
              {!currentActivity && !isClassifying && !analysis && (
                <div className="text-center space-y-4 py-10 animate-in fade-in slide-in-from-top-4 duration-1000">
                  <Badge variant="outline" className="rounded-full px-4 py-1 border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-widest text-[9px]">
                    IA Analysis Engine v4.0
                  </Badge>
                  <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.85]">
                    Mapea tu <br />
                    <span className="text-primary drop-shadow-sm">proceso</span>
                  </h1>
                </div>
              )}

              <div className="max-w-4xl mx-auto">
                {isClassifying ? (
                  <Card className="border-none shadow-2xl rounded-[3rem] p-20 text-center space-y-6">
                    <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
                    <div className="space-y-2">
                       <p className="text-2xl font-black uppercase italic tracking-tighter">Analizando Captura...</p>
                       <p className="text-gray-400 text-sm font-medium">Extrayendo datos complejos y categorizando bajo ASME...</p>
                    </div>
                  </Card>
                ) : isAnalyzing ? (
                  <Card className="border-none shadow-2xl rounded-[3rem] p-20 text-center space-y-8">
                    <div className="relative mx-auto w-24 h-24">
                       <Zap className="w-full h-full text-primary animate-pulse" />
                    </div>
                    <div className="space-y-2">
                       <p className="text-3xl font-black uppercase italic tracking-tighter">Generando Plan Estratégico</p>
                       <p className="text-gray-400">Analizando el impacto de {activities.length} actividades...</p>
                    </div>
                  </Card>
                ) : currentActivity ? (
                  <ActivityCard data={currentActivity} onConfirm={confirmActivity} onCancel={() => setCurrentActivity(null)} />
                ) : analysis ? (
                  <ProcessAnalysis analysis={analysis} onExport={() => handleExport(true)} />
                ) : (
                  <VoiceCapture onTranscription={handleTranscription} />
                )}
              </div>
            </section>

            {/* Dashboard y Listado */}
            {(activities.length > 0 || isLoadingActivities) && !analysis && (
              <Tabs defaultValue="list" className="space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b-2 border-black pb-6">
                  <div className="space-y-1">
                    <h3 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Dashboard</h3>
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-primary text-black font-black rounded-full">{activities.length} Actividades</Badge>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{session.department}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <TabsList className="bg-gray-100 p-1 rounded-full h-12">
                      <TabsTrigger value="list" className="rounded-full px-6 font-bold uppercase text-[10px] data-[state=active]:bg-white shadow-none">
                        <List className="w-3 h-3 mr-2" />
                        Lista
                      </TabsTrigger>
                      <TabsTrigger value="charts" className="rounded-full px-6 font-bold uppercase text-[10px] data-[state=active]:bg-white shadow-none">
                        <BarChart3 className="w-3 h-3 mr-2" />
                        Métricas
                      </TabsTrigger>
                    </TabsList>
                    
                    <Button 
                      onClick={runFinalAnalysis}
                      className="h-12 rounded-full font-black uppercase text-[10px] tracking-widest px-8 shadow-xl shadow-primary/20 text-black"
                    >
                      <Zap className="w-3.5 h-3.5 mr-2" />
                      Análisis IA
                    </Button>
                  </div>
                </div>

                <TabsContent value="charts" className="mt-0">
                  <DashboardCharts activities={activities} />
                </TabsContent>

                <TabsContent value="list" className="mt-0">
                  <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
                    <CardContent className="p-0">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                            <th className="px-8 py-5">Actividad</th>
                            <th className="px-6 py-5">Categoría</th>
                            <th className="px-6 py-5">Clasificación</th>
                            <th className="px-6 py-5 text-right">Carga Anual</th>
                            <th className="px-8 py-5 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {activities.map((act) => (
                            <tr key={act.id} className="group hover:bg-gray-50/50 transition-colors">
                              <td className="px-8 py-6">
                                <p className="font-bold text-lg tracking-tight">{act.name}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">{act.time_unit} min • {act.volume_daily} / día</p>
                              </td>
                              <td className="px-6 py-6 font-bold text-xs uppercase tracking-widest text-gray-500">{act.category}</td>
                              <td className="px-6 py-6">
                                <Badge className={act.classification === 'VA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                  {act.classification}
                                </Badge>
                              </td>
                              <td className="px-6 py-6 text-right">
                                <p className="font-black text-2xl tracking-tighter">{act.annual_minutes?.toLocaleString()}</p>
                                <p className="text-[9px] font-bold text-gray-400 uppercase">minutos</p>
                              </td>
                              <td className="px-8 py-6 text-right">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => deleteActivity(act.id)}
                                  className="rounded-full hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </>
        )}
      </main>

      {/* Preview Modal */}
      {showPreview && (
        <ReportPreview 
          session={session} 
          activities={activities} 
          analysis={analysis} 
          onClose={() => setShowPreview(false)} 
          onDeleteActivity={deleteActivity} 
        />
      )}

      {/* Footer Pro shadcn */}
      {session && (
        <footer className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-xl text-white py-4 px-8 rounded-full border border-white/10 shadow-2xl z-50 flex items-center space-x-10">
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#FFD600]" />
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
               Session Active: <span className="text-white ml-2">{activities.length}</span>
            </div>
          </div>
          
          <div className="h-6 w-px bg-white/10" />

          <div className="flex items-center space-x-4">
             {analysis && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setAnalysis(null)}
                className="text-[10px] font-bold text-gray-400 hover:text-white uppercase tracking-widest"
              >
                Cerrar Análisis
              </Button>
             )}
             <Button 
                size="sm"
                onClick={() => handleExport(!!analysis)}
                className="bg-primary text-black font-black uppercase text-[10px] tracking-widest px-6 rounded-full hover:scale-105"
             >
                <Download className="w-3.5 h-3.5 mr-2" />
                {analysis ? 'Exportar con IA' : 'Descargar PDF'}
             </Button>
          </div>
        </footer>
      )}
    </div>
  );
}

function Loader2({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
  );
}
