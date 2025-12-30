
import React, { useState } from 'react';
import { Person, Card, CardType, Category, CloudConfig, FirebaseFullConfig } from '../types';
import { generateId } from '../lib/utils';
import { Plus, Trash2, User, Tag, Database, Info, Key, ShieldCheck, CreditCard, Palette, Lock, ShieldAlert, ExternalLink } from 'lucide-react';

interface ManagementProps {
  people: Person[];
  cards: Card[];
  categories: Category[];
  cloudConfig: CloudConfig;
  onUpdateCloudConfig: (config: CloudConfig) => void;
  onAddPerson: (person: Person) => void;
  onRemovePerson: (id: string) => void;
  onAddCard: (card: Card) => void;
  onRemoveCard: (id: string) => void;
  onAddCategory: (cat: Category) => void;
  onRemoveCategory: (id: string) => void;
  onManualSync: () => void;
}

const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#64748b', // Slate
];

const Management: React.FC<ManagementProps> = ({ 
  people, cards, categories, cloudConfig, onUpdateCloudConfig, onAddPerson, onRemovePerson, onAddCard, onRemoveCard, onAddCategory, onRemoveCategory
}) => {
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonColor, setNewPersonColor] = useState(PRESET_COLORS[0]);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [newCardName, setNewCardName] = useState('');
  const [newCardPersonId, setNewCardPersonId] = useState(people[0]?.id || '');
  const [newCardType, setNewCardType] = useState<CardType>('BOTH');

  const [firebaseConfigJson, setFirebaseConfigJson] = useState(
    cloudConfig.fullConfig ? JSON.stringify(cloudConfig.fullConfig, null, 2) : ''
  );
  const [familySecret, setFamilySecret] = useState(cloudConfig.familySecret || 'familia');

  const handleSaveCloud = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let jsonInput = firebaseConfigJson.trim();
      if (jsonInput.includes('{')) {
        jsonInput = jsonInput.substring(jsonInput.indexOf('{'), jsonInput.lastIndexOf('}') + 1);
      }
      
      const parsedConfig = JSON.parse(jsonInput) as FirebaseFullConfig;
      if (!parsedConfig.apiKey || !parsedConfig.databaseURL) {
        throw new Error("Campos obrigatórios ausentes");
      }
      
      onUpdateCloudConfig({
        fullConfig: parsedConfig,
        familySecret: familySecret || 'familia',
        enabled: true
      });
      alert('Configuração atualizada com sucesso!');
    } catch (err) {
      alert('Erro: Certifique-se de que colou o objeto JSON corretamente.');
    }
  };

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;
    onAddPerson({ 
      id: generateId(), 
      name: newPersonName, 
      color: newPersonColor 
    });
    setNewPersonName('');
    const currentIndex = PRESET_COLORS.indexOf(newPersonColor);
    setNewPersonColor(PRESET_COLORS[(currentIndex + 1) % PRESET_COLORS.length]);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    onAddCategory({ id: generateId(), name: newCategoryName });
    setNewCategoryName('');
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardName.trim() || !newCardPersonId) return;
    onAddCard({
      id: generateId(),
      name: newCardName,
      personId: newCardPersonId,
      type: newCardType
    });
    setNewCardName('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-12">
      {/* Guia de Segurança - NOVO */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-100 p-8 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-amber-500 p-3 rounded-2xl text-white shadow-lg shadow-amber-200">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-amber-900">Segurança e Privacidade</h3>
            <p className="text-amber-700 text-sm font-medium">Proteja seu banco de dados contra curiosos no GitHub.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/60 p-5 rounded-2xl border border-amber-200 space-y-3">
            <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
              <Lock size={16} /> 1. Bloqueie novos cadastros
            </div>
            <p className="text-xs text-amber-700 leading-relaxed">
              Vá no site do Firebase em <b>Authentication > Settings > User actions</b> e desmarque a opção <b>"Allow software registration"</b>. 
              Isso impede que desconhecidos criem contas, mesmo tendo seu código.
            </p>
          </div>

          <div className="bg-white/60 p-5 rounded-2xl border border-amber-200 space-y-3">
            <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
              <ShieldCheck size={16} /> 2. Regras de Acesso
            </div>
            <p className="text-xs text-amber-700 leading-relaxed">
              No menu <b>Realtime Database > Rules</b>, use regras que verifiquem o seu ID de usuário único (UID). 
              Não deixe as regras como <code>auth != null</code> se quiser privacidade total.
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center">
          <a 
            href="https://console.firebase.google.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-black uppercase hover:bg-amber-700 transition-colors"
          >
            Abrir Console do Firebase <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Firebase Config Card */}
      <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-blue-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <Database size={120} className="text-blue-600" />
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
            <Key size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">Conexão Técnica</h3>
            <p className="text-slate-500 text-sm">Credenciais de sincronização em nuvem.</p>
          </div>
        </div>

        <form onSubmit={handleSaveCloud} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                Configuração do SDK (JSON)
                <span className="cursor-help text-blue-500" title="Suas chaves atuais.">
                  <Info size={14} />
                </span>
              </label>
              <textarea
                rows={4}
                value={firebaseConfigJson}
                onChange={(e) => setFirebaseConfigJson(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                Pasta no Banco ( Secret )
              </label>
              <input
                type="text"
                value={familySecret}
                onChange={(e) => setFamilySecret(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none"
                placeholder="Ex: familia-silva"
              />
            </div>

            <div className="flex items-end">
              <button 
                type="submit"
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Cartões Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <CreditCard size={18} className="text-blue-500" /> Meus Cartões
        </h3>
        
        <form onSubmit={handleAddCard} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <div className="md:col-span-1">
            <input
              type="text"
              value={newCardName}
              onChange={(e) => setNewCardName(e.target.value)}
              placeholder="Nome do Cartão"
              className="w-full px-4 py-2 bg-slate-50 border rounded-lg outline-none text-sm"
              required
            />
          </div>
          <div className="md:col-span-1">
            <select
              value={newCardPersonId}
              onChange={(e) => setNewCardPersonId(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border rounded-lg outline-none text-sm"
              required
            >
              <option value="">De quem é?</option>
              {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-1">
            <select
              value={newCardType}
              onChange={(e) => setNewCardType(e.target.value as CardType)}
              className="w-full px-4 py-2 bg-slate-50 border rounded-lg outline-none text-sm"
            >
              <option value="CREDIT">Crédito</option>
              <option value="DEBIT">Débito</option>
              <option value="BOTH">Ambos</option>
            </select>
          </div>
          <button type="submit" className="bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 font-bold text-sm py-2 hover:bg-blue-700 transition-colors">
            <Plus size={16} /> Cadastrar
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cards.length === 0 ? (
            <p className="text-slate-400 text-xs italic col-span-full">Nenhum cartão cadastrado.</p>
          ) : (
            cards.map(card => {
              const person = people.find(p => p.id === card.personId);
              return (
                <div key={card.id} className="flex flex-col p-3 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                  <button 
                    onClick={() => onRemoveCard(card.id)}
                    className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                  <span className="text-sm font-black text-slate-800">{card.name}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-white rounded-full text-blue-600 border border-blue-100 uppercase">
                      {card.type === 'BOTH' ? 'Crédito/Débito' : card.type === 'CREDIT' ? 'Crédito' : 'Débito'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {person?.name || 'Desconhecido'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Categorias e Membros Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Tag size={18} className="text-blue-500" /> Categorias
          </h3>
          <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Adicionar..."
              className="flex-1 px-4 py-2 bg-slate-50 border rounded-lg outline-none text-sm"
            />
            <button type="submit" className="p-2 bg-blue-600 text-white rounded-lg transition-transform active:scale-90"><Plus size={20} /></button>
          </form>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <span key={cat.id} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold flex items-center gap-2 group">
                {cat.name}
                <button onClick={() => onRemoveCategory(cat.id)} className="hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <User size={18} className="text-blue-500" /> Membros da Família
          </h3>
          <form onSubmit={handleAddPerson} className="space-y-4 mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                placeholder="Nome..."
                className="flex-1 px-4 py-2 bg-slate-50 border rounded-lg outline-none text-sm"
              />
              <button 
                type="submit" 
                className="p-2 bg-blue-600 text-white rounded-lg transition-transform active:scale-90 shadow-md"
              >
                <Plus size={20} />
              </button>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Palette size={10} /> Cor de Identificação
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewPersonColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      newPersonColor === color ? 'border-slate-800 scale-110 shadow-md' : 'border-transparent scale-100 opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </form>

          <div className="space-y-2">
            {people.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 group">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: p.color }} />
                  <span className="text-sm font-black text-slate-700">{p.name}</span>
                </div>
                <button 
                  onClick={() => onRemovePerson(p.id)} 
                  className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100" 
                  disabled={people.length <= 1}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Management;
