import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useState } from 'react';
import { LayoutDashboard, Package, BarChart3, LogOut, TreePine, X, Menu, UserPlus, HandCoins, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { logout, user } = useAuth();
  const location = useLocation();
  const [superUserForm, setSuperUserForm] = useState({ username: '', password: '' });
  const [superUserMessage, setSuperUserMessage] = useState('');
  const [superUserError, setSuperUserError] = useState('');
  const [isCreatingSuperuser, setIsCreatingSuperuser] = useState(false);
  const [isSuperuserOpen, setIsSuperuserOpen] = useState(false);
  const [showSuperuserPassword, setShowSuperuserPassword] = useState(false);

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/admin/products', icon: Package, label: t('nav.products') },
    { path: '/admin/stats', icon: BarChart3, label: t('nav.stats') },
    { path: '/admin/debts', icon: HandCoins, label: t('nav.debts') || 'Qarz bo\'limi' },
  ];

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const handleCreateSuperuser = async (e) => {
    e.preventDefault();
    setSuperUserError('');
    setSuperUserMessage('');
    setIsCreatingSuperuser(true);
    try {
      const result = await api.createSuperuser(superUserForm);
      setSuperUserMessage(result.message || 'Superuser yaratildi');
      setSuperUserForm({ username: '', password: '' });
    } catch (error) {
      setSuperUserError(error.message);
    } finally {
      setIsCreatingSuperuser(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        bg-gray-800 min-h-screen flex flex-col
        fixed lg:static inset-y-0 left-0 z-50
        w-64 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      {/* Logo */}
      <div className="p-4 sm:p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <TreePine className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{t('app.name')}</h1>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
            (item.path !== '/admin' && location.pathname.startsWith(item.path));
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-3 sm:p-4 border-t border-gray-700">
        {user?.is_superuser && (
          <div className="mb-4 rounded-xl bg-gray-700/40 border border-gray-600 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsSuperuserOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-white text-sm font-semibold hover:bg-gray-700/50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Superuser boshqaruvi
              </span>
              {isSuperuserOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isSuperuserOpen && (
              <form onSubmit={handleCreateSuperuser} className="p-3 pt-2 space-y-2 border-t border-gray-600/70">
                <div className="text-xs text-gray-300 leading-snug">
                  Bu bo‘lim orqali yangi superuser yaratishingiz mumkin.
                </div>

                <div>
                  <label className="block text-[11px] text-gray-300 mb-1">Login</label>
                  <input
                    type="text"
                    value={superUserForm.username}
                    onChange={(e) => setSuperUserForm({ ...superUserForm, username: e.target.value })}
                    placeholder="masalan: admin2"
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-300 mb-1">Parol</label>
                  <div className="relative">
                    <input
                      type={showSuperuserPassword ? 'text' : 'password'}
                      value={superUserForm.password}
                      onChange={(e) => setSuperUserForm({ ...superUserForm, password: e.target.value })}
                      placeholder="Kuchli parol kiriting"
                      className="w-full pr-10 px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSuperuserPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white rounded"
                      title={showSuperuserPassword ? 'Yashirish' : 'Ko‘rsatish'}
                    >
                      {showSuperuserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {superUserMessage && <p className="text-xs text-green-400">{superUserMessage}</p>}
                {superUserError && <p className="text-xs text-red-400">{superUserError}</p>}

                <button
                  type="submit"
                  disabled={isCreatingSuperuser}
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium"
                >
                  {isCreatingSuperuser ? 'Yaratilmoqda...' : 'Superuser qo‘shish'}
                </button>
              </form>
            )}
          </div>
        )}
        <div className="mb-3 sm:mb-4 px-3 sm:px-4">
          <p className="text-sm text-gray-300 truncate">{user?.username}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/20"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;

// Mobile Menu Button Component
export const MobileMenuButton = ({ onClick, isOpen }) => (
  <button
    onClick={onClick}
    className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors mr-2"
    aria-label="Toggle menu"
  >
    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
  </button>
);
