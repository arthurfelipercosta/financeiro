import React, { useMemo, useState } from 'react';
import { Transaction, Person } from '../types';
import { formatCurrency } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Sparkles, Loader2, BrainCircuit, TrendingDown, Target } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  people: Person[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, people }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const personData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
      const person = people.find(p => p.id === t.personId);
      const name = person ? person.name : 'Outros';
      map[name] = (map[name] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions, people]);

  const methodData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
      map[t.paymentMethod] = (map[t.paymentMethod] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#475569'];

  const generateAIAnalysis = async () => {
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      setAnalysis("⚠️ Configuração de IA ausente. Verifique a variável API_KEY.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      // Use the correct GoogleGenAI initialization as per SDK guidelines
      const ai = new GoogleGenAI({ apiKey });
      const totalExpense = categoryData.reduce((acc, curr) => acc + curr.value, 0);
      
      const prompt = `Analise os seguintes dados financeiros familiares e dê 3 dicas práticas em português para economizar ou gerir melhor o dinheiro (máximo 150 palavras):
      Gastos por Categoria: ${categoryData.map(c => `${c.name}: ${formatCurrency(c.value)}`).join(', ')}
      Gastos por Pessoa: ${personData.map(p => `${p.name}: ${formatCurrency(p.value)}`).join(', ')}
      Total de Gastos: ${formatCurrency(totalExpense)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      
      // Use the .text property directly as per the latest SDK requirements
      setAnalysis(response.text || "Não foi possível gerar a análise agora.");
    } catch (err) {
      console.error("Gemini Insight Error:", err);
      setAnalysis("Erro ao conectar com a IA. Verifique sua chave de API.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom duration-500 pb-12">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BrainCircuit size={20} className="text-blue-500" /> Gastos por Categoria
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Target size={20} className="text-pink-500" /> Gastos por Membro
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={personData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value">
                {personData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingDown size={20} className="text-emerald-500" /> Meios de Pagamento
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={methodData} cx="50%" cy="50%" paddingAngle={2} dataKey="value">
                {methodData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-md bg-gradient-to-br from-white to-blue-50 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="text-blue-500" size={20} /> Mentor Financeiro IA
          </h3>
          <button 
            onClick={generateAIAnalysis}
            disabled={isAnalyzing || categoryData.length === 0}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {analysis ? 'Atualizar' : 'Analisar Gastos'}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-2" />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Analisando seus dados...</p>
            </div>
          ) : analysis ? (
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium bg-white p-4 rounded-xl border border-blue-100">
              {analysis}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm italic">
                Sua IA financeira está pronta. Clique no botão acima para receber sugestões personalizadas sobre seus gastos deste mês.
              </p>
            </div>
          )}
        </div>
        
        {analysis && (
          <p className="text-[10px] text-slate-400 mt-4 text-center">
            Informações geradas por IA. Use como complemento ao seu planejamento financeiro pessoal.
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;