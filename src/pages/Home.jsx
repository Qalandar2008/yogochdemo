import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { useSmartRefresh } from '../hooks/useSmartRefresh';
import { Link } from 'react-router-dom';
import StatsBox from '../components/StatsBox';
import Card from '../components/Card';
import LanguageSelector from '../components/LanguageSelector';
import api from '../services/api';
import {
  Package, Ruler, Boxes,
  BarChart3, Scale, ShoppingCart, TrendingUp,
  TreePine, Lock, LogIn, Sun, Moon, RefreshCw,
  Archive, PieChart, TrendingDown
} from 'lucide-react';

const Home = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [statsData, productsData] = await Promise.all([
        api.getStats(),
        api.getProducts()
      ]);
      setStats(statsData);
      setProducts(productsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Smart auto-refresh: time-based + event-based
  useSmartRefresh(loadData, { 
    interval: 30000,
    enabled: true, 
    onVisibilityChange: true, 
    onFocus: true,
    immediate: false
  });

  useEffect(() => {
    loadData();
  }, [loadData]);

  const statsConfig = [
    { key: 'totalProducts', title: t('stats.totalProducts'), icon: Package, color: 'blue' },
    { key: 'totalQuantity', title: t('stats.quantityInStock'), icon: Boxes, color: 'gray' },
    { key: 'totalVolume', title: t('stats.totalVolume'), icon: Scale, color: 'blue', unit: 'm³' },
    { key: 'totalSoldQuantity', title: t('stats.soldQuantity'), icon: ShoppingCart, color: 'gray' },
    { key: 'totalSoldVolume', title: t('stats.soldVolume'), icon: BarChart3, color: 'blue', unit: 'm³' },
    { key: 'totalProfit', title: t('stats.profit'), icon: TrendingUp, color: 'blue', unit: 'so\'m' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg sm:rounded-xl">
              <TreePine className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 dark:text-gray-100">{t('app.name')}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Refresh Button */}
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-1.5 sm:p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              title="Ma'lumotlarni yangilash"
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

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
              to="/login"
              className="flex items-center gap-1.5 sm:gap-2 bg-blue-600 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">{t('home.loginButton')}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Hero Section */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2 sm:mb-4">
            {t('home.title')}
          </h2>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 px-2">
            {t('home.subtitle')}
          </p>

          {/* Preview Mode Banner */}
          <div className="inline-flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 mb-4 sm:mb-8 mx-2">
            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div className="text-center sm:text-left">
              <p className="font-semibold text-blue-800 dark:text-blue-300 text-sm sm:text-base">{t('home.previewMode')}</p>
              <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">{t('home.previewDescription')}</p>
            </div>
          </div>

        </div>

        {/* Stats Grid - 8 Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {statsConfig.map((stat) => (
            <StatsBox
              key={stat.key}
              title={stat.title}
              value={stats?.[stat.key] || 0}
              unit={stat.unit || ''}
              icon={stat.icon}
              color={stat.color}
              isLoading={isLoading}
            />
          ))}
        </div>

        {/* Product Sizes Section */}
        <Card title={t('stats.productSizes')} icon={Ruler} className="mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium">
                    {t('products.name')}
                  </th>
                  <th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium">
                    {t('stats.length')} (m)
                  </th>
                  <th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium">
                    {t('stats.width')} (m)
                  </th>
                  <th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium">
                    {t('stats.height')} (m)
                  </th>
                  <th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium">
                    {t('stats.volume')} (m³)
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="py-8">
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    product.sizes.map((size, idx) => (
                      <tr key={`${product.id}-${idx}`} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 text-gray-800 dark:text-gray-200 font-medium">{product.name}</td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">{size.length}</td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">{size.width}</td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">{size.height}</td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">{size.volume.toFixed(4)}</td>
                      </tr>
                    ))
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-400 dark:text-gray-500">
                      {t('products.noProducts')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Volume Tracking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card title={t('stats.volumeTracking')} icon={BarChart3}>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">{t('stats.total')}</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {isLoading ? <span className="inline-block h-5 w-16 skeleton rounded"></span> : `${stats?.totalVolume?.toFixed(2) || 0} m³`}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">{t('stats.sold')}</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {isLoading ? <span className="inline-block h-5 w-16 skeleton rounded"></span> : `${stats?.totalSoldVolume?.toFixed(2) || 0} m³`}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 dark:text-gray-400">{t('stats.available')}</span>
                <span className="font-semibold text-blue-500 dark:text-blue-400">
                  {isLoading ? <span className="inline-block h-5 w-16 skeleton rounded"></span> : `${(stats?.totalVolume - stats?.totalSoldVolume)?.toFixed(2) || 0} m³`}
                </span>
              </div>
            </div>
          </Card>

          {/* Profit Card - Highlighted */}
          <div className="card-wood p-6 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6" />
              <h3 className="text-lg font-semibold">{t('stats.profit')}</h3>
            </div>
            <p className="text-3xl font-bold">
              {isLoading ? <span className="inline-block h-8 w-32 bg-white/20 rounded animate-pulse"></span> : `${stats?.totalProfit?.toLocaleString() || 0} so'm`}
            </p>
            <p className="text-blue-100 text-sm mt-2">{t('home.previewMode')}</p>
          </div>
        </div>

        {/* Extra Summary Cards (same indicators as Admin/Stats) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mt-6">
          <Card title="Ombor holati" icon={Archive}>
            {isLoading ? (
              <div className="h-28 skeleton rounded-xl"></div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Jami mahsulotlar</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{stats?.totalProducts || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Ombordagi dona</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{stats?.totalQuantity || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Sotilgan dona</span>
                  <span className="font-semibold text-gray-500 dark:text-gray-500">{stats?.totalSoldQuantity || 0}</span>
                </div>
              </div>
            )}
          </Card>

          <Card title="Hajm tahlili" icon={PieChart}>
            {isLoading ? (
              <div className="h-28 skeleton rounded-xl"></div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Jami hajm</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{stats?.totalVolume?.toFixed(2) || 0} m³</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Sotilgan hajm</span>
                  <span className="font-semibold text-gray-500 dark:text-gray-500">{stats?.totalSoldVolume?.toFixed(2) || 0} m³</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Qolgan hajm</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {(stats?.totalVolume - stats?.totalSoldVolume)?.toFixed(2) || 0} m³
                  </span>
                </div>
              </div>
            )}
          </Card>

          <Card title="Moliyaviy ko'rsatkichlar" icon={TrendingDown}>
            {isLoading ? (
              <div className="h-28 skeleton rounded-xl"></div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Sotishdan daromad</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {stats?.totalRevenue?.toLocaleString() || 0} so'm
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Sof foyda</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    +{stats?.totalProfit?.toLocaleString() || 0} so'm
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Ombor qiymati</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {stats?.totalInventoryValue?.toLocaleString() || 0} so'm
                  </span>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-16 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400 dark:text-gray-500">
          © 2025 {t('app.name')}. {t('app.tagline')}
        </div>
      </footer>
    </div>
  );
};

export default Home;
