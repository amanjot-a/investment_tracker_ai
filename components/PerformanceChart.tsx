import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceChartProps {
  data: { date: string; value: number }[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  // Use data or fallback to a straight line if empty to preserve layout
  const chartData = data && data.length > 0 ? data : [
    { date: 'Start', value: 100000 },
    { date: 'Now', value: 100000 }
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 12, fill: '#94a3b8'}}
            tickFormatter={(val) => typeof val === 'string' && val.includes('T') ? val.split('T')[0] : val}
            dy={10}
            minTickGap={30}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{fontSize: 12, fill: '#94a3b8'}}
            domain={['auto', 'auto']}
            tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#1e293b', fontWeight: 700 }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Net Worth']}
            labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '5px' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#2563eb" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorVal)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;