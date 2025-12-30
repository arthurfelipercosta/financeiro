
import React, { useState } from 'react';
import { Person, Card, CardType, Category, CloudConfig, FirebaseFullConfig } from '../types';
import { generateId } from '../lib/utils';
import { Plus, Trash2, User, Tag, Database, Info, Key, CreditCard, Palette, Pencil, Check, X, AlertTriangle, CalendarDays } from 'lucide-react';

interface ManagementProps {
  people: Person[];
  cards: Card[];
  categories: Category[];
  cloudConfig: CloudConfig;
  onUpdateCloudConfig: (config: CloudConfig) => void;
  onUpdateCard: (card: Card) => void;
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
  people, cards, categories, cloudConfig, onUpdateCloudConfig, onUpdateCard, onAddPerson, onRemovePerson, onAddCard, onRemoveCard, onAddCategory, onRemoveCategory
}) => {
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonColor, setNewPersonColor] = useState(PRESET_COLORS[0]);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [newCardName, setNewCardName] = useState('');
  const [newCardPersonId, setNewCardPersonId] = useState(people[0]?.id || '');
  const [newCardType, setNewCardType] = useState<CardType>('BOTH');
  const [newCardClosingDay, setNewCardClosingDay] = useState(5);

  // Estado para edição de cartão
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editCardName, setEditCardName] = useState('');
  const [editCardPersonId, setEditCardPersonId] = useState('');
  const [editCardType, setEditCardType] = useState<CardType>('BOTH');
  const [editCardClosingDay, setEditCardClosingDay] = useState(5);

  // Estado para Confirmação de Exclusão
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, type: 'CARD' | 'PERSON' | 'CATEGORY', name: string } | null>(null);

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
      type: newCardType,
      closingDay: newCardClosingDay
    });
    setNewCardName('');
    setNewCardClosingDay(5);
  };

  const startEditCard = (card: Card) => {
    setEditingCardId(card.id);
    setEditCardName(card.name);
    setEditCardPersonId(card.personId);
    setEditCardType(card.type);
    setEditCardClosingDay(card.closingDay || 5);
  };

  const saveEditCard = () => {
    if (!editingCardId || !editCardName.trim() || !editCardPersonId) return;
    onUpdateCard({
      id: editingCardId,
      name: editCardName,
      personId: editCardPersonId,
      type: editCardType,
      closingDay: editCardClosingDay
    });
    setEditingCardId(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'CARD') {
      onRemoveCard(deleteTarget.id);
      setEditingCardId(null);
    } else if (deleteTarget.type === 'PERSON') {
      onRemovePerson(deleteTarget.id);
    } else if (deleteTarget.type === 'CATEGORY') {
      onRemoveCategory(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-12">
      {/* Modal de Confirmação Customizado */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-50 p-4 rounded-full text-red-500 mb-6 ring-8 ring-red-50/50">
                <AlertTriangle size={32} />
              </div>
              <h4 className="text-xl font-black text-slate-800 mb-2">Tem certeza?</h4>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Você está prestes a excluir <b>"{deleteTarget.name}"</b>. Esta ação não poderá ser desfeita e pode afetar registros vinculados.
              </p>
              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={confirmDelete}
                  className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-red-700 transition-all shadow-lg shadow-red-100 active:scale-95"
                >
                  Sim, Excluir permanentemente
                </button>
                <button 
                  onClick={() => setDeleteTarget(null)}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancelar e Voltar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
        
        {!editingCardId && (
          <form onSubmit={handleAddCard} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-8 animate-in slide-in-from-top-2 duration-300">
            <div className="md:col-span-1">
              <input
                type="text"
                value={newCardName}
                onChange={(e) => setNewCardName(e.target.value)}
                placeholder="Nome (ex: Nub)"
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
                <option value="">Dono</option>
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
            <div className="md:col-span-1">
              <input
                type="number"
                min="1"
                max="31"
                value={newCardClosingDay}
                onChange={(e) => setNewCardClosingDay(Number(e.target.value))}
                placeholder="Fecha dia"
                title="Dia de fechamento da fatura"
                className="w-full px-4 py-2 bg-slate-50 border rounded-lg outline-none text-sm"
                required
              />
            </div>
            <button type="submit" className="bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 font-bold text-sm py-2 hover:bg-blue-700 transition-colors">
              <Plus size={16} /> Cadastrar
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.length === 0 ? (
            <div className="col-span-full py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-xs italic">Nenhum cartão cadastrado ainda.</p>
            </div>
          ) : (
            cards.map(card => {
              const isEditing = editingCardId === card.id;
              const person = people.find(p => p.id === card.personId);

              if (isEditing) {
                return (
                  <div key={card.id} className="flex flex-col p-4 bg-blue-50 rounded-2xl border-2 border-blue-400 animate-in zoom-in duration-200 space-y-3 shadow-lg ring-4 ring-blue-50">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-blue-600 uppercase">Editando Cartão</label>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget({ id: card.id, type: 'CARD', name: card.name });
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Excluir Cartão"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={editCardName}
                      onChange={(e) => setEditCardName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={editCardPersonId}
                      onChange={(e) => setEditCardPersonId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm outline-none"
                    >
                      {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={editCardType}
                        onChange={(e) => setEditCardType(e.target.value as CardType)}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm outline-none"
                      >
                        <option value="CREDIT">Crédito</option>
                        <option value="DEBIT">Débito</option>
                        <option value="BOTH">Ambos</option>
                      </select>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={editCardClosingDay}
                        onChange={(e) => setEditCardClosingDay(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm outline-none"
                        placeholder="Dia Fecha"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button 
                        onClick={saveEditCard}
                        className="flex-1 py-2 bg-green-600 text-white rounded-lg flex items-center justify-center gap-1 text-xs font-black uppercase hover:bg-green-700 active:scale-95 transition-all shadow-sm"
                      >
                        <Check size={16} /> Salvar
                      </button>
                      <button 
                        onClick={() => setEditingCardId(null)}
                        className="flex-1 py-2 bg-slate-300 text-slate-700 rounded-lg flex items-center justify-center gap-1 text-xs font-black uppercase hover:bg-slate-400 active:scale-95 transition-all"
                      >
                        <X size={16} /> Sair
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <button 
                  key={card.id} 
                  type="button"
                  onClick={() => startEditCard(card)}
                  className="group relative flex flex-col w-full text-left bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-blue-400 hover:-translate-y-0.5 active:scale-[0.96] active:bg-slate-50"
                >
                  <div className="p-5 flex-1 w-full">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-black text-slate-800">{card.name}</span>
                      <div className="bg-slate-50 p-2 rounded-xl text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                        <Pencil size={14} />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        card.type === 'BOTH' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                        card.type === 'CREDIT' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {card.type === 'BOTH' ? 'Multifunção' : card.type === 'CREDIT' ? 'Crédito' : 'Débito'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                        <User size={10} /> {person?.name || '---'}
                      </span>
                      {card.type !== 'DEBIT' && (
                        <span className="text-[10px] text-blue-500 font-black uppercase flex items-center gap-1">
                          <CalendarDays size={10} /> Fecha dia {card.closingDay || 5}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
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
              placeholder="Adicionar categoria..."
              className="flex-1 px-4 py-2 bg-slate-50 border rounded-lg outline-none text-sm"
            />
            <button type="submit" className="p-2 bg-blue-600 text-white rounded-lg transition-transform active:scale-90"><Plus size={20} /></button>
          </form>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <span key={cat.id} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold flex items-center gap-2 group">
                {cat.name}
                <button 
                  onClick={() => setDeleteTarget({ id: cat.id, type: 'CATEGORY', name: cat.name })} 
                  className="hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
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
                placeholder="Nome do membro..."
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
                  onClick={() => setDeleteTarget({ id: p.id, type: 'PERSON', name: p.name })} 
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
