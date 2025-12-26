
import React, { useState } from 'react';
import { Person, Card, CardType, Category, CloudConfig, FirebaseFullConfig } from '../types';
import { generateId } from '../lib/utils';
import { Plus, Trash2, User, Tag, Database, Info, ExternalLink, Key, ShieldCheck } from 'lucide-react';

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
  people, cards, categories, cloudConfig, onUpdateCloudConfig, onAddPerson, onRemovePerson, onAddCategory, onRemoveCategory
}) => {
  const [newPersonName, setNewPersonName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  
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

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
            <h4 className="text-[10px] font-black text-green-700 uppercase mb-2 flex items-center gap-1">
              <Database size={12} /> Banco de Dados Ativo
            </h4>
            <p className="text-[11px] text-green-800 leading-relaxed">
              O sistema está gravando em tempo real no seu projeto <b>financeiro-1e216</b>.
            </p>
          </div>
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <h4 className="text-[10px] font-black text-amber-700 uppercase mb-2 flex items-center gap-1">
              <ShieldCheck size={12} /> Autenticação Ativa
            </h4>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Lembre-se de cadastrar o e-mail da sua noiva no menu <b>Authentication</b> do Firebase.
            </p>
          </div>
        </div>
      </div>

      {/* Basic Lists */}
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
            <User size={18} className="text-blue-500" /> Membros
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
                <span className="text-sm font-bold text-slate-700 ml-2">{p.name}</span>
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
