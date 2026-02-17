import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { setupRecaptcha, sendVerificationCode, verifyCode, loginWithEmail } from '../services/authService';
import { doc, setDoc, getDoc } from 'firebase/firestore'; 
import { db } from '../services/firebase';

function Login() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  
  // État pour basculer entre Joueur (Email) et Organisateur (SMS)
  // Par défaut, on est sur "Joueur" sauf si l'URL contient 'organizer'
  const [loginMode, setLoginMode] = useState(location.pathname.includes('organizer') ? 'organizer' : 'player');

  // --- ÉTATS JOUEUR (EMAIL) ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- ÉTATS ORGANISATEUR (SMS) ---
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1); // 1 = Tel, 2 = Code

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🔒 LISTE BLANCHE : SEULS CES NUMÉROS PEUVENT DEVENIR ORGANISATEURS
  // Ajoute ici tes vrais numéros et tes numéros de test Firebase
  const AUTHORIZED_ADMINS = [
    '+22890000000', // Ton numéro
    '+22870182109', // Autre admin
    '+22891644232'  // Numéro test Firebase
  ]; 

  useEffect(() => { 
    if (loginMode === 'organizer') setupRecaptcha('recaptcha-container'); 
  }, [loginMode]);

  // --- GESTION LOGIN JOUEUR (EMAIL) ---
  const handlePlayerLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    const result = await loginWithEmail(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  // --- GESTION LOGIN ORGANISATEUR (SMS) ---
  const handleOrganizerSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    
    try {
      if (step === 1) {
        // 1. VÉRIFICATION LISTE BLANCHE
        const cleanNumber = phoneNumber.replace(/\s/g, '');
        if (!AUTHORIZED_ADMINS.includes(cleanNumber)) {
          throw new Error(isRTL ? "هذا الرقم غير مصرح له" : "Numéro non autorisé.");
        }

        // 2. ENVOI SMS
        const result = await sendVerificationCode(cleanNumber);
        if (result.success) setStep(2);
        else throw new Error(result.error);
        
      } else {
        // 3. VÉRIFICATION CODE
        const result = await verifyCode(code);
        if (result.success) {
          // 4. CRÉATION/MISE À JOUR DU PROFIL ADMIN (AUTO-ONBOARDING)
          const userRef = doc(db, 'users', result.user.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            // Création automatique du profil Organisateur s'il n'existe pas
            await setDoc(userRef, {
              phoneNumber: result.user.phoneNumber,
              role: 'organizer', // 🔑 C'est ici que le pouvoir est donné
              createdAt: new Date(),
              pseudo: 'Admin'
            });
          }
          
          navigate('/organizer/dashboard');
        } else {
          throw new Error(result.error);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pattern-arabesque"></div>
      
      <div className="glass-dark w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl z-10 transition-all duration-500">
        
        {/* TABS (Joueur vs Organisateur) */}
        <div className="flex bg-white/5 p-1 rounded-xl mb-8">
          <button 
            onClick={() => setLoginMode('player')}
            className={`flex-1 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${loginMode === 'player' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            Joueur
          </button>
          <button 
            onClick={() => setLoginMode('organizer')}
            className={`flex-1 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${loginMode === 'organizer' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            Organisateur
          </button>
        </div>

        <h2 className="text-4xl font-black text-white mb-2 tracking-tighter text-center">
          {loginMode === 'player' ? 'LOGIN' : 'ADMIN'}
        </h2>
        <p className="text-slate-400 text-center mb-8 font-medium text-sm">
          {loginMode === 'player' ? 'Connectez-vous pour jouer' : 'Accès réservé aux organisateurs'}
        </p>

        {error && <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200 text-sm font-bold text-center animate-pulse">{error}</div>}

        {loginMode === 'player' ? (
          /* --- FORMULAIRE JOUEUR (EMAIL) --- */
          <form onSubmit={handlePlayerLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-blue-500 outline-none transition-all"
                placeholder="joueur@email.com"
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Mot de passe</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-blue-500 outline-none transition-all"
                placeholder="••••••••"
                required 
              />
            </div>
            <button type="submit" disabled={loading} className="w-full py-5 bg-white text-black rounded-2xl font-black text-lg shadow-xl hover:bg-slate-200 transition-all transform hover:-translate-y-1">
              {loading ? '...' : 'SE CONNECTER'}
            </button>
            <div className="text-center text-slate-500 text-sm mt-4">
              Pas de compte ? <Link to="/register" className="text-blue-400 font-black hover:underline">CRÉER UN COMPTE</Link>
            </div>
          </form>
        ) : (
          /* --- FORMULAIRE ORGANISATEUR (SMS) --- */
          <form onSubmit={handleOrganizerSubmit} className="space-y-6">
             <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">
                {step === 1 ? "Téléphone Admin" : "Code SMS"}
              </label>
              <input
                type={step === 1 ? "tel" : "text"}
                value={step === 1 ? phoneNumber : code}
                onChange={(e) => step === 1 ? setPhoneNumber(e.target.value) : setCode(e.target.value)}
                className="w-full p-5 bg-white/5 border border-violet-500/30 rounded-2xl text-center text-xl font-bold text-white focus:border-violet-500 outline-none transition-all"
                placeholder={step === 1 ? "+228..." : "000000"}
                required
              />
            </div>
            <div id="recaptcha-container" className="flex justify-center"></div>
            <button type="submit" disabled={loading} className="w-full py-5 bg-violet-600 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-violet-500/20 transition-all transform hover:-translate-y-1">
              {loading ? '...' : (step === 1 ? 'RECEVOIR CODE' : 'ENTRER DASHBOARD')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;

                
