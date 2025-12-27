
import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseApp } from 'firebase/app';
import { Lock, Mail, LogIn, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
  firebaseApp: FirebaseApp | null;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, firebaseApp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseApp) return;

    setLoading(true);
    setError('');
    
    try {
      const auth = getAuth(firebaseApp);
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setError('E-mail ou senha incorretos. Verifique se você já cadastrou este e-mail no Firebase Authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-4 rounded-2xl text-white mb-4 shadow-lg shadow-blue-200">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Acesso Restrito</h2>
          <p className="text-slate-500 text-sm text-center mt-1">
            Esta é uma planilha privada. Entre com sua conta autorizada.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs flex items-center gap-2 font-medium">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          <button
            disabled={loading || !firebaseApp}
            type="submit"
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Entrando...' : (
              <>
                <LogIn size={20} /> Acessar Planilha
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-[10px] text-slate-400 text-center leading-relaxed">
          Se você é o administrador, certifique-se de ter ativado "E-mail/Senha" no Firebase e cadastrado os usuários.
        </p>
      </div>
    </div>
  );
};

export default Login;
