
import React, { useMemo } from 'react';
import { Transaction, Person } from '../types';
import { formatCurrency } from '../lib/utils';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend 
} from 'recharts';
import { LogIn, LogOut, PiggyBank, CircleDollarSign } from 'lucide-react';

interface SummaryProps {
  transactions: Transaction[];
  people: Person[];
}

const Summary: React.FC<SummaryProps> = ({ transactions, people }) => {
  const summary = useMemo(() => {
    return transactions.reduce((acc, t) => {
      if (t.type === 'INCOME') {
        acc.totalIncome += t.amount;
      } else if (t.type === 'EXPENSE') {
        acc.totalExpense += t.amount;
      } else if (t.type === 'SAVINGS') {
        acc.totalSavings += t.amount;
      }
      return acc;
    }, { totalIncome: 0, totalExpense: 0, totalSavings: 0 });
  }, [transactions]);

  const balance = summary.totalIncome - summary.totalExpense - summary.totalSavings;

  const donutData = [
    { name: 'Saídas', value: summary.totalExpense, color: '#fca5a5' },
    { name: 'Investido', value: summary.totalSavings, color: '#fde047' },
    { name: 'Saldo atual', value: Math.max(0, balance), color: '#86efac' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Cards matching the user screenshot */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-[#dbeafe] p-4 flex flex-col items-center justify-center border-r">
          <span className="text-[#1e1b4b] font-bold text-lg mb-2">Entradas</span>
          <div className="bg-[#22c55e] p-2 rounded-lg text-white mb-3">
             <LogIn size={24} />
          </div>
          <span className="text-[#1e1b4b] font-bold text-xl">{formatCurrency(summary.totalIncome)}</span>
        </div>

        <div className="bg-[#fecaca] p-4 flex flex-col items-center justify-center border-r">
          <span className="text-[#7f1d1d] font-bold text-lg mb-2">Saídas</span>
          <div className="bg-[#ef4444] p-2 rounded-lg text-white mb-3">
             <LogOut size={24} />
          </div>
          <span className="text-[#7f1d1d] font-bold text-xl">{formatCurrency(summary.totalExpense)}</span>
        </div>

        <div className="bg-[#fef08a] p-4 flex flex-col items-center justify-center border-r">
          <span className="text-[#713f12] font-bold text-lg mb-2">Investido</span>
          <div className="bg-[#facc15] p-2 rounded-lg text-white mb-3">
             <PiggyBank size={24} />
          </div>
          <span className="text-[#713f12] font-bold text-xl">{formatCurrency(summary.totalSavings)}</span>
        </div>

        <div className="bg-[#bbf7d0] p-4 flex flex-col items-center justify-center">
          <span className="text-[#064e3b] font-bold text-lg mb-2">Saldo atual</span>
          <div className="bg-[#10b981] p-2 rounded-lg text-white mb-3">
             <CircleDollarSign size={24} />
          </div>
          <span className="text-[#064e3b] font-bold text-xl">{formatCurrency(balance)}</span>
        </div>
      </div>

      <p className="text-center text-red-500 text-sm font-medium">
        essa parte é automática, não precisa preencher 🟦
      </p>

      {/* Main Donut Chart matching style */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={0}
                dataKey="value"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Summary;
