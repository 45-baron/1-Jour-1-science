import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { createCompetition } from '../services/competitionService';

function CreateCompetition() {
  const { t, isRTL } = useLanguage();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await createCompetition(name, currentUser.uid);
    
    if (result.success) {
      navigate('/organizer/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen islamic-pattern flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        
        <div className="card-islamic animate-scale-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-gemini rounded-3xl mb-6 shadow-glass-lg animate-float">
              <span className="text-4xl">🏆</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              {isRTL ? 'إنشاء مسابقة' : 'Créer une compétition'}
            </h2>
            <p className="text-gray-700 font-medium">
              {isRTL ? 'أدخل اسم المسابقة' : 'Donnez un nom à votre compétition'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6">
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                {isRTL ? 'اسم المسابقة' : 'Nom de la compétition'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isRTL ? 'مثال: رمضان 2026' : 'Ex: Ramadan 2026'}
                className="w-full px-4 py-4 bg-white border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-violet-200 focus:border-violet-500 transition-all duration-300 outline-none text-lg font-medium text-gray-900 placeholder:text-gray-400"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-linear-to-r from-violet-600 via-purple-600 to-pink-600 text-white font-bold rounded-2xl text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 transition-all duration-300 hover:-translate-y-1"
            >
              {loading ? (
                <span className="text-white font-bold">{isRTL ? 'جاري الإنشاء...' : 'Création...'}</span>
              ) : (
                <span className="flex items-center justify-center gap-2 text-white font-bold">
                  <span>✨</span>
                  {isRTL ? 'إنشاء المسابقة' : 'Créer la compétition'}
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/organizer/dashboard')}
              className="text-gray-700 hover:text-violet-600 font-semibold transition-colors"
            >
              ← {isRTL ? 'العودة' : 'Retour'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateCompetition;