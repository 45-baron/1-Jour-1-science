import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getGlobalRanking } from '../services/rankingService';
import { Link } from 'react-router-dom';

function Ranking() {
  const { t, isRTL } = useLanguage();
  const { currentUser } = useAuth();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRanking(); }, []);

  const loadRanking = async () => {
    const result = await getGlobalRanking(50);
    if (result.success) setRanking(result.ranking);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-6xl font-black text-black tracking-tighter uppercase italic mb-12 text-center">
          {isRTL ? 'قائمة المتصدرين' : 'Classement'}
        </h2>

        <div className="glass-card rounded-3xl overflow-hidden border border-slate-100">
          {loading ? (
            <div className="p-20 text-center animate-pulse text-slate-300 font-bold uppercase tracking-widest">Loading...</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {ranking.map((player, index) => (
                <div key={player.uid} className={`flex items-center p-8 transition-all hover:bg-slate-50 ${currentUser?.uid === player.id ? 'bg-violet-50/50' : ''}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${
                    index === 0 ? 'bg-yellow-400 text-white' : 
                    index === 1 ? 'bg-slate-300 text-white' : 
                    index === 2 ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="ml-6 grow">
                    <span className="text-xl font-bold text-black uppercase tracking-tight">{player.pseudo}</span>
                    {currentUser?.uid === player.id && <span className="ml-3 text-[10px] font-black bg-violet-600 text-white px-3 py-1 rounded-full uppercase">Me</span>}
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-black leading-none">{player.totalPoints}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Points</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Ranking;