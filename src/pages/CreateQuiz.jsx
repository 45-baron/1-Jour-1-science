import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getQuizSubmissions, correctAnswer, updateTotalPointsAfterCorrection } from '../services/quizService';
import { getUser } from '../services/userService';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

function CorrectQuiz() {
  const { quizDate } = useParams();
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizData();
  }, [quizDate]);

  const loadQuizData = async () => {
    try {
      const quizRef = doc(db, 'quizzes', quizDate);
      const quizSnap = await getDoc(quizRef);
      
      if (quizSnap.exists()) {
        setQuiz({ id: quizSnap.id, ...quizSnap.data() });
        
        const questionsRef = collection(db, 'quizzes', quizDate, 'questions');
        const questionsSnap = await getDocs(questionsRef);
        const questionsData = [];
        questionsSnap.forEach((doc) => {
          questionsData.push({ id: doc.id, ...doc.data() });
        });
        setQuestions(questionsData);
      }
      
      const submissionsResult = await getQuizSubmissions(quizDate);
      if (submissionsResult.success) {
        const enrichedSubmissions = await Promise.all(
          submissionsResult.submissions.map(async (sub) => {
            const userResult = await getUser(sub.userId);
            return {
              ...sub,
              userInfo: userResult.success ? userResult.user : null
            };
          })
        );
        setSubmissions(enrichedSubmissions);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
    setLoading(false);
  };

  const handleCorrect = async (submissionId, answerId, questionPoints, isCorrect, userId) => {
    const result = await correctAnswer(submissionId, answerId, isCorrect, questionPoints);
    if (result.success) {
      await updateTotalPointsAfterCorrection(userId);
      loadQuizData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen islamic-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-gemini rounded-3xl mb-6 shadow-lg animate-pulse">
            <span className="text-4xl">✓</span>
          </div>
          <p className="text-xl text-gray-700 font-semibold">
            {isRTL ? 'جاري التحميل...' : 'Chargement...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen islamic-pattern py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        
        <div className="card-islamic mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-gemini rounded-3xl flex items-center justify-center shadow-lg">
                <span className="text-4xl">✓</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold gradient-text-gemini">
                  {isRTL ? `تصحيح مسابقة ${quizDate}` : `Correction du quiz ${quizDate}`}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isRTL ? `عدد المشاركين: ${submissions.length}` : `${submissions.length} participant(s)`}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/organizer/dashboard')}
              className="px-6 py-3 glass text-primary-700 rounded-2xl font-bold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <span>←</span>
              {isRTL ? 'العودة' : 'Retour'}
            </button>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="card-islamic text-center py-16 animate-scale-in">
            <div className="text-8xl mb-6 opacity-50">📭</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-4">
              {isRTL ? 'لا توجد مشاركات بعد' : 'Aucune soumission'}
            </h3>
            <p className="text-gray-600">
              {isRTL ? 'سيظهر المشاركون هنا عند إرسال إجاباتهم' : 'Les participants apparaîtront ici une fois leurs réponses soumises'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission, subIndex) => (
              <div key={submission.id} className="card-islamic animate-slide-up" style={{ animationDelay: `${subIndex * 100}ms` }}>
                <div className="flex justify-between items-center mb-6 pb-6 border-b-2 border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-linear-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {submission.userInfo?.pseudo?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {submission.userInfo?.fullName || 'Utilisateur'}
                      </h2>
                      <p className="text-gray-600">
                        Pseudo: <span className="font-semibold text-primary-700">{submission.userInfo?.pseudo || 'N/A'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-4 py-2 rounded-full font-bold ${
                      submission.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {submission.status === 'pending' ? (
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                          {t.pending}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <span>✓</span>
                          {isRTL ? 'تم التصحيح' : 'Corrigé'}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  {submission.answers.map((answer, index) => {
                    const question = questions.find(q => q.id === answer.questionId);
                    
                    return (
                      <div key={answer.id} className="glass p-6 rounded-3xl">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-start gap-3 flex-1">
                            {/* CHANGEMENT ICI : shrink-0 au lieu de flex-shrink-0 */}
                            <div className="w-10 h-10 bg-linear-to-br from-primary-500 to-purple-600 rounded-xl shrink-0 flex items-center justify-center text-white font-bold shadow-lg">
                              {index + 1}
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">
                              {question?.text || 'Question non trouvée'}
                            </h3>
                          </div>
                          <span className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg whitespace-nowrap ml-4">
                            {question?.points || 0} pts
                          </span>
                        </div>

                        <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-2xl mb-4">
                          <div className="text-sm text-gray-600 mb-1 font-semibold">
                            {isRTL ? 'الإجابة:' : 'Réponse:'}
                          </div>
                          <p className="text-gray-900 font-medium">{answer.answer}</p>
                        </div>

                        {answer.isCorrect === null ? (
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleCorrect(submission.id, answer.id, question.points, true, submission.userId)}
                              className="flex-1 py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:shadow-lg font-bold transition-all duration-300 flex items-center justify-center gap-2"
                            >
                              <span className="text-xl">✓</span>
                              {isRTL ? 'صحيح' : 'BON'}
                            </button>
                            <button
                              onClick={() => handleCorrect(submission.id, answer.id, question.points, false, submission.userId)}
                              className="flex-1 py-3 bg-linear-to-r from-red-500 to-pink-600 text-white rounded-2xl hover:shadow-lg font-bold transition-all duration-300 flex items-center justify-center gap-2"
                            >
                              <span className="text-xl">✕</span>
                              {isRTL ? 'خاطئ' : 'FAUX'}
                            </button>
                          </div>
                        ) : (
                          <div className={`text-center py-4 rounded-2xl font-bold text-lg ${
                            answer.isCorrect 
                              ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                              : 'bg-red-100 text-red-800 border-2 border-red-300'
                          }`}>
                            {answer.isCorrect 
                              ? `✓ ${isRTL ? 'صحيح' : 'BON'} (+${answer.points} pts)` 
                              : `✕ ${isRTL ? 'خاطئ' : 'FAUX'} (0 pts)`
                            }
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            to="/organizer/dashboard"
            className="inline-block px-8 py-3 glass text-primary-700 rounded-2xl font-bold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            ← {isRTL ? 'العودة إلى لوحة التحكم' : 'Retour au dashboard'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CorrectQuiz;