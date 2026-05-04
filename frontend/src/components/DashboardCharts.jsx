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
    <div className="grid gap-8 md:grid-cols-2 animate-in fade-in duration-700">
      {/* VA / NVA Pie Chart Industrial */}
      <Card className="rounded-none border-4 border-primary bg-white overflow-hidden">
        <CardHeader className="pb-4 border-b-2 border-primary bg-muted">
          <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Eficiencia del Proceso</CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground">Distribución de Valor Añadido (ASME)</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] pt-8">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <Pie
                data={vaData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={0}
                dataKey="value"
                stroke="#111111"
                strokeWidth={2}
              >
                {vaData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#FFD600' : '#111111'} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '2px solid #111111', 
                  borderRadius: '0px',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  fontSize: '10px',
                  letterSpacing: '0.1em'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Categories Bar Chart Industrial */}
      <Card className="rounded-none border-4 border-primary bg-white overflow-hidden">
        <CardHeader className="pb-4 border-b-2 border-primary bg-muted">
          <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Carga por Categoría</CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground">Minutos anuales acumulados</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] pt-8">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: 20, right: 40 }}>
              <CartesianGrid strokeDasharray="0" horizontal={true} vertical={false} stroke="#EEEEEE" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={true} 
                tickLine={true} 
                stroke="#111111"
                fontSize={9}
                width={80}
                tick={{ fontWeight: 900, textTransform: 'uppercase' }}
              />
              <Tooltip 
                cursor={{ fill: '#FFD600', opacity: 0.2 }}
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '2px solid #111111', 
                  borderRadius: '0px',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  fontSize: '10px',
                  letterSpacing: '0.1em'
                }}
              />
              <Bar 
                dataKey="minutos" 
                fill="#FFD600" 
                stroke="#111111"
                strokeWidth={2}
                radius={0} 
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
