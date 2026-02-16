import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getTodayQuiz, hasUserSubmittedToday, submitQuizAnswers } from '../services/quizService';

function QuizOfTheDay() {
  const { t, isRTL } = useLanguage();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
    loadQuiz();
  }, [currentUser]);

  const loadQuiz = async () => {
    const check = await hasUserSubmittedToday(currentUser.uid);
    if (check.hasSubmitted) { navigate('/history'); return; }
    const result = await getTodayQuiz();
    if (result.success) setQuestions(result.questions);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await submitQuizAnswers(currentUser.uid, answers);
    if (result.success) navigate('/history');
    setSubmitting(false);
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-black text-zinc-200">CHARGEMENT...</div>;

  return (
    <div className="min-h-screen bg-[#F2F2F7] py-12 px-6">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <header className="text-center mb-12">
          <span className="text-orange-500 font-black tracking-widest uppercase text-xs">Session du jour</span>
          <h2 className="text-4xl font-black text-black uppercase tracking-tighter mt-2 italic">Questions</h2>
        </header>

        <div className="space-y-8">
          {questions.map((q, index) => (
            <div key={q.id} className="ios-glass bg-white p-8 border-none shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <span className="text-4xl font-black text-zinc-100">0{index + 1}</span>
                <span className="bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">{q.points} PTS</span>
              </div>
              <h3 className="text-xl font-bold text-black mb-6 leading-tight">{q.text}</h3>
              <textarea 
                className="ios-input bg-zinc-50! border-zinc-100! text-black! font-normal! min-h-30 focus:bg-white!"
                placeholder={isRTL ? 'إجابتك...' : 'Votre réponse...'}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                required
              />
            </div>
          ))}
        </div>

        <div className="mt-12">
          <button type="submit" disabled={submitting} className="ios-btn w-full bg-black! text-white! rounded-3xl! shadow-2xl py-6">
            {submitting ? '...' : (isRTL ? 'إرسال' : 'Confirmer les réponses')}
          </button>
        </div>
      </form>
    </div>
  );
}
export default QuizOfTheDay;