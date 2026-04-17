'use client';

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChevronRight, Loader2 } from "lucide-react";

const formSchema = z.object({
  company_name: z.string().min(2, {
    message: "El nombre de la empresa debe tener al menos 2 caracteres.",
  }),
  department: z.string().min(2, {
    message: "El departamento debe tener al menos 2 caracteres.",
  }),
});

export default function SessionSetup({ onSessionCreated }) {
  const [isLoading, setIsLoading] = useState(false);

  // 1. Define your form.
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: "",
      department: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values) {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error('Failed to create session');
      
      const session = await response.json();
      onSessionCreated(session);
    } catch (err) {
      console.error("Session setup error:", err);
      alert("Error al conectar con el servidor. Asegúrate de que el backend esté corriendo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 animate-in fade-in zoom-in duration-500">
      <Card className="border-none shadow-2xl rounded-[2.5rem] p-6">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-4xl font-black tracking-tighter uppercase italic">Nuevo Análisis</CardTitle>
          <CardDescription className="text-gray-400 font-medium">Configura los detalles del estudio para empezar</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase font-black tracking-widest text-gray-400">Nombre de la Empresa</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ej: Siemens, Inditex..." 
                        {...field} 
                        className="h-14 rounded-2xl bg-gray-50 border-none font-bold focus-visible:ring-primary"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold uppercase" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase font-black tracking-widest text-gray-400">Departamento / Área</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ej: Logística, Producción..." 
                        {...field} 
                        className="h-14 rounded-2xl bg-gray-50 border-none font-bold focus-visible:ring-primary"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold uppercase" />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-14 rounded-full font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all text-black"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Iniciar Análisis
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
