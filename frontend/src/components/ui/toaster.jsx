'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { X, CheckCircle2, AlertTriangle, Info, Loader2 } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = ({ title, description, variant = 'default', duration = 3000 }) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, description, variant, duration }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div 
            key={t.id}
            className={`
              pointer-events-auto flex items-start gap-4 p-5 rounded-none border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
              animate-in slide-in-from-right-full duration-300
              ${t.variant === 'destructive' ? 'border-red-500' : ''}
            `}
          >
            <div className="flex-shrink-0 pt-1">
              {t.variant === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              {t.variant === 'destructive' && <AlertTriangle className="w-5 h-5 text-red-500" />}
              {t.variant === 'default' && <Info className="w-5 h-5 text-secondary" />}
              {t.variant === 'loading' && <Loader2 className="w-5 h-5 text-secondary animate-spin" />}
            </div>
            <div className="flex-1 space-y-1">
              {t.title && <p className="text-xs font-black uppercase tracking-widest text-primary">{t.title}</p>}
              {t.description && <p className="text-xs font-bold text-gray-400 uppercase tracking-tight leading-tight">{t.description}</p>}
            </div>
            <button 
              onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
              className="flex-shrink-0 text-gray-300 hover:text-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
