'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X, Clock, BarChart, Info } from "lucide-react";

export default function ActivityCard({ data, onConfirm, onCancel }) {
  const [editedData, setEditedData] = useState({ ...data });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    
    if (name === 'time_unit' || name === 'volume_daily') {
      finalValue = value === '' ? '' : parseFloat(value);
    }

    setEditedData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Operación': return 'bg-primary text-black';
      case 'Revisión': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Traslado': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Espera': return 'bg-red-100 text-red-700 border-red-200';
      case 'Archivo': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-black text-white';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-2xl rounded-[3rem] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="bg-black text-white p-8">
        <div className="flex justify-between items-start">
          <div className="space-y-1 flex-1 mr-4">
            <Label className="text-[10px] uppercase font-black tracking-widest text-gray-400">
              Nombre de la actividad
            </Label>
            <Input
              name="name"
              value={editedData.name}
              onChange={handleChange}
              className="text-2xl font-black bg-transparent border-none focus-visible:ring-0 p-0 h-auto placeholder:text-gray-700"
            />
          </div>
          <Badge className={`rounded-xl px-4 py-2 font-black uppercase text-[10px] tracking-tighter ${getCategoryColor(editedData.category)}`}>
            {editedData.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-8 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-black tracking-widest text-gray-400 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Min/Und
            </Label>
            <Input
              type="number"
              name="time_unit"
              value={editedData.time_unit}
              onChange={handleChange}
              className="h-12 rounded-xl bg-gray-50 border-none font-black text-lg focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-black tracking-widest text-gray-400">
              Volumen/Día
            </Label>
            <Input
              type="number"
              name="volume_daily"
              value={editedData.volume_daily}
              onChange={handleChange}
              className="h-12 rounded-xl bg-gray-50 border-none font-black text-lg focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-black tracking-widest text-gray-400">
              Tipo (ASME)
            </Label>
            <div className="flex h-12 bg-gray-50 rounded-xl p-1">
              <button 
                type="button"
                onClick={() => setEditedData(p => ({ ...p, classification: 'VA' }))}
                className={`flex-1 rounded-lg text-[10px] font-black transition-all ${editedData.classification === 'VA' ? 'bg-primary text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                VA
              </button>
              <button 
                type="button"
                onClick={() => setEditedData(p => ({ ...p, classification: 'NVA' }))}
                className={`flex-1 rounded-lg text-[10px] font-black transition-all ${editedData.classification === 'NVA' ? 'bg-black text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                NVA
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-black tracking-widest text-gray-400 flex items-center">
              <BarChart className="w-3 h-3 mr-1" />
              Anual (Min)
            </Label>
            <div className="h-12 flex items-center px-2 font-black text-xl tracking-tighter decoration-primary decoration-4 underline underline-offset-4">
              {(editedData.time_unit * editedData.volume_daily * 20 * 12).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl space-y-2">
          <Label className="text-[10px] uppercase font-black tracking-widest text-primary flex items-center">
            <Info className="w-3 h-3 mr-1" />
            Justificación IA
          </Label>
          <p className="text-xs font-medium text-gray-700 leading-relaxed italic">
            "{editedData.justification}"
          </p>
        </div>
      </CardContent>

      <CardFooter className="p-8 pt-0 flex space-x-4">
        <Button 
          onClick={() => onConfirm(editedData)}
          className="flex-1 h-14 rounded-full font-black uppercase tracking-widest shadow-xl shadow-primary/20 text-black hover:scale-[1.02] transition-transform"
        >
          <Check className="w-5 h-5 mr-1" />
          Confirmar Actividad
        </Button>
        <Button 
          variant="outline"
          onClick={onCancel}
          className="h-14 px-8 rounded-full font-bold uppercase text-xs tracking-widest border-gray-200"
        >
          Descartar
        </Button>
      </CardFooter>
    </Card>
  );
}
