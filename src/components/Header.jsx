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
        
        {/* LOGO */}
        <Link
          to="/"
          className="text-2xl font-black tracking-tighter bg-clip-text text-transparent"
          style={{ backgroundImage: 'linear-gradient(to right, #7C3AED, #2563EB)' }}
        >
          ACCUEIL
        </Link>

        {/* NAV DESKTOP */}
        <nav className="hidden md:flex gap-8 items-center">
          <Link
            to="/ranking"
            className="font-bold text-slate-600 hover:text-violet-600 transition-colors uppercase text-sm tracking-widest"
          >
            🏆 {t.ranking}
          </Link>
<Link to="/archives" className="text-gray-700 hover:text-primary-600 font-medium transition-colors text-sm flex items-center gap-1">
  📚 {isRTL ? 'الأرشيف' : 'Archives'}
</Link>
          <Link
            to="/archives"
            className="font-bold text-slate-600 hover:text-violet-600 transition-colors uppercase text-sm tracking-widest"
          >
            📚 {isRTL ? 'الأرشيف' : 'Archives'}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                to={isOrganizer ? '/organizer/dashboard' : '/search-competition'}
                className="px-6 py-2 bg-violet-600 text-white rounded-full font-bold text-sm shadow-lg hover:shadow-violet-200 hover:bg-violet-700 transition-all"
              >
                {isOrganizer ? t.dashboard : (isRTL ? 'مسابقات' : 'Explorer')}
              </Link>
              <button
                onClick={handleLogout}
                className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"
                title={t.logout}
              >
                🚪
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-6 py-2 bg-black text-white rounded-full font-bold text-sm shadow-lg hover:bg-gray-800 transition-colors"
            >
              Login
            </Link>
          )}

          {/* Bouton langue Desktop */}
          <button
            onClick={() => changeLanguage(language === 'fr' ? 'ar' : 'fr')}
            className="px-4 py-1 border border-slate-200 rounded-full text-xs font-black uppercase hover:border-violet-400 transition-colors"
          >
            {language === 'fr' ? 'العربية' : 'Français'}
          </button>
        </nav>

        {/* MOBILE DROITE : Langue + Hamburger */}
        <div className="flex md:hidden items-center gap-3">
          
          {/* Langue Mobile */}
          <button
            onClick={() => changeLanguage(language === 'fr' ? 'ar' : 'fr')}
            className="px-3 py-1 border border-slate-200 rounded-full text-xs font-black uppercase"
          >
            {language === 'fr' ? 'AR' : 'FR'}
          </button>

          {/* Hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full hover:bg-violet-50 transition-colors"
          >
            {isMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* MENU MOBILE DÉROULANT */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 px-6 py-4">
          <nav className="flex flex-col gap-2">

            <Link
              to="/ranking"
              className="p-3 hover:bg-violet-50 rounded-xl transition-colors font-bold text-slate-700 text-sm uppercase tracking-widest flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              🏆 {t.ranking}
            </Link>
<Link 
  to="/archives" 
  className="p-3 hover:bg-primary-50 rounded-xl transition-colors font-medium flex items-center gap-2"
  onClick={() => setIsMenuOpen(false)}
>
  📚 {isRTL ? 'الأرشيف' : 'Archives'}
</Link>
            <Link
              to="/archives"
              className="p-3 hover:bg-violet-50 rounded-xl transition-colors font-bold text-slate-700 text-sm uppercase tracking-widest flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              📚 {isRTL ? 'الأرشيف' : 'Archives'}
            </Link>

            <div className="border-t border-slate-100 pt-3 mt-1">
              {isAuthenticated && userData ? (
                <div className="flex flex-col gap-2">
                  
                  {/* Pseudo utilisateur */}
                  <div
                    className="p-3 rounded-xl flex items-center gap-3 text-white"
                    style={{ backgroundImage: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
                  >
                    <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center font-black text-sm">
                      {userData.pseudo?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs opacity-80">
                        {isRTL ? 'اسمك المستعار' : 'Pseudo'}
                      </div>
                      <div className="font-black text-sm">{userData.pseudo}</div>
                    </div>
                  </div>

                  {/* Explorer / Dashboard */}
                  <Link
                    to={isOrganizer ? '/organizer/dashboard' : '/search-competition'}
                    className="p-3 bg-violet-600 text-white rounded-xl font-bold text-sm text-center hover:bg-violet-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {isOrganizer ? `📊 ${t.dashboard}` : `🎮 ${isRTL ? 'مسابقات' : 'Explorer'}`}
                  </Link>

                  {/* Déconnexion */}
                  <button
                    onClick={handleLogout}
                    className="p-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                  >
                    🚪 {t.logout}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    className="p-3 bg-black text-white rounded-xl font-bold text-sm text-center hover:bg-gray-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    🔐 Login
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;

