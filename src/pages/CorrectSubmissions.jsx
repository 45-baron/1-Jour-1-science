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
  
  // Stocke les notes en cours : { "submissionId_questionIndex": points }
  const [grades, setGrades] = useState({}); 
  const [submittingId, setSubmittingId] = useState(null); // Pour l'effet de chargement sur le bouton

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

  // Gère le clic sur Vrai/Faux
  const handleGrade = (submissionId, index, points) => {
    setGrades(prev => ({
      ...prev,
      [`${submissionId}_${index}`]: points
    }));
  };

  // Envoie la correction à Firebase
  const handleSubmitCorrection = async (submission) => {
    setSubmittingId(submission.id);
    
    // Calcul du total des points pour cette copie
    let totalPoints = 0;
    submission.answers.forEach((_, index) => {
      // Si une note existe, on l'ajoute, sinon 0
      totalPoints += (grades[`${submission.id}_${index}`] || 0);
    });

    // Appel au service (Firebase)
    const result = await correctAnswers(submission.id, totalPoints);
    
    if (result.success) {
      // On met à jour l'affichage localement sans recharger la page
      setSubmissions(prev => prev.map(sub => 
        sub.id === submission.id ? { ...sub, corrected: true, totalPoints: totalPoints } : sub
      ));
    } else {
      alert("Erreur lors de la sauvegarde !");
    }
    setSubmittingId(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-200">LOADING...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6 pattern-arabesque">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="glass-card p-10 rounded-[2.5rem] mb-10 flex justify-between items-center bg-white shadow-xl">
            <div>
                <h1 className="text-4xl font-black text-black tracking-tighter italic uppercase">
                  {isRTL ? 'مراجعة الإجابات' : 'Révisions'}
                </h1>
                <p className="text-violet-600 font-bold text-xs uppercase tracking-[0.2em] mt-2">
                  SESSION: {session?.date}
                </p>
            </div>
            <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center bg-zinc-100 rounded-full hover:bg-zinc-200 transition-all font-bold">
              ←
            </button>
        </div>

        {/* LISTE DES COPIES */}
        <div className="space-y-6">
          {submissions.map((submission) => (
            <div key={submission.id} className={`p-8 rounded-3xl transition-all border-2 ${submission.corrected ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-white shadow-lg'}`}>
              
              {/* En-tête de la copie */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-black text-black">
  👤 {submission.user?.fullName || submission.user?.pseudo || 'Anonyme'}
</span>
                {submission.corrected ? (
                    <div className="text-right">
                        <span className="block text-2xl font-black text-emerald-600">{submission.totalPoints} PTS</span>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Note finale</span>
                    </div>
                ) : (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-black rounded-full uppercase">
                        EN ATTENTE
                    </span>
                )}
              </div>
              
              {/* Les réponses */}
              <div className="space-y-4">
                {submission.answers.map((answer, index) => {
                    // Vérifie si ce bouton est sélectionné
                    const currentGrade = grades[`${submission.id}_${index}`];
                    const isCorrect = currentGrade > 0;
                    const isWrong = currentGrade === 0;

                    return (
                        <div key={index} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex justify-between mb-2">
                                <p className="text-xs font-black text-slate-400 uppercase">Question {index + 1}</p>
                                <span className="text-xs font-bold text-slate-300">10 PTS MAX</span>
                            </div>
                            
                            <p className="text-lg font-bold text-black mb-4 leading-relaxed">
                                {answer.text || <span className="text-gray-300 italic">(Pas de réponse)</span>}
                            </p>
                            
                            {!submission.corrected ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {/* BOUTON FAUX (0 pts) */}
                                    <button 
                                        onClick={() => handleGrade(submission.id, index, 0)}
                                        className={`py-3 rounded-xl font-black text-xs uppercase transition-all duration-200 ${
                                            isWrong 
                                            ? 'bg-red-500 text-white shadow-lg scale-[1.02]' 
                                            : 'bg-white border border-red-100 text-red-400 hover:bg-red-50'
                                        }`}
                                    >
                                        🔴 {isRTL ? 'خاطئ' : 'FAUX (0)'}
                                    </button>

                                    {/* BOUTON VRAI (10 pts) */}
                                    <button 
                                        onClick={() => handleGrade(submission.id, index, 10)}
                                        className={`py-3 rounded-xl font-black text-xs uppercase transition-all duration-200 ${
                                            isCorrect 
                                            ? 'bg-emerald-500 text-white shadow-lg scale-[1.02]' 
                                            : 'bg-white border border-emerald-100 text-emerald-400 hover:bg-emerald-50'
                                        }`}
                                    >
                                        🟢 {isRTL ? 'صحيح' : 'BON (10)'}
                                    </button>
                                </div>
                            ) : (
                                // Affichage une fois corrigé (non modifiable)
                                <div className="pt-2 border-t border-slate-200 text-right">
                                    <span className={`font-black ${answer.points > 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                                        {answer.points || 0} PTS
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
              </div>

              {/* Bouton de validation global */}
              {!submission.corrected && (
                <button 
                    onClick={() => handleSubmitCorrection(submission)}
                    disabled={submittingId === submission.id}
                    className="w-full mt-8 py-5 bg-black text-white rounded-2xl font-black text-lg shadow-xl hover:bg-gray-900 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingId === submission.id 
                    ? 'ENVOI EN COURS...' 
                    : (isRTL ? 'حفظ التصحيح' : 'VALIDER LA NOTE DEFINITIVE')}
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

