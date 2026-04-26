import { useTranslation } from '../hooks/useTranslation';
import { Globe, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const LanguageSelector = ({ variant = 'dropdown' }) => {
  const { language, setLanguage, languages, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  const currentLang = languages.find(l => l.code === language);

  if (variant === 'buttons') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-1 shadow-inner">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 ease-out ${
                language === lang.code
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md scale-105'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="hidden sm:inline">{lang.code === 'uz' ? 'Lotin' : 'Кирил'}</span>
              <span className="sm:hidden">{lang.code === 'uz' ? 'Lat' : 'Кир'}</span>
              {language === lang.code && (
                <span className="absolute inset-0 rounded-lg ring-2 ring-blue-500/20 dark:ring-blue-400/20" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 shadow-sm hover:shadow-md group"
      >
        <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
          <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <span className="hidden sm:inline">{currentLang?.name}</span>
        <span className="sm:hidden">{language === 'uz' ? 'Lat' : 'Кир'}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-fade-in">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${
                language === lang.code
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <span>{lang.name}</span>
              {language === lang.code && (
                <Check className="w-4 h-4" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
