import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';

function PublicArchives() {
  const { t, isRTL } = useLanguage();
  const [competitions, setCompetitions] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    try {
      const competitionsRef = collection(db, 'competitions');
      const querySnapshot = await getDocs(competitionsRef);
      
      const competitionsData = [];
      querySnapshot.forEach((doc) => {
        competitionsData.push({ id: doc.id, ...doc.data() });
      });
      
      setCompetitions(competitionsData);
      
      // Charger toutes les sessions de questions
      const sessionsRef = collection(db, 'questionSessions');
      const q = query(sessionsRef, orderBy('date', 'desc'));
      const sessionsSnapshot = await getDocs(q);
      
      const sessionsData = [];
      sessionsSnapshot.forEach((doc) => {
        sessionsData.push({ id: doc.id, ...doc.data() });
      });
      
      setSessions(sessionsData);
    } catch (error) {
      console.error('Erreur chargement:', error);
    }
    setLoading(false);
  };

  const getSessionsByCompetition = (competitionId) => {
    return sessions.filter(s => s.competitionId === competitionId);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-black text-black uppercase">
            {isRTL ? 'الأرشيف' : 'Archives'}
          </h2>
          <Link to="/" className="ios-glass px-4 py-2 rounded-full text-sm font-bold">
            ✕
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 animate-pulse">📚</div>
            <p className="text-gray-600">{isRTL ? 'جاري التحميل...' : 'Chargement...'}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {competitions.map((competition) => {
              const competitionSessions = getSessionsByCompetition(competition.id);
              
              if (competitionSessions.length === 0) return null;
              
              return (
                <div key={competition.id} className="ios-card">
                  <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                    <span className="text-3xl">🏆</span>
                    {competition.name}
                  </h3>
                  
                  <div className="space-y-4">
                    {competitionSessions.map((session) => (
                      <details key={session.id} className="group">
                        <summary className="cursor-pointer list-none p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">📅</span>
                              <div>
                                <div className="font-bold text-black">
                                  {session.date}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {session.questions?.length || 0} {isRTL ? 'أسئلة' : 'questions'}
                                </div>
                              </div>
                            </div>
                            <span className="text-2xl group-open:rotate-180 transition-transform">
                              ▼
                            </span>
                          </div>
                        </summary>
                        
                        <div className="mt-4 space-y-4 px-4">
                          {session.questions?.map((question, index) => (
                            <div key={question.id || index} className="border-l-4 border-violet-500 pl-4 py-2">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-sm text-gray-500">
                                  Q{index + 1}
                                </span>
                                <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-full">
                                  {question.points} pts
                                </span>
                              </div>
                              <p className="text-gray-800 font-medium">
                                {question.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              );
            })}

            {competitions.every(c => getSessionsByCompetition(c.id).length === 0) && (
              <div className="text-center py-16">
                <div className="text-8xl mb-6 opacity-20">📚</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  {isRTL ? 'لا توجد أرشيفات بعد' : 'Pas d\'archives disponibles'}
                </h3>
                <p className="text-gray-500">
                  {isRTL 
                    ? 'الأسئلة السابقة ستظهر هنا' 
                    : 'Les anciennes questions apparaîtront ici'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicArchives;