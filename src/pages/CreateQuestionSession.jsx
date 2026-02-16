import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { createQuestionSession, addQuestionToSession } from '../services/competitionService';

function CreateQuestionSession() {
  const { competitionId } = useParams();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  
  const [deadline, setDeadline] = useState('');
  const [questions, setQuestions] = useState([{ text: '', points: 10 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addQuestion = () => {
    setQuestions([...questions, { text: '', points: 10 }]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deadline) {
      alert(isRTL ? "يرجى اختيار موعد نهائي" : "Veuillez choisir un délai");
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Créer la session
      const sessionResult = await createQuestionSession(competitionId, deadline);
      
      if (!sessionResult.success) {
        setError(sessionResult.error);
        setLoading(false);
        return;
      }

      // Ajouter toutes les questions
      for (const question of questions) {
        await addQuestionToSession(sessionResult.sessionId, question);
      }

      alert(isRTL 
        ? `تم النشر! الرابط: ${sessionResult.link}` 
        : `Publié ! Lien: ${sessionResult.link}`
      );
      
      navigate('/organizer/dashboard');
    } catch (err) {
      setError(err.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen islamic-pattern p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        
        <div className="card-islamic mb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold gradient-text-gemini">
              {isRTL ? 'إنشاء جلسة أسئلة' : 'Créer une Session de Questions'}
            </h1>
            <button 
              onClick={() => navigate(-1)} 
              className="px-4 py-2 glass text-gray-700 rounded-xl font-semibold hover:shadow-glass-lg transition-all"
            >
              {isRTL ? 'إلغاء' : 'Annuler'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Délai */}
            <div className="glass p-6 rounded-3xl">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {isRTL ? 'الموعد النهائي للإجابات' : 'Délai de réponse (Date et Heure)'}
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all duration-300 outline-none"
                required
              />
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold gradient-text">
                  {isRTL ? 'الأسئلة' : 'Questions'} ({questions.length})
                </h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="px-6 py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <span className="text-xl">➕</span>
                  {isRTL ? 'إضافة سؤال' : 'Ajouter question'}
                </button>
              </div>

              {questions.map((q, index) => (
                <div key={index} className="glass p-6 rounded-3xl animate-scale-in">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-3xl font-bold text-primary-600 opacity-40">
                      #{index + 1}
                    </span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
                      >
                        {isRTL ? 'حذف' : 'Supprimer'}
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <textarea
                      value={q.text}
                      onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                      placeholder={isRTL ? 'اكتب سؤالك هنا...' : 'Écrivez votre question ici...'}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 resize-none transition-all duration-300 outline-none"
                      rows="4"
                      required
                    />
                    
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-bold text-gray-600">
                        {isRTL ? 'النقاط:' : 'Points accordés:'}
                      </label>
                      <input
                        type="number"
                        value={q.points}
                        onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
                        className="w-24 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-center font-bold focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all duration-300 outline-none"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bouton Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-linear-to-r from-primary-600 via-purple-600 to-pink-600 text-white rounded-3xl text-xl font-bold shadow-glass-lg hover:shadow-glow disabled:opacity-50 transition-all duration-300 transform hover:-translate-y-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  {isRTL ? 'جاري النشر...' : 'Publication...'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>🚀</span>
                  {isRTL ? 'نشر الجلسة' : 'Publier la Session'}
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateQuestionSession;