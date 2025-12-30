
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, PaymentMethod, Person, Card, Category } from '../types';
import { PAYMENT_METHODS } from '../constants';
import { generateId, parseLocalDate } from '../lib/utils';
import { X, CreditCard, PiggyBank, Repeat } from 'lucide-react';

interface TransactionFormProps {
  onAdd: (transactions: Transaction[]) => void;
  onClose: () => void;
  people: Person[];
  cards: Card[];
  categories: Category[];
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, onClose, people, cards, categories }) => {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(categories[0]?.name || 'Outros');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('DEBIT');
  const [cardId, setCardId] = useState<string>('');
  const [personId, setPersonId] = useState(people[0]?.id || '');
  const [isPaid, setIsPaid] = useState(true);
  const [installments, setInstallments] = useState(1);
  const [isFixed, setIsFixed] = useState(false);

  const availableCards = useMemo(() => {
    return cards.filter(c => c.personId === personId);
  }, [cards, personId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Lógica para Gasto Fixo (Recorrente 12 meses) ou Parcelado
    if (type === 'EXPENSE' && (installments > 1 || isFixed)) {
      const transactions: Transaction[] = [];
      const count = isFixed ? 12 : installments;
      const instId = generateId();
      
      const baseAmount = isFixed ? amount : (Math.floor((amount / installments) * 100) / 100);
      const remainder = isFixed ? 0 : (Math.round((amount - (baseAmount * installments)) * 100) / 100);

      for (let i = 0; i < count; i++) {
        const d = parseLocalDate(date);
        d.setMonth(d.getMonth() + i);
        const currentAmount = i === 0 ? baseAmount + remainder : baseAmount;

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        transactions.push({
          id: generateId(),
          date: formattedDate,
          description: isFixed ? description : `${description} (${i + 1}/${installments})`,
          amount: currentAmount,
          type,
          category,
          paymentMethod,
          cardId: (paymentMethod === 'CREDIT' || paymentMethod === 'DEBIT') ? cardId : undefined,
          isPaid: i === 0 ? isPaid : false,
          personId,
          installmentsId: instId,
          installmentNumber: isFixed ? undefined : i + 1,
          totalInstallments: isFixed ? undefined : installments,
          isFixed: isFixed
        });
      }
      onAdd(transactions);
    } else {
      onAdd([{
        id: generateId(),
        date,
        description,
        amount,
        type,
        category: type === 'SAVINGS' ? 'Poupança' : category,
        paymentMethod,
        cardId: (paymentMethod === 'CREDIT' || paymentMethod === 'DEBIT') ? cardId : undefined,
        isPaid,
        personId,
        isFixed: false
      }]);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-8 overflow-hidden animate-in zoom-in duration-300">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Nova Transação</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => { setType('EXPENSE'); setCategory(categories[0]?.name || 'Outros'); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'EXPENSE' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500'}`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => { setType('INCOME'); setCategory('Salário'); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'INCOME' ? 'bg-white shadow-sm text-green-600' : 'text-slate-500'}`}
            >
              Ganho
            </button>
            <button
              type="button"
              onClick={() => { setType('SAVINGS'); setCategory('Poupança'); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'SAVINGS' ? 'bg-white shadow-sm text-yellow-600' : 'text-slate-500'}`}
            >
              <div className="flex items-center justify-center gap-1"><PiggyBank size={14} />Poupar</div>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Descrição</label>
              <input
                required
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={type === 'SAVINGS' ? 'Ex: Depósito Mensal, Reserva...' : 'Ex: Supermercado, Aluguel...'}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Valor (R$)</label>
              <input
                required
                type="number"
                step="0.01"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Data de Início</label>
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {type !== 'SAVINGS' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Pessoa Responsável</label>
              <select
                value={personId}
                onChange={(e) => setPersonId(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {type === 'EXPENSE' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Pagamento</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>

                {(paymentMethod === 'CREDIT' || paymentMethod === 'DEBIT') && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Cartão</label>
                    <select
                      value={cardId}
                      onChange={(e) => setCardId(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    >
                      <option value="">Selecione um cartão</option>
                      {availableCards
                        .filter(c => paymentMethod === 'CREDIT' ? (c.type === 'CREDIT' || c.type === 'BOTH') : (c.type === 'DEBIT' || c.type === 'BOTH'))
                        .map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                        ))
                      }
                    </select>
                  </div>
                )}

                {!isFixed && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Parcelas</label>
                    <input
                      type="number"
                      min="1"
                      max="48"
                      value={installments}
                      onChange={(e) => setInstallments(Number(e.target.value))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {type === 'EXPENSE' && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Repeat size={18} className="text-blue-600" />
                  <span className="text-sm font-bold text-blue-800">Gasto Fixo / Recorrente</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={isFixed}
                    onChange={(e) => setIsFixed(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              {isFixed && (
                <p className="text-[11px] text-blue-600 leading-tight">
                  Ao ativar, esta conta será repetida automaticamente nos próximos <b>12 meses</b>. Ideal para aluguel, internet, celular, etc.
                </p>
              )}
            </div>
          )}

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isPaid"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="isPaid" className="text-sm font-medium text-slate-700">
              {type === 'INCOME' ? 'Recebido' : type === 'SAVINGS' ? 'Confirmado' : 'Já está pago?'}
            </label>
          </div>

          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-700 shadow-md transition-all active:scale-95"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
