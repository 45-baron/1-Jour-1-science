import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../services/authService';
import { useNavigate, Link } from 'react-router-dom';

function Header() {
  const { t, language, changeLanguage, isRTL } = useLanguage();
  const { isAuthenticated, userData, isOrganizer } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/');
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-100 shadow-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-black tracking-tighter bg-linear-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
          ACCEUIL 
        </Link>

        <nav className="hidden md:flex gap-8 items-center">
          <Link to="/ranking" className="font-bold text-slate-600 hover:text-violet-600 transition-colors uppercase text-sm tracking-widest">🏆 {t.ranking}</Link>
      <Link to="/archives" className="font-bold text-slate-600 hover:text-violet-600 transition-colors uppercase text-sm tracking-widest">
    📚 {isRTL ? 'الأرشيف' : 'Archives'}
  </Link>  
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link to={isOrganizer ? "/organizer/dashboard" : "/search-competition"} className="px-6 py-2 bg-violet-600 text-white rounded-full font-bold text-sm shadow-lg hover:shadow-violet-200 transition-all">
                {isOrganizer ? t.dashboard : (isRTL ? 'مسابقات' : 'Explorer')}
              </Link>
              <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all">🚪</button>
            </div>
          ) : (
            <Link to="/login" className="px-6 py-2 bg-black text-white rounded-full font-bold text-sm shadow-lg">Login</Link>
          )}

          <button onClick={() => changeLanguage(language === 'fr' ? 'ar' : 'fr')} className="px-4 py-1 border border-slate-200 rounded-full text-xs font-black uppercase">
            {language === 'fr' ? 'العربية' : 'Français'}
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;