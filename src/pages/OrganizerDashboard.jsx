import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';

function OrganizerDashboard() {
  const { t, isRTL } = useLanguage();
  const { userData, currentUser } = useAuth();
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCompetitions(); }, []);

  const loadCompetitions = async () => {
    const q = query(collection(db, 'competitions'), where('organizerId', '==', currentUser.uid));
    const snap = await getDocs(q);
    setCompetitions(snap.docs.map(d => ({id: d.id, ...d.data()})));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div>
            <h1 className="text-6xl font-black text-black tracking-tighter italic uppercase leading-none mb-4">Dashboard</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Hello, {userData?.fullName}</p>
          </div>
          <Link to="/organizer/create-competition" className="px-10 py-5 bg-violet-600 text-white rounded-full font-black shadow-2xl hover:shadow-violet-200 transition-all transform hover:-translate-y-1">
             NOUVELLE COMPÉTITION +
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {competitions.map((comp) => (
            <div key={comp.id} className="glass-card p-10 rounded-[2.5rem] group hover:bg-white transition-all">
              <h3 className="text-3xl font-black text-black mb-4 group-hover:text-violet-600 transition-colors">{comp.name}</h3>
              <div className="flex gap-4 mt-8">
                <Link to={`/organizer/competition/${comp.id}/create-session`} className="px-6 py-3 bg-slate-100 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-violet-50">Ajouter Questions</Link>
                <Link to={`/organizer/competition/${comp.id}`} className="px-6 py-3 bg-black text-white rounded-2xl font-bold text-xs uppercase tracking-widest">Voir Détails</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrganizerDashboard;