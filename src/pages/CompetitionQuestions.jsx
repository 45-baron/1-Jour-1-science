import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { submitAnswers } from '../services/competitionService';

function CompetitionQuestions() {
  const { competitionId } = useParams();
  const { t, isRTL } = useLanguage();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [competition, setCompetition] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadCompetitionData(); }, [competitionId]);

  const loadCompetitionData = async () => {
    try {
      const competitionRef = doc(db, 'competitions', competitionId);
      const competitionSnap = await getDoc(competitionRef);
      if (competitionSnap.exists()) setCompetition(competitionSnap.data());
      const sessionsRef = collection(db, 'questionSessions');
      const q = query(sessionsRef, where('competitionId', '==', competitionId), orderBy('date', 'desc'));
      const sessionsSnap = await getDocs(q);
      if (!sessionsSnap.empty) {
        const data = sessionsSnap.docs[0].data();
        data.id = sessionsSnap.docs[0].id;
        setCurrentSession(data);
        const initial = {}; data.questions.forEach((q, i) => initial[q.id || i] = '');
        setAnswers(initial);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    const answersArray = Object.keys(answers).map((id, i) => ({ questionId: id, text: answers[id], points: currentSession.questions[i].points }));
    const res = await submitAnswers(currentSession.id, currentUser.uid, answersArray);
    if (res.success) navigate('/');
    setSubmitting(false);
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-black">CHARGEMENT...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6 pattern-arabesque">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card p-10 rounded-[2.5rem] mb-12 border-l-8 border-l-emerald-500">
          <h1 className="text-4xl font-black text-black tracking-tighter uppercase italic mb-2">{competition?.name}</h1>
          <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Session du {currentSession?.date}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {currentSession?.questions.map((q, i) => (
            <div key={i} className="glass-card p-8 rounded-3xl transition-all hover:translate-x-2">
              <label className="block text-xl font-bold text-black mb-6 gap-4">
                <span className="text-emerald-500">Q{i+1}.</span> {q.text}
              </label>
              <textarea
                value={answers[q.id || i]}
                onChange={(e) => setAnswers({...answers, [q.id || i]: e.target.value})}
                className="w-full p-6 ios-input h-32 text-lg font-medium bg-white"
                placeholder="..."
                required
              />
            </div>
          ))}
          <button type="submit" disabled={submitting} className="w-full py-6 bg-emerald-600 text-white rounded-full text-xl font-black shadow-2xl hover:bg-emerald-700 transition-all transform hover:-translate-y-2">
            {submitting ? 'ENVOI...' : 'SOUMETTRE MES RÉPONSES'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CompetitionQuestions;
