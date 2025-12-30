
import React, { useState } from 'react';
import { Transaction, Person } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { Trash2, CheckCircle, Circle, ArrowDown, ArrowUp, Repeat } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  people: Person[];
  onDelete: (id: string) => void;
  onTogglePaid: (id: string) => void;
  onUpdateAmount: (id: string, newAmount: number) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  people, 
  onDelete, 
  onTogglePaid,
  onUpdateAmount
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const handleStartEdit = (t: Transaction) => {
    setEditingId(t.id);
    setEditValue(t.amount.toString());
  };

  const handleSaveEdit = (id: string) => {
    const val = parseFloat(editValue);
    if (!isNaN(val)) {
      onUpdateAmount(id, val);
    }
    setEditingId(null);
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
        <p className="text-slate-400 font-medium">Nenhuma transação encontrada para este período.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Data</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Descrição</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Categoria</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Pessoa</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Valor</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => {
              const person = people.find(p => p.id === t.personId);
              return (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                    {formatDate(t.date)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-slate-800">{t.description}</span>
                        {t.isFixed && <Repeat size={12} className="text-blue-500" title="Gasto Fixo" />}
                      </div>
                      <span className="text-xs text-slate-400">{t.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: person?.color || '#cbd5e1' }} />
                      <span className="text-sm text-slate-600">{person?.name || 'Outros'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => onTogglePaid(t.id)}
                      className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        t.isPaid 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-orange-50 text-orange-700'
                      }`}
                    >
                      {t.isPaid ? (
                        <>
                          <CheckCircle size={14} />
                          <span>{t.type === 'INCOME' ? 'Recebido' : 'Pago'}</span>
                        </>
                      ) : (
                        <>
                          <Circle size={14} />
                          <span>{t.type === 'INCOME' ? 'Pendente' : 'Não Pago'}</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingId === t.id ? (
                      <div className="flex items-center justify-end space-x-1">
                        <input
                          autoFocus
                          type="number"
                          step="0.01"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleSaveEdit(t.id)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(t.id)}
                          className="w-24 px-2 py-1 text-sm border rounded outline-none focus:ring-2 focus:ring-blue-500 text-right"
                        />
                      </div>
                    ) : (
                      <div 
                        className={`text-sm font-bold flex items-center justify-end space-x-1 cursor-pointer hover:underline ${
                          t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                        }`}
                        onClick={() => handleStartEdit(t)}
                      >
                        {t.type === 'INCOME' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        <span>{formatCurrency(t.amount)}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onDelete(t.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;
