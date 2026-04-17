'use client';

import { useState } from 'react';

export default function ActivityCard({ data, onConfirm, onCancel }) {
  const [editedData, setEditedData] = useState({ ...data });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: name === 'time_unit' || name === 'volume_daily' ? parseFloat(value) : value
    }));
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Operación': return 'bg-primary text-black';
      case 'Revisión': return 'bg-orange-500 text-white';
      case 'Traslado': return 'bg-blue-500 text-white';
      case 'Espera': return 'bg-red-500 text-white';
      case 'Archivo': return 'bg-gray-500 text-white';
      default: return 'bg-black text-white';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto glass-card p-6 space-y-6 border-2 border-black animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-gray-400">Nombre de la actividad</label>
          <input
            name="name"
            value={editedData.name}
            onChange={handleChange}
            className="text-2xl font-bold bg-transparent border-b border-transparent focus:border-primary outline-none w-full"
          />
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getCategoryColor(editedData.category)}`}>
          {editedData.category}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-gray-400">Minutos/Unidad</label>
          <input
            type="number"
            name="time_unit"
            value={editedData.time_unit}
            onChange={handleChange}
            className="block w-full text-lg font-mono font-bold bg-gray-50 p-2 rounded-lg"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-gray-400">Volumen Diario</label>
          <input
            type="number"
            name="volume_daily"
            value={editedData.volume_daily}
            onChange={handleChange}
            className="block w-full text-lg font-mono font-bold bg-gray-50 p-2 rounded-lg"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-gray-400">Clasificación</label>
          <div className="flex space-x-2">
            <button 
              onClick={() => setEditedData(p => ({ ...p, classification: 'VA' }))}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${editedData.classification === 'VA' ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}
            >
              VA
            </button>
            <button 
              onClick={() => setEditedData(p => ({ ...p, classification: 'NVA' }))}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${editedData.classification === 'NVA' ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}
            >
              NVA
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-gray-400">Total Anual (Min)</label>
          <div className="text-lg font-mono font-bold p-2">
            {(editedData.time_unit * editedData.volume_daily * 20 * 12).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-gray-400">Justificación de la IA</label>
        <p className="text-sm text-gray-600 italic">"{editedData.justification}"</p>
      </div>

      <div className="flex space-x-4 pt-4 border-t border-gray-100">
        <button 
          onClick={() => onConfirm(editedData)}
          className="flex-1 primary-button flex items-center justify-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          <span>Confirmar actividad</span>
        </button>
        <button 
          onClick={onCancel}
          className="px-6 py-3 rounded-full font-bold text-sm bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          Descartar
        </button>
      </div>
    </div>
  );
}
