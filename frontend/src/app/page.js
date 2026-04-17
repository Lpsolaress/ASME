'use client';

import { useState } from 'react';
import VoiceCapture from "@/components/VoiceCapture";
import ActivityCard from "@/components/ActivityCard";

export default function Home() {
  const [currentActivity, setCurrentActivity] = useState(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [activities, setActivities] = useState([]);

  const handleTranscription = async (text) => {
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
      alert("No se pudo clasificar la actividad. Revisa la consola.");
    } finally {
      setIsClassifying(false);
    }
  };

  const confirmActivity = (data) => {
    setActivities([...activities, data]);
    setCurrentActivity(null);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-black pb-32">
      {/* Header */}
      <nav className="border-b border-gray-100 py-6 px-10 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-primary font-bold">A</span>
          </div>
          <span className="font-bold text-xl tracking-tight uppercase">ASME Digital</span>
        </div>
        <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-500 uppercase tracking-widest">
          <a href="#" className="text-black">Análisis</a>
          <a href="#" className="hover:text-black transition-colors">Historial</a>
          <a href="#" className="hover:text-black transition-colors">Exportar</a>
        </div>
      </nav>

      {/* Hero / Main Content */}
      <main className="max-w-5xl mx-auto px-10 py-12">
        {!currentActivity && !isClassifying ? (
          <div className="text-center mb-16 space-y-4 animate-in fade-in duration-700">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
              Mapea tu proceso <br />
              con el <span className="text-primary">poder de la IA</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Transforma descripciones de voz en estudios ASME estructurados. Identifica el valor añadido al instante.
            </p>
          </div>
        ) : null}

        <section className="relative transition-all duration-500">
          {!currentActivity && !isClassifying ? (
            <div className="relative">
              <VoiceCapture onTranscription={handleTranscription} />
            </div>
          ) : isClassifying ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-lg font-medium animate-pulse text-gray-500 uppercase tracking-widest">
                La IA está clasificando tu actividad...
              </p>
            </div>
          ) : (
            <ActivityCard 
              data={currentActivity} 
              onConfirm={confirmActivity}
              onCancel={() => setCurrentActivity(null)}
            />
          )}
        </section>

        {/* Counter / List Summary */}
        {activities.length > 0 && (
          <div className="mt-20 space-y-6">
            <div className="flex items-end justify-between border-b-2 border-black pb-2">
              <h3 className="text-2xl font-black uppercase italic">Actividades Registradas</h3>
              <span className="text-sm font-bold bg-primary px-3 py-1 rounded-full">
                {activities.length} total
              </span>
            </div>
            <div className="grid gap-4">
              {activities.map((act, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-primary transition-all group">
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-10 rounded-full ${act.classification === 'VA' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <h4 className="font-bold">{act.name}</h4>
                      <div className="flex space-x-2 text-[10px] uppercase font-bold text-gray-400">
                        <span>{act.category}</span>
                        <span>•</span>
                        <span>{act.time_unit} min</span>
                        <span>•</span>
                        <span>{act.volume_daily}/día</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-xl tracking-tighter">
                      {(act.time_unit * act.volume_daily * 20 * 12).toLocaleString()}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-gray-400">Minutos Anuales</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer / Status Bar (Sticky) */}
      <footer className="fixed bottom-0 w-full bg-black text-white py-4 px-10 flex justify-between items-center border-t border-gray-800 z-50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-mono uppercase text-gray-400 font-bold">IA Ready</span>
          </div>
          <span className="text-gray-400">|</span>
          <div className="text-xs font-mono uppercase font-bold">
            Carga Total: <span className="text-primary">
              {activities.reduce((sum, a) => sum + (a.time_unit * a.volume_daily), 0).toLocaleString()} min/día
            </span>
          </div>
        </div>
        <button className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">
          Exportar Informe
        </button>
      </footer>
    </div>
  );
}
