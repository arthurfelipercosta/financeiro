
import React, { useState } from 'react';
import { Person, Card, CardType, Category, CloudConfig, FirebaseFullConfig } from '../types';
import { generateId } from '../lib/utils';
import { Plus, Trash2, User, Tag, Database, Info, Key, ShieldCheck, CreditCard } from 'lucide-react';

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

const Management: React.FC<ManagementProps> = ({ 
  people, cards, categories, cloudConfig, onUpdateCloudConfig, onAddPerson, onRemovePerson, onAddCard, onRemoveCard, onAddCategory, onRemoveCategory
}) => {
  const [newPersonName, setNewPersonName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // States para novo cartão
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
    onAddPerson({ id: generateId(), name: newPersonName, color: '#3b82f6' });
    setNewPersonName('');
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
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Firebase Config Card */}
      <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-blue-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <ShieldCheck size={120} className="text-blue-600" />
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
            <Key size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">Conexão com Firebase</h3>
            <p className="text-slate-500 text-sm">Suas credenciais já estão configuradas. Altere apenas se necessário.</p>
          </div>
        </div>

        <form onSubmit={handleSaveCloud} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                Configuração do SDK (Objeto JSON)
                <span className="cursor-help text-blue-500" title="Suas chaves atuais.">
                  <Info size={14} />
                </span>
              </label>
              <textarea
                rows={6}
                value={firebaseConfigJson}
                onChange={(e) => setFirebaseConfigJson(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                Pasta no Banco ( familySecret )
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
              placeholder="Nome do Cartão (ex: Nubank)"
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
                      Dono: {person?.name || 'Desconhecido'}
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
            <button type="submit" className="p-2 bg-blue-600 text-white rounded-lg"><Plus size={20} /></button>
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
          <form onSubmit={handleAddPerson} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              placeholder="Nome..."
              className="flex-1 px-4 py-2 bg-slate-50 border rounded-lg outline-none text-sm"
            />
            <button type="submit" className="p-2 bg-blue-600 text-white rounded-lg"><Plus size={20} /></button>
          </form>
          <div className="space-y-2">
            {people.map(p => (
              <div key={p.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-sm font-bold text-slate-700">{p.name}</span>
                </div>
                <button onClick={() => onRemovePerson(p.id)} className="p-1 text-slate-300 hover:text-red-500" disabled={people.length <= 1}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Management;
