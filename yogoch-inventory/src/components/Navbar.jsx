import { useTranslation } from '../hooks/useTranslation';
import LanguageSelector from './LanguageSelector';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { LogOut, User, Home, Sun, Moon } from 'lucide-react';

const Navbar = ({ children }) => {
  const { t } = useTranslation();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-10">
      <div className="flex items-center">
        {children}
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          {t('dashboard.title')}
        </h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <LanguageSelector />

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-1.5 sm:p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title={theme === 'light' ? 'Tun rejimi' : 'Kun rejimi'}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>

        <Link
          to="/"
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors"
          title="Bosh sahifa"
        >
          <Home className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline text-sm font-medium">Bosh sahifa</span>
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-200">
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className="font-medium hidden md:inline">{user?.username}</span>
          </div>
          
          <button
            onClick={logout}
            className="p-1.5 sm:p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title={t('nav.logout')}
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
