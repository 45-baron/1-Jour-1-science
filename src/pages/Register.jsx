import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { registerWithEmail } from '../services/authService';
import { createUser } from '../services/userService';

function Register() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);

    if (password !== confirmPassword) {
      setError(isRTL ? "كلمات المرور غير متطابقة" : "Les mots de passe ne correspondent pas");
      setLoading(false); return;
    }

    // 1. Création Auth (Email/Pass)
    const result = await registerWithEmail(email, password);
    
    if (result.success) {
      // 2. Création Profil Firestore (Role: 'player')
      await createUser(result.user.uid, { 
        fullName, 
        email, 
        role: 'player', // Par défaut
        totalPoints: 0 
      });
      navigate ('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 pattern-arabesque">
      <div className="glass-dark w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl">
        <h2 className="text-4xl font-black text-white mb-8 tracking-tighter text-center italic uppercase">
            {isRTL ? 'إنشاء حساب' : 'Nouveau Compte'}
        </h2>
        
        {error && <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200 text-sm font-bold text-center">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">{t.fullName}</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-blue-500" placeholder="Pseudo" required />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-blue-500" placeholder="hello@exemple.com" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Mot de passe</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-blue-500" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Confirmation</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-blue-500" required />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-5 bg-linear-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-blue-500/30 transition-all mt-4">
            {loading ? "..." : (isRTL ? "تسجيل" : "S'INSCRIRE ")}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <Link to="/login" className="text-slate-400 text-sm font-medium hover:text-white transition-colors">
            Déjà un compte ? <span className="text-white font-black underline ml-1">Se connecter</span>
          </Link>
        </div>
      </div>
    </div>
  );
}


export default Register;
