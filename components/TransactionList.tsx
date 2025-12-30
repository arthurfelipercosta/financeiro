
import React, { useState, useMemo } from 'react';
import { Transaction, Person } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { Trash2, CheckCircle, Circle, ArrowDown, ArrowUp, Repeat, ArrowUpDown } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  people: Person[];
  onDelete: (id: string) => void;
  onTogglePaid: (id: string) => void;
  onUpdateAmount: (id: string, newAmount: number) => void;
}

type SortKey = 'date' | 'description' | 'category' | 'person' | 'status' | 'amount';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
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
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });

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

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedTransactions = useMemo(() => {
    const sortableItems = [...transactions];
    
    sortableItems.sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (sortConfig.key) {
        case 'date':
          valA = new Date(a.date).getTime();
          valB = new Date(b.date).getTime();
          break;
        case 'description':
          valA = a.description.toLowerCase();
          valB = b.description.toLowerCase();
          break;
        case 'category':
          valA = a.category.toLowerCase();
          valB = b.category.toLowerCase();
          break;
        case 'person':
          valA = (people.find(p => p.id === a.personId)?.name || '').toLowerCase();
          valB = (people.find(p => p.id === b.personId)?.name || '').toLowerCase();
          break;
        case 'status':
          valA = a.isPaid ? 1 : 0;
          valB = b.isPaid ? 1 : 0;
          break;
        case 'amount':
          valA = a.amount;
          valB = b.amount;
          break;
        default:
          return 0;
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sortableItems;
  }, [transactions, sortConfig, people]);

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) return <ArrowUpDown size={14} className="opacity-30 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} className="text-blue-600" /> 
      : <ArrowDown size={14} className="text-blue-600" />;
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
              <th 
                className="px-6 py-4 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => requestSort('date')}
              >
                <div className="flex items-center gap-2">Data <SortIcon column="date" /></div>
              </th>
              <th 
                className="px-6 py-4 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => requestSort('description')}
              >
                <div className="flex items-center gap-2">Descrição <SortIcon column="description" /></div>
              </th>
              <th 
                className="px-6 py-4 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => requestSort('category')}
              >
                <div className="flex items-center gap-2">Categoria <SortIcon column="category" /></div>
              </th>
              <th 
                className="px-6 py-4 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => requestSort('person')}
              >
                <div className="flex items-center gap-2">Pessoa <SortIcon column="person" /></div>
              </th>
              <th 
                className="px-6 py-4 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => requestSort('status')}
              >
                <div className="flex items-center gap-2">Status <SortIcon column="status" /></div>
              </th>
              <th 
                className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => requestSort('amount')}
              >
                <div className="flex items-center justify-end gap-2">Valor <SortIcon column="amount" /></div>
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedTransactions.map(t => {
              const person = people.find(p => p.id === t.personId);
              return (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">
                    {formatDate(t.date)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col min-w-[150px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-slate-800 line-clamp-1">{t.description}</span>
                        {/* Fix: Wrapped Repeat icon in a span to add tooltip, as Lucide icons don't support the title prop directly */}
                        {t.isFixed && (
                          <span title="Gasto Fixo" className="flex shrink-0">
                            <Repeat size={12} className="text-blue-500" />
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{t.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 uppercase whitespace-nowrap">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 whitespace-nowrap">
                      <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: person?.color || '#cbd5e1' }} />
                      <span className="text-sm text-slate-600 font-medium">{person?.name || 'Outros'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => onTogglePaid(t.id)}
                      className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all shadow-sm ${
                        t.isPaid 
                          ? 'bg-green-50 text-green-700 border border-green-100' 
                          : 'bg-orange-50 text-orange-700 border border-orange-100'
                      }`}
                    >
                      {t.isPaid ? (
                        <>
                          <CheckCircle size={12} />
                          <span>{t.type === 'INCOME' ? 'Recebido' : 'Pago'}</span>
                        </>
                      ) : (
                        <>
                          <Circle size={12} />
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
                          className="w-24 px-2 py-1 text-sm border-2 border-blue-500 rounded-lg outline-none text-right font-bold"
                        />
                      </div>
                    ) : (
                      <div 
                        className={`text-sm font-black flex items-center justify-end space-x-1 cursor-pointer hover:scale-105 transition-transform ${
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
                        className="p-2 text-slate-300 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all active:scale-90"
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
