
import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, TransactionType, PaymentMethod, Person, Card, Category } from '../types';
import { PAYMENT_METHODS } from '../constants';
import { generateId, parseLocalDate, formatCurrency } from '../lib/utils';
import { X, CreditCard, PiggyBank, Repeat, Info, Calculator, Check } from 'lucide-react';

interface TransactionFormProps {
  onAdd: (transactions: Transaction[]) => void;
  onClose: () => void;
  people: Person[];
  cards: Card[];
  categories: Category[];
}

type CalculationType = 'TOTAL' | 'INSTALLMENT';

const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, onClose, people, cards, categories }) => {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [calculationType, setCalculationType] = useState<CalculationType>('INSTALLMENT');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(categories[0]?.name || 'Outros');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('DEBIT');
  const [cardId, setCardId] = useState<string>('');
  const [personId, setPersonId] = useState(people[0]?.id || '');
  const [isPaid, setIsPaid] = useState(true);
  const [installments, setInstallments] = useState(1);
  const [isFixed, setIsFixed] = useState(false);

  // Filtra cartões disponíveis
  const filteredCards = useMemo(() => {
    return cards.filter(c => {
      const isOwner = c.personId === personId;
      if (!isOwner) return false;
      if (paymentMethod === 'CREDIT') return c.type === 'CREDIT' || c.type === 'BOTH';
      if (paymentMethod === 'DEBIT') return c.type === 'DEBIT' || c.type === 'BOTH';
      return false;
    });
  }, [cards, personId, paymentMethod]);

  useEffect(() => {
    if (cardId) {
      const isStillValid = filteredCards.some(c => c.id === cardId);
      if (!isStillValid) setCardId('');
    }
  }, [paymentMethod, filteredCards, cardId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'EXPENSE' && (installments > 1 || isFixed)) {
      const transactions: Transaction[] = [];
      const count = isFixed ? 12 : installments;
      const instId = generateId();
      
      let perInstallmentAmount = 0;
      let firstInstallmentAmount = 0;
      let totalPurchaseAmount = 0;

      if (calculationType === 'TOTAL') {
        totalPurchaseAmount = amount;
        perInstallmentAmount = Math.floor((amount / count) * 100) / 100;
        const remainder = Math.round((amount - (perInstallmentAmount * count)) * 100) / 100;
        firstInstallmentAmount = Math.round((perInstallmentAmount + remainder) * 100) / 100;
      } else {
        perInstallmentAmount = amount;
        firstInstallmentAmount = amount;
        totalPurchaseAmount = amount * count;
      }

      for (let i = 0; i < count; i++) {
        const d = parseLocalDate(date);
        d.setMonth(d.getMonth() + i);

        const currentAmount = i === 0 ? firstInstallmentAmount : perInstallmentAmount;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        const installmentDesc = isFixed 
          ? description 
          : `${description} (${i + 1}/${installments})`;

        transactions.push({
          id: generateId(),
          date: formattedDate,
          description: installmentDesc,
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
            
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-600 uppercase">
                  {calculationType === 'TOTAL' ? 'Valor Total (R$)' : 'Valor da Parcela (R$)'}
                </label>
                {type === 'EXPENSE' && installments > 1 && !isFixed && (
                  <div className="flex bg-slate-200 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setCalculationType('INSTALLMENT')}
                      className={`flex items-center gap-1 px-3 py-1 text-[10px] font-black rounded-md transition-all uppercase ${calculationType === 'INSTALLMENT' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}
                    >
                      {calculationType === 'INSTALLMENT' && <Check size={10} />} Por Parcela
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalculationType('TOTAL')}
                      className={`flex items-center gap-1 px-3 py-1 text-[10px] font-black rounded-md transition-all uppercase ${calculationType === 'TOTAL' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}
                    >
                      {calculationType === 'TOTAL' && <Check size={10} />} Total
                    </button>
                  </div>
                )}
              </div>
              <div className="relative">
                <input
                  required
                  type="number"
                  step="0.01"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:ring-0 outline-none pr-12 text-lg font-bold text-slate-800"
                />
                <Calculator className="absolute right-4 top-3.5 text-slate-300" size={20} />
              </div>
              
              {installments > 1 && !isFixed && amount > 0 && (
                <div className="mt-2 p-3 bg-blue-50 rounded-xl border border-blue-100 animate-in slide-in-from-top-1">
                  <div className="flex justify-between items-center text-[11px] font-black text-blue-700 uppercase tracking-wider">
                    <span>{calculationType === 'TOTAL' ? 'Divisão Sugerida' : 'Custo Final'}</span>
                    <span>{calculationType === 'TOTAL' ? 'Arredondamento Automático' : 'Multiplicação Simples'}</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-sm font-bold text-blue-900">
                      {calculationType === 'TOTAL' 
                        ? `${installments}x sendo a 1ª de ${formatCurrency(amount - (Math.floor((amount/installments)*100)/100)*(installments-1))}`
                        : `${installments}x de ${formatCurrency(amount)}`}
                    </span>
                    <span className="text-xs text-blue-600">
                      (Total: {formatCurrency(calculationType === 'TOTAL' ? amount : amount * installments)})
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Data da 1ª Parcela</label>
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
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 flex items-center justify-between">
                      Cartão
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase ${paymentMethod === 'CREDIT' ? 'text-blue-500 bg-blue-50 border-blue-100' : 'text-green-500 bg-green-50 border-green-100'}`}>
                        {paymentMethod === 'CREDIT' ? 'Crédito' : 'Débito'}
                      </span>
                    </label>
                    <select
                      value={cardId}
                      onChange={(e) => setCardId(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    >
                      <option value="">Selecione um cartão</option>
                      {filteredCards.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.type === 'BOTH' ? '(Multifunção)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {!isFixed && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Número de Parcelas</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
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
                <p className="text-[11px] text-blue-600 leading-tight font-medium">
                  Isso criará automaticamente 12 meses desta conta no seu extrato.
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
              {type === 'INCOME' ? 'Já recebi este valor' : 'Já está pago?'}
            </label>
          </div>

          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-blue-600 rounded-xl text-white font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
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
