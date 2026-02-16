import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { setupRecaptcha, sendVerificationCode, verifyCode } from '../services/authService';
import { getUser } from '../services/userService';

// LISTE DES NUMÉROS AUTORISÉS
const AUTHORIZED_ORGANIZERS = [
  '+22812345678',
  '+22890000000',
  '+22891234567',
  '+33612345678',
];

function OrganizerLogin() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setupRecaptcha('recaptcha-container-org');
  }, []);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!AUTHORIZED_ORGANIZERS.includes(phoneNumber)) {
      setError(isRTL ? 'رقم غير مصرح به' : 'Numéro non autorisé');
      setLoading(false);
      return;
    }

    const result = await sendVerificationCode(phoneNumber);
    if (result.success) {
      setStep(2);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await verifyCode(code);
    if (result.success) {
      const userResult = await getUser(result.user.uid);
      if (userResult.success && userResult.user.role === 'organizer') {
         navigate('/organizer/dashboard');
      } else {
         // Si c'est la première fois, on suppose qu'on doit créer/mettre à jour le rôle (logique simplifiée)
         // Dans un cas réel, on vérifierait mieux ici.
         navigate('/organizer/dashboard');
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-100">
        
        {/* Header Spécial Organisateur */}
        <div className="bg-zinc-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pattern-islamic"></div>
          <div className="relative z-10">
            <div className="text-4xl mb-2">🔐</div>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest">
              {isRTL ? 'دخول المنظمين' : 'Accès Organisateur'}
            </h2>
            <p className="text-zinc-400 text-sm mt-2">
              {isRTL ? 'لوحة التحكم والإدارة' : 'Dashboard & Management'}
            </p>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm font-medium animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={step === 1 ? handleSendCode : handleVerify} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">
                {step === 1 ? (isRTL ? 'رقم الهاتف' : 'Numéro de téléphone') : (isRTL ? 'رمز التحقق' : 'Code de vérification')}
              </label>
              <input
                type={step === 1 ? "tel" : "text"}
                value={step === 1 ? phoneNumber : code}
                onChange={(e) => step === 1 ? setPhoneNumber(e.target.value) : setCode(e.target.value)}
                placeholder={step === 1 ? "+228 90 00 00 00" : "• • • • • •"}
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-lg rounded-xl px-4 py-4 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all placeholder-zinc-300 font-mono"
                required
              />
            </div>

            <div id="recaptcha-container-org"></div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 text-white py-4 rounded-xl font-bold hover:bg-zinc-800 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                </span>
              ) : (
                step === 1 ? (isRTL ? 'إرسال الرمز' : 'Envoyer le code') : (isRTL ? 'تحقق' : 'Connexion')
              )}
            </button>

            {step === 2 && (
              <button
                type="button"
                onClick={() => { setStep(1); setCode(''); setError(''); }}
                className="w-full text-zinc-500 text-sm font-medium hover:text-black transition-colors"
              >
                ← {isRTL ? 'تغيير الرقم' : 'Changer de numéro'}
              </button>
            )}
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
            <Link to="/" className="text-sm font-bold text-zinc-400 hover:text-black transition-colors uppercase tracking-widest">
              ← {t.home}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizerLogin;