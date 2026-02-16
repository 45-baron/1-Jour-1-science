import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { searchCompetition, joinCompetition } from '../services/competitionService';

function SearchCompetition() {
  const { t, isRTL } = useLanguage();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    const result = await searchCompetition(searchTerm);
    
    if (result.success) {
      setResults(result.competitions);
    }
    setLoading(false);
  };

  const handleJoin = async (competitionId) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    setJoining(competitionId);
    const result = await joinCompetition(competitionId, currentUser.uid);
    
    if (result.success) {
      alert(isRTL ? '✅ انضممت إلى المسابقة!' : '✅ Vous avez rejoint la compétition !');
      navigate(`/competition/${competitionId}`);
    } else {
      alert(result.error);
    }
    setJoining(null);
  };

  return (
    <div className="min-h-screen islamic-pattern py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        
        <div className="card-islamic mb-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-gemini rounded-3xl mb-6 shadow-glass-lg animate-float">
              <span className="text-4xl">🔍</span>
            </div>
            <h1 className="text-4xl font-bold gradient-text-gemini mb-2">
              {isRTL ? 'البحث عن مسابقة' : 'Rechercher une Compétition'}
            </h1>
            <p className="text-gray-600">
              {isRTL ? 'ابحث باسم المسابقة للانضمام' : 'Recherchez par nom pour rejoindre'}
            </p>
          </div>

          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isRTL ? 'اسم المسابقة...' : 'Nom de la compétition...'}
                className="flex-1 px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all duration-300 outline-none text-lg"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-linear-to-r from-primary-600 to-purple-600 text-white rounded-2xl font-bold shadow-glass-lg hover:shadow-glow disabled:opacity-50 transition-all"
              >
                {loading ? '🔄' : '🔍'}
              </button>
            </div>
          </form>

          {results.length > 0 && (
            <div className="space-y-4">
              {results.map((comp) => (
                <div key={comp.id} className="glass p-6 rounded-3xl animate-slide-up">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold gradient-text mb-2">
                        {comp.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        👥 {comp.participants?.length || 0} {isRTL ? 'مشاركين' : 'participants'}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleJoin(comp.id)}
                      disabled={joining === comp.id}
                      className="px-6 py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold hover:shadow-lg disabled:opacity-50 transition-all"
                    >
                      {joining === comp.id ? '⏳' : (isRTL ? 'انضم' : 'Rejoindre')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.length === 0 && searchTerm && !loading && (
            <div className="text-center py-8 text-gray-500">
              {isRTL ? 'لا توجد نتائج' : 'Aucun résultat'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchCompetition;