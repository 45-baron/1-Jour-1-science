import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';

function History() {
  const { t, isRTL } = useLanguage();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
    const loadHistory = async () => {
      const submissionsRef = collection(db, 'submissions');
      const q = query(submissionsRef, where('userId', '==', currentUser.uid), orderBy('quizDate', 'desc'));
      const querySnapshot = await getDocs(q);
      const historyData = [];
      querySnapshot.forEach((doc) => historyData.push({ id: doc.id, ...doc.data() }));
      setSubmissions(historyData);
    };
    loadHistory();
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-black text-(--text-main) uppercase">{t.history}</h2>
            <Link to="/" className="ios-glass px-4 py-2 rounded-full text-sm">✕</Link>
        </div>

        <div className="relative border-l-2 border-(--glass-border) ml-4 md:ml-8 pl-8 md:pl-12 space-y-12">
            {submissions.map((sub) => (
                <div key={sub.id} className="relative">
                    {/* Dot on timeline */}
                    <div className={`absolute -left-10.25 md:-left-14.75 top-6 w-5 h-5 rounded-full border-4 border-(--bg-primary) ${sub.corrected ? 'bg-(--status-success)' : 'bg-(--text-muted)'}`}></div>
                    
                    <div className="ios-card">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold">Quiz: {sub.quizDate}</h3>
                                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${sub.corrected ? 'bg-(--status-success)/20 text-(--status-success)' : 'bg-(--text-muted)/20 text-(--text-muted)'}`}>
                                    {sub.corrected ? (isRTL ? 'تم التصحيح' : 'Corrigé') : (isRTL ? 'قيد الانتظار' : 'En attente')}
                                </span>
                            </div>
                            {sub.corrected && (
                                <div className="text-right">
                                    <div className="text-3xl font-black text-(--accent)">{sub.pointsEarned}</div>
                                    <div className="text-[10px] uppercase opacity-50">Points</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default History;