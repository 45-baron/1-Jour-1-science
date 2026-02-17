import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

function Home() {
  const { t, isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden pattern-arabesque">
      <div className="container mx-auto px-6 grow flex flex-col justify-center items-center text-center z-10 py-20">
        <div className="w-24 h-1 bg-black mb-12 rounded-full opacity-10"></div>

        {/* TITRE : Taille adaptée mobile (4xl) -> PC (8xl) */}
        <h2 className="text-5xl md:text-7xl lg:text-9xl font-black text-black tracking-tighter mb-4 uppercase italic leading-none">
          {t.welcome}
        </h2>
        
       <p className="text-base md:text-xl text-zinc-400 max-w-xl mx-auto mb-10 font-medium leading-relaxed px-2">
          {t.welcomeMessage}
        </p>

        <div className="flex flex-col md:flex-row gap-8 w-full max-w-xl">
          <Link to="/search-competition" className="w-full py-6 bg-black text-white rounded-full text-xl font-bold shadow-2xl hover:bg-slate-800 transition-all duration-500 transform hover:-translate-y-2">
             {isRTL ? 'العب الآن' : 'Commencer'}
          </Link>
          <Link to="/ranking" className="w-full py-6 bg-white border border-slate-200 text-black rounded-full text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
             {t.viewRanking}
          </Link>
        </div>
      <Link 
  to="/archives" 
  className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-slate-100 text-slate-700 rounded-full font-bold hover:bg-slate-200 transition-all"
>
  📚 {isRTL ? 'الأرشيف' : 'Archives des Questions'}
</Link>
      </div>

      <div className="w-full py-16 border-t border-slate-100 bg-white/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { n: '01', t: isRTL ? 'سجل رقمك' : 'ID Unique' },
            { n: '02', t: isRTL ? 'أجب يومياً' : 'Quiz Quotidien' },
            { n: '03', t: isRTL ? 'اربح الجوائز' : 'Récompenses' }
          ].map((item) => (
            <div key={item.n} className="flex flex-col items-center">
              <span className="text-5xl font-black text-slate-100 mb-2">{item.n}</span>
              <span className="text-sm font-bold uppercase tracking-widest text-slate-400">{item.t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
 
