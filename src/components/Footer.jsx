import { useLanguage } from '../contexts/LanguageContext';

function Footer() {
  const { isRTL } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white py-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-black tracking-tighter mb-2 italic uppercase">RAMADAN QUIZ</h3>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
              {isRTL ? 'مسابقة رمضانية - تعلم واربح' : 'Quiz Ramadan - Apprendre et Gagner'}
            </p>
          </div>
          <div className="flex gap-4 text-2xl opacity-20">
            <span>✦</span><span>❋</span><span>✦</span>
          </div>
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">
            © {currentYear} - ALL RIGHTS RESERVED
          </p>
        </div>
        <div className="mt-12 h-px bg-slate-900 w-full"></div>
      </div>
    </footer>
  );
}

export default Footer;