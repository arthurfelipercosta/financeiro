
import React, { useState } from 'react';
import { Person, Card, CardType, Category } from '../types';
import { generateId } from '../lib/utils';
import { Plus, CreditCard, Trash2, User, Tag } from 'lucide-react';

interface ManagementProps {
  people: Person[];
  cards: Card[];
  categories: Category[];
  onAddPerson: (person: Person) => void;
  onRemovePerson: (id: string) => void;
  onAddCard: (card: Card) => void;
  onRemoveCard: (id: string) => void;
  onAddCategory: (cat: Category) => void;
  onRemoveCategory: (id: string) => void;
}

const Management: React.FC<ManagementProps> = ({ 
  people, cards, categories, onAddPerson, onRemovePerson, onAddCard, onRemoveCard, onAddCategory, onRemoveCategory
}) => {
  const [newPersonName, setNewPersonName] = useState('');
  const [newCardName, setNewCardName] = useState('');
  const [newCardPersonId, setNewCardPersonId] = useState(people[0]?.id || '');
  const [newCardType, setNewCardType] = useState<CardType>('BOTH');
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
    onAddPerson({
      id: generateId(),
      name: newPersonName,
      color: colors[people.length % colors.length]
    });
    setNewPersonName('');
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

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    onAddCategory({
      id: generateId(),
      name: newCategoryName
    });
    setNewCategoryName('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Category Management */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <Tag className="text-blue-500" />
          <h3 className="text-xl font-bold text-slate-800">Minhas Categorias</h3>
        </div>
        
        <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nova categoria..."
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-1">
            <Plus size={18} /> Add
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-slate-700 truncate">{cat.name}</span>
              <button 
                onClick={() => onRemoveCategory(cat.id)}
                className="text-slate-300 hover:text-red-500 transition-colors ml-2"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* People Management */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <User className="text-blue-500" />
          <h3 className="text-xl font-bold text-slate-800">Membros da Família</h3>
        </div>
        
        <form onSubmit={handleAddPerson} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            placeholder="Nome do membro..."
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-1">
            <Plus size={18} /> Add
          </button>
        </form>

        <div className="space-y-3">
          {people.map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="font-semibold text-slate-700">{p.name}</span>
              </div>
              <button 
                onClick={() => onRemovePerson(p.id)}
                className="text-slate-300 hover:text-red-500 transition-colors"
                disabled={people.length <= 1}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Card Management */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="text-blue-500" />
          <h3 className="text-xl font-bold text-slate-800">Cartões</h3>
        </div>

        <form onSubmit={handleAddCard} className="space-y-3 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input
              type="text"
              value={newCardName}
              onChange={(e) => setNewCardName(e.target.value)}
              placeholder="Nome do Cartão (ex: Nubank)"
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <select
              value={newCardPersonId}
              onChange={(e) => setNewCardPersonId(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">De quem?</option>
              {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select
              value={newCardType}
              onChange={(e) => setNewCardType(e.target.value as CardType)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="BOTH">Débito & Crédito</option>
              <option value="CREDIT">Somente Crédito</option>
              <option value="DEBIT">Somente Débito</option>
            </select>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-1">
              <Plus size={18} /> Cadastrar
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {cards.map(c => {
            const owner = people.find(p => p.id === c.personId);
            return (
              <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border-l-4 border-blue-400">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800">{c.name}</span>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase font-bold">{c.type}</span>
                    <span>• {owner?.name}</span>
                  </div>
                </div>
                <button 
                  onClick={() => onRemoveCard(c.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>
        {cards.length === 0 && <p className="text-center py-4 text-slate-400 text-sm">Nenhum cartão cadastrado.</p>}
      </div>
    </div>
  );
};

export default Management;
