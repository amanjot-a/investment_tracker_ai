import React from 'react';
import { Order } from '../types';

interface OrdersTableProps {
  orders: Order[];
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
  if (!orders || orders.length === 0) {
    return (
        <div className="text-center py-12 text-slate-400">
            <p>No trading history available.</p>
        </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full max-h-[400px]">
      <table className="w-full text-left min-w-[500px]">
        <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
          <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <th className="px-6 py-3">Date</th>
            <th className="px-4 py-3">Symbol</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3 text-right">Qty</th>
            <th className="px-4 py-3 text-right">Price</th>
            <th className="px-4 py-3 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-3 text-xs text-slate-500 font-medium">
                  {new Date(o.date).toLocaleDateString()}
                  <div className="text-[10px] opacity-70">{new Date(o.date).toLocaleTimeString()}</div>
              </td>
              <td className="px-4 py-3 font-bold text-slate-800">{o.symbol}</td>
              <td className="px-4 py-3">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${o.side === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {o.side}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-sm text-slate-600 font-medium">{o.quantity}</td>
              <td className="px-4 py-3 text-right text-sm text-slate-600 font-medium">${o.price.toFixed(2)}</td>
              <td className="px-4 py-3 text-right">
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md uppercase tracking-wide">{o.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;