'use client';

import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardCharts({ activities }) {
  if (!activities || activities.length === 0) return null;

  // Data for VA vs NVA
  const vaData = [
    { name: 'Valor Añadido (VA)', value: activities.filter(a => a.classification === 'VA').length },
    { name: 'No Valor Añadido (NVA)', value: activities.filter(a => a.classification === 'NVA').length },
  ].filter(d => d.value > 0);

  // Data for Categories
  const categoryMap = activities.reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + (a.annual_minutes || 0);
    return acc;
  }, {});

  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    minutos: Math.round(value)
  })).sort((a, b) => b.minutos - a.minutos);

  const COLORS = ['#FFD600', '#000000']; // Yellow for VA, Black for NVA logic?
  // Let's use Yellow for VA and Gray/Black for NVA
  const PIE_COLORS = ['#FFD600', '#F3F4F6']; // Yellow vs Soft Gray

  return (
    <div className="grid gap-6 md:grid-cols-2 animate-in fade-in duration-700">
      {/* VA / NVA Pie Chart */}
      <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden group">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-400">Eficiencia del Proceso</CardTitle>
          <CardDescription>Distribución de Valor Añadido</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <Pie
                data={vaData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {vaData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#FFD600' : '#E5E7EB'} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Categories Bar Chart */}
      <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-400">Carga por Categoría</CardTitle>
          <CardDescription>Minutos anuales totales</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F9FAFB" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                fontSize={10}
                width={80}
              />
              <Tooltip 
                cursor={{ fill: '#F9FAFB' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
              />
              <Bar 
                dataKey="minutos" 
                fill="#FFD600" 
                radius={[0, 4, 4, 0]} 
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
