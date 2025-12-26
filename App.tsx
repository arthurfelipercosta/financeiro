
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, Person, Card, Category } from './types';
import { INITIAL_PEOPLE, DEFAULT_CATEGORIES } from './constants';
import { getMonthYear, generateId } from './lib/utils';
import Summary from './components/Summary';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Management from './components/Management';
import MonthPickerModal from './components/MonthPickerModal';
import { Plus, ChevronLeft, ChevronRight, LayoutDashboard, List, Calendar, Wallet, Settings, BarChart3 } from 'lucide-react';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('family_finance_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [people, setPeople] = useState<Person[]>(() => {
    const saved = localStorage.getItem('family_finance_people');
    return saved ? JSON.parse(saved) : INITIAL_PEOPLE;
  });

  const [cards, setCards] = useState<Card[]>(() => {
    const saved = localStorage.getItem('family_finance_cards');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('family_finance_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES.map(name => ({ id: generateId(), name }));
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'dashboard' | 'transactions' | 'settings'>('summary');

  useEffect(() => {
    localStorage.setItem('family_finance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('family_finance_people', JSON.stringify(people));
  }, [people]);

  useEffect(() => {
    localStorage.setItem('family_finance_cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('family_finance_categories', JSON.stringify(categories));
  }, [categories]);

  const currentMonthStr = getMonthYear(currentDate);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => getMonthYear(new Date(t.date)) === currentMonthStr);
  }, [transactions, currentMonthStr]);

  const handleAddTransactions = (newItems: Transaction[]) => {
    setTransactions(prev => [...prev, ...newItems]);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir esta transação?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleTogglePaid = (id: string) => {
    setTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, isPaid: !t.isPaid } : t
    ));
  };

  const handleUpdateAmount = (id: string, newAmount: number) => {
    setTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, amount: newAmount } : t
    ));
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  // Formata o rótulo do mês garantindo "[Mês] de [Ano]" com "de" minúsculo e largura suficiente
  const dateParts = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).formatToParts(currentDate);
  const monthName = dateParts.find(p => p.type === 'month')?.value || '';
  const yearName = dateParts.find(p => p.type === 'year')?.value || '';
  const monthLabel = `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} de ${yearName}`;

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-blue-600 tracking-tight flex items-center gap-2">
              <Wallet className="text-blue-500" /> Financeiro
            </h1>
          </div>

          {/* Month Selector */}
          <div className="flex items-center justify-between bg-slate-100 rounded-xl p-1 md:w-auto">
            <button 
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"
              title="Mês Anterior"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center px-2">
              <button 
                onClick={() => setShowMonthPicker(true)}
                className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-blue-600"
                title="Escolher Mês"
              >
                <Calendar size={20} />
              </button>
              <span className="text-sm font-bold text-slate-700 w-52 md:w-60 text-center select-none">
                {monthLabel}
              </span>
            </div>

            <button 
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"
              title="Próximo Mês"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="hidden md:block">
            <button 
              onClick={() => setShowForm(true)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
            >
              <Plus size={20} /> Nova Transação
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pt-6">
        <div className="mb-8 flex flex-wrap gap-1 bg-slate-200 p-1 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab('summary')}
            className={`flex items-center space-x-2 px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'summary' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-300'
            }`}
          >
            <LayoutDashboard size={18} />
            <span className="hidden sm:inline">Resumo</span>
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-300'
            }`}
          >
            <BarChart3 size={18} />
            <span className="hidden sm:inline">Gráficos</span>
          </button>
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center space-x-2 px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'transactions' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-300'
            }`}
          >
            <List size={18} />
            <span className="hidden sm:inline">Extrato</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'settings' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-300'
            }`}
          >
            <Settings size={18} />
            <span className="hidden sm:inline">Gestão</span>
          </button>
        </div>

        {activeTab === 'summary' && (
          <Summary transactions={filteredTransactions} people={people} />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard 
            transactions={filteredTransactions} 
            people={people} 
          />
        )}
        
        {activeTab === 'transactions' && (
          <TransactionList 
            transactions={filteredTransactions} 
            people={people} 
            onDelete={handleDelete}
            onTogglePaid={handleTogglePaid}
            onUpdateAmount={handleUpdateAmount}
          />
        )}

        {activeTab === 'settings' && (
          <Management 
            people={people}
            cards={cards}
            categories={categories}
            onAddPerson={(p) => setPeople([...people, p])}
            onRemovePerson={(id) => setPeople(people.filter(p => p.id !== id))}
            onAddCard={(c) => setCards([...cards, c])}
            onRemoveCard={(id) => setCards(cards.filter(c => c.id !== id))}
            onAddCategory={(cat) => setCategories([...categories, cat])}
            onRemoveCategory={(id) => setCategories(categories.filter(c => c.id !== id))}
          />
        )}
      </main>

      {/* Mobile Floating Action Button */}
      <div className="md:hidden fixed bottom-20 right-6 z-50">
        <button 
          onClick={() => setShowForm(true)}
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform active:scale-90"
        >
          <Plus size={28} />
        </button>
      </div>

      {/* Bottom Nav Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-3 flex justify-around items-center z-40">
        <button 
          onClick={() => setActiveTab('summary')}
          className={`flex flex-col items-center gap-1 min-w-[64px] ${activeTab === 'summary' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-bold">Resumo</span>
        </button>
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 min-w-[64px] ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <BarChart3 size={20} />
          <span className="text-[10px] font-bold">Gráficos</span>
        </button>
        <button 
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center gap-1 min-w-[64px] ${activeTab === 'transactions' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <List size={20} />
          <span className="text-[10px] font-bold">Extrato</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 min-w-[64px] ${activeTab === 'settings' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <Settings size={20} />
          <span className="text-[10px] font-bold">Gestão</span>
        </button>
      </div>

      {/* Modals */}
      {showForm && (
        <TransactionForm 
          onAdd={handleAddTransactions} 
          onClose={() => setShowForm(false)} 
          people={people}
          cards={cards}
          categories={categories}
        />
      )}

      {showMonthPicker && (
        <MonthPickerModal 
          currentDate={currentDate}
          onSelect={setCurrentDate}
          onClose={() => setShowMonthPicker(false)}
        />
      )}
    </div>
  );
};

export default App;
