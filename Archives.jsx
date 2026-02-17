import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../services/firebase';

function Archives() {
  const { isRTL } = useLanguage();
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    loadCompetitions();
  }, []);

  // Charge toutes les compétitions (quiz) depuis Firestore
  const loadCompetitions = async () => {
    try {
      const quizzesRef = collection(db, 'quizzes');
      const q = query(quizzesRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const competitionsData = [];
      querySnapshot.forEach((doc) => {
        competitionsData.push({ id: doc.id, ...doc.data() });
      });
      
      setCompetitions(competitionsData);
    } catch (error) {
      console.error('Erreur chargement compétitions:', error);
    }
    setLoading(false);
  };

  // Charge les questions d'une compétition spécifique
  const loadQuestions = async (competitionId) => {
    setLoadingQuestions(true);
    setSelectedCompetition(competitionId);
    
    try {
      const questionsRef = collection(db, 'quizzes', competitionId, 'questions');
      const q = query(questionsRef, orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const questionsData = [];
      querySnapshot.forEach((doc) => {
        questionsData.push({ id: doc.id, ...doc.data() });
      });
      
      setQuestions(questionsData);
    } catch (error) {
      console.error('Erreur chargement questions:', error);
      setQuestions([]);
    }
    setLoadingQuestions(false);
  };

  // Ferme le panneau des questions
  const closeQuestions = () => {
    setSelectedCompetition(null);
    setQuestions([]);
  };

  return (
    <div className="min-h-screen islamic-pattern py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        
        {/* TITRE */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-gemini rounded-3xl mb-6 shadow-glass-lg animate-float">
            <span className="text-5xl">📚</span>
          </div>
          <h1 className="text-5xl font-bold gradient-text-gemini mb-3">
            {isRTL ? 'أرشيف المسابقات' : 'Archives des Compétitions'}
          </h1>
          <p className="text-xl text-gray-600">
            {isRTL ? 'جميع المسابقات والأسئلة السابقة' : 'Toutes les compétitions et questions passées'}
          </p>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-gemini rounded-3xl mb-6 shadow-glass-lg animate-pulse">
              <span className="text-4xl">📚</span>
            </div>
            <p className="text-xl text-gray-700 font-semibold">
              {isRTL ? 'جاري التحميل...' : 'Chargement...'}
            </p>
          </div>
        ) : competitions.length === 0 ? (
          // AUCUNE COMPÉTITION
          <div className="card-islamic text-center py-16 animate-scale-in">
            <div className="text-8xl mb-6 opacity-50">📭</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-4">
              {isRTL ? 'لا توجد مسابقات بعد' : 'Aucune compétition pour le moment'}
            </h3>
            <p className="text-gray-600">
              {isRTL ? 'ستظهر المسابقات هنا عند إنشائها' : 'Les compétitions apparaîtront ici une fois créées'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {competitions.map((competition, index) => (
              <div key={competition.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                
                {/* CARTE COMPÉTITION */}
                <div className="card-islamic">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-linear-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {isRTL ? `مسابقة ${competition.date}` : `Compétition du ${competition.date}`}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {isRTL ? 'الموعد النهائي:' : 'Deadline:'} {competition.deadline?.toDate().toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (selectedCompetition === competition.id) {
                          closeQuestions();
                        } else {
                          loadQuestions(competition.id);
                        }
                      }}
                      className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 ${
                        selectedCompetition === competition.id
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-linear-to-r from-primary-600 to-purple-600 text-white hover:shadow-glow'
                      }`}
                    >
                      {selectedCompetition === competition.id ? (
                        <>
                          <span>✕</span>
                          {isRTL ? 'إغلاق' : 'Fermer'}
                        </>
                      ) : (
                        <>
                          <span>👁️</span>
                          {isRTL ? 'عرض الأسئلة' : 'Voir les questions'}
                        </>
                      )}
                    </button>
                  </div>

                  {/* QUESTIONS DE CETTE COMPÉTITION */}
                  {selectedCompetition === competition.id && (
                    <div className="mt-6 border-t-2 border-gray-200 pt-6 animate-slide-up">
                      {loadingQuestions ? (
                        <div className="text-center py-8">
                          <div className="animate-spin text-4xl mb-4">⏳</div>
                          <p className="text-gray-600">
                            {isRTL ? 'جاري تحميل الأسئلة...' : 'Chargement des questions...'}
                          </p>
                        </div>
                      ) : questions.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="text-6xl mb-4 opacity-50">❓</div>
                          <p className="text-gray-600">
                            {isRTL ? 'لا توجد أسئلة لهذه المسابقة' : 'Aucune question pour cette compétition'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h4 className="text-lg font-bold gradient-text mb-4">
                            {isRTL ? `${questions.length} أسئلة` : `${questions.length} question(s)`}
                          </h4>
                          
                          {questions.map((question, qIndex) => (
                            <div 
                              key={question.id} 
                              className="glass p-5 rounded-2xl animate-scale-in"
                              style={{ animationDelay: `${qIndex * 100}ms` }}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <div className="w-10 h-10 bg-linear-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shrink-0">
                                    {qIndex + 1}
                                  </div>
                                  <p className="text-gray-800 font-semibold mt-1">
                                    {question.text}
                                  </p>
                                </div>
                                <span className="bg-gradient-gold text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md whitespace-nowrap ml-4">
                                  {question.points} pts
                                </span>
                              </div>

                              {question.hint && (
                                <div className="mt-3 p-3 bg-red-50 border-2 border-red-200 rounded-xl">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">💡</span>
                                    <span className="text-sm font-semibold text-red-700">
                                      {isRTL ? 'تلميح:' : 'Indice:'} {question.hint}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RETOUR ACCUEIL */}
        <div className="text-center mt-8">
          <a 
            href="/"
            className="inline-block px-8 py-3 glass text-primary-700 rounded-2xl font-bold hover:shadow-glass-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            ← {isRTL ? 'العودة للرئيسية' : 'Retour à l\'accueil'}
          </a>
        </div>
      </div>
    </div>
  );
}

export default Archives;