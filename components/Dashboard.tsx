
import React, { useMemo, useState } from 'react';
import { Transaction, Person, TransactionType } from '../types';
import { formatCurrency } from '../lib/utils';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Sparkles, Loader2, BrainCircuit, TrendingDown, Target, Info, Wallet, TrendingUp, PiggyBank } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  people: Person[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, people }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeView, setActiveView] = useState<TransactionType>('EXPENSE');

  const overviewData = useMemo(() => {
    const totals = transactions.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Entradas', value: totals['INCOME'] || 0, color: '#10b981' },
      { name: 'Saídas', value: totals['EXPENSE'] || 0, color: '#ef4444' },
      { name: 'Investido', value: totals['SAVINGS'] || 0, color: '#f59e0b' },
    ].filter(item => item.value > 0);
  }, [transactions]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === activeView).forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, activeView]);

  const personData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === activeView).forEach(t => {
      const person = people.find(p => p.id === t.personId);
      const name = person ? person.name : 'Outros';
      map[name] = (map[name] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions, people, activeView]);

  const methodData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === activeView).forEach(t => {
      map[t.paymentMethod] = (map[t.paymentMethod] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions, activeView]);

  const getThemeColor = () => {
    if (activeView === 'INCOME') return '#10b981'; // Green
    if (activeView === 'SAVINGS') return '#f59e0b'; // Amber
    return '#3b82f6'; // Blue for Expenses
  };

  const COLORS = activeView === 'INCOME' 
    ? ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0']
    : activeView === 'SAVINGS'
    ? ['#f59e0b', '#d97706', '#fbbf24', '#fcd34d', '#fef3c7']
    : ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#475569'];

  const generateAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
      const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
      
      const prompt = `Analise os seguintes dados financeiros familiares e dê 3 dicas práticas em português (máximo 150 palavras):
      Total Entradas: ${formatCurrency(totalIncome)}
      Total Saídas: ${formatCurrency(totalExpense)}
      Principais Gastos: ${categoryData.slice(0, 3).map(c => `${c.name}: ${formatCurrency(c.value)}`).join(', ')}
      Equilíbrio Financeiro: ${totalIncome > totalExpense ? 'Superávit' : 'Déficit'}`;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      
      setAnalysis(response.text || "Não foi possível gerar a análise agora.");
    } catch (err) {
      console.error("Gemini Insight Error:", err);
      setAnalysis("Erro ao conectar com a IA. Verifique sua chave de API.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const EmptyState = ({ message }: { message: string }) => (
    <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
      <Info size={32} className="text-slate-300 mb-2" />
      <p className="text-slate-400 text-sm font-medium leading-tight">{message}</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500 pb-12">
      
      {/* Seletor de Tipo de Visualização */}
      <div className="flex bg-slate-200 p-1 rounded-2xl w-full sm:w-fit mx-auto shadow-inner">
        <button 
          onClick={() => setActiveView('EXPENSE')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeView === 'EXPENSE' ? 'bg-white text-blue-600 shadow-md scale-105' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <TrendingDown size={18} /> Saídas
        </button>
        <button 
          onClick={() => setActiveView('INCOME')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeView === 'INCOME' ? 'bg-white text-emerald-600 shadow-md scale-105' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <TrendingUp size={18} /> Entradas
        </button>
        <button 
          onClick={() => setActiveView('SAVINGS')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeView === 'SAVINGS' ? 'bg-white text-amber-600 shadow-md scale-105' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <PiggyBank size={18} /> Investido
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de Visão Geral (Sempre visível) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <Wallet size={22} className="text-indigo-500" /> Fluxo de Caixa
          </h3>
          <div className="h-72">
            {overviewData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={overviewData} cx="50%" cy="50%" outerRadius={90} dataKey="value" stroke="none">
                    {overviewData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend verticalAlign="bottom" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyState message="Nenhuma transação este mês." />}
          </div>
        </div>

        {/* Gráfico de Categorias (Dinâmico) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <BrainCircuit size={22} style={{ color: getThemeColor() }} /> 
              Categorias de {activeView === 'EXPENSE' ? 'Gasto' : activeView === 'INCOME' ? 'Ganho' : 'Investimento'}
          </h3>
          <div className="h-72">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fontWeight: 'bold' }} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="value" fill={getThemeColor()} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState message={`Nenhum dado de ${activeView === 'EXPENSE' ? 'saída' : 'entrada'} por categoria.`} />}
          </div>
        </div>

        {/* Gráfico de Pessoa (Dinâmico) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <Target size={22} style={{ color: getThemeColor() }} /> 
              Participação por Membro
          </h3>
          <div className="h-72">
            {personData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={personData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" stroke="none" paddingAngle={4}>
                    {personData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyState message="Cadastre transações para ver a participação por membro." />}
          </div>
        </div>

        {/* Gráfico de Meios de Pagamento (Dinâmico) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp size={22} style={{ color: getThemeColor() }} /> 
              Meios Utilizados
          </h3>
          <div className="h-72">
            {methodData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={methodData} cx="50%" cy="50%" outerRadius={85} dataKey="value" stroke="none">
                    {methodData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend verticalAlign="bottom" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyState message="Cadastre transações para ver os meios utilizados." />}
          </div>
        </div>

        {/* Mentor IA */}
        <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-blue-100 shadow-xl bg-gradient-to-br from-white to-blue-50/50 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Sparkles size={120} className="text-blue-500" />
          </div>

          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Sparkles className="text-blue-500" size={24} /> Mentor Financeiro IA
            </h3>
            <button 
              onClick={generateAIAnalysis}
              disabled={isAnalyzing || transactions.length === 0}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-blue-200 active:scale-95"
            >
              {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Analisar Todo o Mês
            </button>
          </div>
          
          <div className="flex-1 min-h-[120px] relative z-10">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative">
                   <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                   <Sparkles className="absolute top-0 right-0 text-blue-300 animate-pulse" size={16} />
                </div>
                <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Processando sua saúde financeira...</p>
              </div>
            ) : analysis ? (
              <div className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap font-medium bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-blue-100 shadow-inner">
                {analysis}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500 text-sm italic font-medium">
                  {transactions.length === 0 
                    ? "Cadastre suas primeiras movimentações para que a IA possa te ajudar."
                    : "Sua IA financeira está pronta. Clique no botão acima para receber sugestões personalizadas sobre seu equilíbrio entre ganhos e gastos."
                  }
                </p>
              </div>
            )}
          </div>
          
          {analysis && (
            <p className="text-[10px] text-slate-400 mt-6 text-center font-bold uppercase tracking-tighter">
              Sugestões geradas por inteligência artificial • Use com responsabilidade
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
