
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

  // Processamento de dados para os gráficos
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
    // A chave deve ser configurada no Netlify como API_KEY
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey.trim() === "" || apiKey === "undefined") {
      setAnalysis("⚠️ Chave de API não configurada corretamente.\n\nNo Netlify, vá em 'Environment Variables':\n1. Key: API_KEY\n2. Value: (Cole seu código AIza...)\n3. Clique em 'Create Variable' e faça um novo 'Deploy'.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const totalExpense = categoryData.reduce((acc, curr) => acc + curr.value, 0);
      const mainCategory = categoryData[0]?.name || 'Nenhuma';
      
      const prompt = `Você é um consultor financeiro familiar experiente. Analise estes dados reais de gastos mensais:
      - Gasto Total: ${formatCurrency(totalExpense)}
      - Categoria com maior gasto: ${mainCategory} (${formatCurrency(categoryData[0]?.value || 0)})
      - Divisão por pessoa: ${personData.map(p => `${p.name}: ${formatCurrency(p.value)}`).join(', ')}

      Dê 3 dicas curtas e práticas em português para economizar ou gerir melhor o dinheiro. Use emojis e seja motivador. Limite a 100 palavras.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      
      // Conforme as diretrizes, usamos .text diretamente (é um getter, não um método)
      setAnalysis(response.text || "A IA não conseguiu gerar uma resposta agora. Tente novamente em instantes.");
    } catch (err: any) {
      console.error("Erro Gemini:", err);
      if (err.message?.includes("API key not valid")) {
        setAnalysis("❌ Chave de API Inválida. Verifique se copiou o código do Google AI Studio corretamente sem espaços.");
      } else {
        setAnalysis("❌ Erro ao conectar com a IA. Certifique-se de que a variável de ambiente API_KEY está salva no Netlify.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in slide-in-from-bottom duration-700">
      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingDown size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Gastos por Categoria</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fontWeight: 600 }} stroke="#64748b" />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => formatCurrency(value)} 
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
              <Target size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Divisão por Pessoa</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={personData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={70} 
                  outerRadius={100} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {personData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => formatCurrency(value)} 
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* IA e Pagamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Formas de Pagamento</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={methodData} cx="50%" cy="50%" paddingAngle={2} dataKey="value" innerRadius={40}>
                  {methodData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} strokeWidth={0} />)}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl shadow-xl shadow-blue-100 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <BrainCircuit size={150} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                  <Sparkles size={24} className="text-yellow-300" />
                </div>
                <h3 className="text-xl font-black">Consultoria da Família</h3>
              </div>
              
              <button 
                onClick={generateAIAnalysis}
                disabled={isAnalyzing}
                className="px-5 py-2.5 bg-white text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-50 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg active:scale-95"
              >
                {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {analysis ? 'Atualizar Dicas' : 'Analisar Gastos'}
              </button>
            </div>

            <div className="min-h-[140px] flex items-center justify-center">
              {isAnalyzing ? (
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-white/50 animate-spin mx-auto mb-3" />
                  <p className="text-blue-100 font-medium animate-pulse">O consultor está analisando seus dados...</p>
                </div>
              ) : analysis ? (
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 w-full animate-in fade-in zoom-in duration-500">
                  <p className="text-base leading-relaxed font-medium whitespace-pre-wrap">
                    {analysis}
                  </p>
                </div>
              ) : (
                <div className="text-center text-blue-100/80 max-w-sm">
                  <p className="text-lg font-medium italic">
                    "O planejamento financeiro é a base de um futuro tranquilo para o casal."
                  </p>
                  <p className="text-[10px] mt-4 font-bold uppercase tracking-widest opacity-60">
                    Clique no botão acima para receber sugestões da IA
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
