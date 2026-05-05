'use client';

import { 
  Download, 
  Share2, 
  Copy, 
  Lock,
  ChevronLeft,
  Check,
  Home as HomeIcon
} from "lucide-react";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ExportReportView({ session, activities = [], analysis, selectedActivityId, onDownload, onBack, onHome }) {
  const [copied, setCopied] = useState(false);
  const [directLink, setDirectLink] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDirectLink(`${window.location.origin}/reports/share/${session?.id || 'demo'}`);
    }
  }, [session]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(directLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Prepare chart data from real activities (limited to top 5)
  const topActivities = [...activities]
    .sort((a, b) => (b.annual_minutes || 0) - (a.annual_minutes || 0))
    .slice(0, 5);

  let pdfUrl = '';
  if (session?.id) {
      pdfUrl = `http://localhost:8000/export-pdf/${session.id}?include_analysis=true&preview=true`;
      if (selectedActivityId) {
          pdfUrl += `&activity_id=${selectedActivityId}`;
      }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black font-sans pb-20 animate-in fade-in duration-700">
      {/* Top Navbar */}
      <nav className="bg-white border-b px-8 h-16 flex items-center justify-between sticky top-0 z-[110] shadow-sm">
        <div className="flex items-center space-x-6">
          <button 
            onClick={onHome}
            className="p-2 rounded-xl hover:bg-gray-100 text-black transition-all hover:scale-110 active:scale-95"
          >
            <HomeIcon className="w-5 h-5" />
          </button>
          <span className="font-black text-xl tracking-tighter uppercase italic">ASME DIGITAL</span>
        </div>
        <Button 
          onClick={onDownload}
          className="bg-black text-white hover:bg-black/90 font-black uppercase text-[10px] tracking-widest px-6 h-10 rounded-lg shadow-lg hover:scale-105 transition-all"
        >
          Descargar PDF
        </Button>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12 text-center space-y-8">
        <div className="space-y-3 animate-in slide-in-from-top-4 duration-700">
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">
            Análisis de {session?.company_name || 'Empresa'} — {session?.department || 'Departamento'}
          </p>
        </div>

        {/* Real PDF Preview Container */}
        <div className="relative group max-w-4xl mx-auto animate-in zoom-in-95 duration-1000 delay-200">
          <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden p-4 md:p-6 transform transition-all duration-700 group-hover:shadow-[0_48px_80px_-12px_rgba(0,0,0,0.15)] group-hover:-translate-y-2 h-[800px]">
            
            {/* The PDF iFrame */}
            <div className="w-full h-full rounded-[1.5rem] overflow-hidden border border-gray-100 bg-[#525659] relative flex items-center justify-center">
              {pdfUrl ? (
                <iframe 
                  src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`} 
                  className="w-full h-full border-none"
                  title="PDF Preview"
                />
              ) : (
                <p className="text-white/50 font-bold uppercase tracking-widest text-[10px]">Cargando vista previa...</p>
              )}
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-4">
          <Button 
            onClick={onDownload}
            className="w-full md:w-72 bg-black text-white hover:bg-black/90 h-20 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:scale-105 transition-all group"
          >
            <Download className="w-6 h-6 group-hover:bounce" />
            Descargar PDF
          </Button>
          <Button 
            variant="outline"
            className="w-full md:w-72 bg-[#FFD600] text-black border-none hover:bg-[#FFD600]/90 h-20 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-[0_20px_40px_-10px_rgba(255,214,0,0.3)] hover:scale-105 transition-all"
          >
            <Share2 className="w-6 h-6" />
            Compartir enlace
          </Button>
        </div>

        {/* Direct Link Section */}
        <div className="max-w-md mx-auto space-y-6 pt-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-left text-gray-400 pl-2">Enlace Directo</p>
          <div className="relative group">
            <Input 
              readOnly 
              value={directLink}
              className="bg-white border-gray-200 h-16 pr-14 pl-6 rounded-2xl font-bold text-gray-600 focus-visible:ring-[#FFD600] shadow-sm group-hover:border-gray-300 transition-colors"
            />
            <button 
              onClick={copyToClipboard}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-all hover:scale-110"
            >
              {copied ? <Check className="w-6 h-6 text-green-500" /> : <Copy className="w-6 h-6" />}
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Lock className="w-3 h-3" />
            <p className="text-[11px] font-bold uppercase tracking-widest opacity-60">El enlace expira en 7 días hábiles.</p>
          </div>
        </div>

      </main>

      {/* Floating Back Button */}
      <button 
        onClick={onBack}
        className="fixed bottom-10 left-10 bg-black text-[#FFD600] shadow-2xl p-5 rounded-2xl hover:scale-110 active:scale-95 transition-all z-[120] group"
      >
        <ChevronLeft className="w-7 h-7 group-hover:-translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
