import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getSessionSubmissions, correctAnswers } from '../services/competitionService';

function CorrectSubmissions() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  
  const [session, setSession] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [correcting, setCorrecting] = useState(null);

  useEffect(() => { loadData(); }, [sessionId]);

  const loadData = async () => {
    try {
      const sessionRef = doc(db, 'questionSessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);
      if (sessionSnap.exists()) setSession(sessionSnap.data());
      const result = await getSessionSubmissions(sessionId);
      if (result.success) setSubmissions(result.submissions);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-200">LOADING...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6 pattern-arabesque">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-10 rounded-[2.5rem] mb-10 flex justify-between items-center">
            <div>
                <h1 className="text-4xl font-black text-black tracking-tighter italic uppercase">{isRTL ? 'مراجعة الإجابات' : 'Révisions'}</h1>
                <p className="text-violet-600 font-bold text-xs uppercase tracking-[0.2em] mt-2">{session?.date}</p>
            </div>
            <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-sm hover:shadow-md transition-all">←</button>
        </div>

        <div className="space-y-6">
          {submissions.map((submission) => (
            <div key={submission.id} className="glass-card p-8 rounded-3xl transition-all hover:bg-white/80">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-black text-black">{submission.userPseudo}</span>
                {submission.corrected && (
                    <span className="px-4 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase italic">
                        {isRTL ? 'تم التصحيح' : 'CORRIGÉ'}
                    </span>
                )}
              </div>
              
              <div className="space-y-4">
                {submission.answers.map((answer, index) => (
                    <div key={index} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-xs font-black text-slate-400 uppercase mb-1">Question {index + 1}</p>
                        <p className="text-lg font-bold text-black mb-3">{answer.text}</p>
                        
                        {!submission.corrected ? (
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <button className="py-3 bg-white border border-red-100 text-red-500 rounded-xl font-black text-xs uppercase hover:bg-red-50 transition-all">
                                    🔴 {isRTL ? 'خاطئ' : 'FAUX'}
                                </button>
                                <button className="py-3 bg-white border border-emerald-100 text-emerald-500 rounded-xl font-black text-xs uppercase hover:bg-emerald-50 transition-all">
                                    🟢 {isRTL ? 'صحيح' : 'BON'}
                                </button>
                            </div>
                        ) : (
                            <div className="text-right font-black text-slate-300 italic">
                                {answer.points} PTS
                            </div>
                        )}
                    </div>
                ))}
              </div>

              {!submission.corrected && (
                <button className="w-full mt-8 py-5 bg-black text-white rounded-2xl font-black text-lg shadow-2xl hover:bg-slate-800 transition-all transform hover:-translate-y-1">
                  {isRTL ? 'حفظ التصحيح' : 'VALIDER LA COPIE'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CorrectSubmissions;