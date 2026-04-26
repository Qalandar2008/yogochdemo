import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useSmartRefresh } from '../../hooks/useSmartRefresh';
import StatsBox from '../../components/StatsBox';
import Card from '../../components/Card';
import DataTable from '../../components/DataTable';
import api from '../../services/api';
import { 
  Package, Boxes, 
  BarChart3, Scale, ShoppingCart, TrendingUp, TrendingDown,
  Layers, Ruler, Download
} from 'lucide-react';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      await api.exportExcel();
    } catch (err) {
      setError(`Hisobot yuklashda xatolik: ${err.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const loadData = useCallback(async () => {
    console.log('[AdminDashboard] Loading data...');
    try {
      setIsLoading(true);
      setError(null);
      const [statsData, productsData] = await Promise.all([
        api.getStats(),
        api.getProducts()
      ]);
      console.log('[AdminDashboard] Stats loaded:', statsData);
      console.log('[AdminDashboard] Products loaded:', productsData);
      setStats(statsData);
      setProducts(productsData);
    } catch (err) {
      console.error('[AdminDashboard] Error loading data:', err);
      setError('Ma\'lumotlarni yuklashda xatolik: ' + err.message);
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

  const sizeColumns = [
    { key: 'name', label: t('products.name') },
    { 
      key: 'sizes', 
      label: `${t('stats.length')} × ${t('stats.width')} × ${t('stats.height')}`,
      render: (sizes) => sizes?.map(s => `${s.length}×${s.width}×${s.height}m`).join(', ') || '-'
    },
    { 
      key: 'sizes', 
      label: t('stats.volume'),
      render: (sizes) => sizes?.reduce((acc, s) => acc + s.volume, 0).toFixed(4) + ' m³' || '-'
    },
    { key: 'quantity', label: t('products.quantity') },
    { 
      key: 'purchasePrice', 
      label: t('products.price'),
      render: (price) => price.toLocaleString() + " so'm"
    },
  ];

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{t('dashboard.overview')}</h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{t('dashboard.welcome')}</p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="w-full sm:w-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <button
          onClick={handleDownloadReport}
          disabled={isDownloading || isLoading}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
        >
          <Download className="w-4 h-4 sm:w-5 sm:h-5" />
          {isDownloading ? t('common.downloading') : t('common.downloadReport')}
        </button>
      </div>

      {/* Stats Grid - 8 Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
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

      {/* Volume Tracking Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <Card title={t('stats.totalVolume')} icon={Scale} className="bg-blue-50 dark:bg-blue-900/20">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {isLoading ? (
              <div className="h-9 w-32 skeleton rounded"></div>
            ) : (
              `${stats?.totalVolume?.toFixed(2) || 0} m³`
            )}
          </div>
          <p className="text-sm text-blue-500 dark:text-blue-400 mt-1">{t('stats.available')}</p>
        </Card>

        <Card title={t('stats.soldVolume')} icon={TrendingDown} className="bg-gray-50 dark:bg-gray-800">
          <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
            {isLoading ? (
              <div className="h-9 w-32 skeleton rounded"></div>
            ) : (
              `${stats?.totalSoldVolume?.toFixed(2) || 0} m³`
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('stats.sold')}</p>
        </Card>

        <Card title={t('stats.productSizes')} icon={Layers} className="bg-blue-50 dark:bg-blue-900/20">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {isLoading ? (
              <div className="h-9 w-32 skeleton rounded"></div>
            ) : (
              stats?.totalProducts || 0
            )}
          </div>
          <p className="text-sm text-blue-500 dark:text-blue-400 mt-1">{t('stats.total')}</p>
        </Card>
      </div>

      {/* Products with Sizes Table */}
      <Card title={t('stats.productSizes')} icon={Ruler}>
        <DataTable
          columns={sizeColumns}
          data={products}
          isLoading={isLoading}
          searchPlaceholder={t('products.search')}
          emptyMessage={t('products.noProducts')}
        />
      </Card>

      {/* Profit Highlight Card */}
      <div className="card-wood p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{t('stats.profit')}</h3>
              <p className="text-blue-100 dark:text-blue-200">{t('dashboard.overview')}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">
              {isLoading ? (
                <span className="inline-block h-10 w-40 skeleton rounded"></span>
              ) : (
                `${stats?.totalProfit?.toLocaleString() || 0} so'm`
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
