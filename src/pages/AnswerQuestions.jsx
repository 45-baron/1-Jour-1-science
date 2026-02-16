import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { submitAnswers } from '../services/competitionService';

function AnswerQuestions() {
  const { sessionId } = useParams();
  const { t, isRTL } = useLanguage();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
    const loadSession = async () => {
      const sessionRef = doc(db, 'questionSessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);
      if (sessionSnap.exists()) setSession(sessionSnap.data());
    };
    loadSession();
  }, [currentUser, sessionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await submitAnswers(sessionId, currentUser.uid, answers);
    navigate('/');
  };

  if (!session) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-3xl font-black mb-8 text-center text-(--text-main)">Session {session.date}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {session.questions.map((q, index) => (
           // Dans la boucle map des questions de AnswerQuestions.jsx
<div key={q.id} className="ios-glass p-6 mb-4">
  <label className="block font-bold mb-2">{q.text} ({q.points} pts)</label>
  <textarea
    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
    className="w-full p-4 rounded-2xl bg-white border-2 border-gray-100 focus:border-primary-500"
    placeholder="Votre réponse (caractères illimités)..."
    rows="4"
    required
  />
</div>
          ))}

          <button type="submit" disabled={submitting} className="ios-btn w-full mt-8">
            {submitting ? '...' : (isRTL ? 'إرسال' : 'Envoyer les réponses')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AnswerQuestions;