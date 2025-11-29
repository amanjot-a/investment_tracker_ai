import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Holding } from '../types';

interface AllocationChartProps {
  holdings: Holding[];
  cash: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

const AllocationChart: React.FC<AllocationChartProps> = ({ holdings, cash }) => {
  const data = [
    { name: 'Cash', value: cash || 0 },
    ...(holdings || []).map(h => ({ name: h.symbol, value: h.quantity * (h.currentPrice || 0) }))
  ].filter(item => item.value > 0);

  return (
    <div className="h-[280px] w-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
             formatter={(value: number) => `$${value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`}
             contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend 
             layout="vertical" 
             verticalAlign="middle" 
             align="right"
             wrapperStyle={{ fontSize: '11px', fontWeight: 500, color: '#475569' }}
             iconType="circle"
             iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AllocationChart;