import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useSmartRefresh } from '../../hooks/useSmartRefresh';
import Card from '../../components/Card';
import StatsBox from '../../components/StatsBox';
import DataTable from '../../components/DataTable';
import api from '../../services/api';
import { 
  Package, Boxes, Scale, 
  ShoppingCart, TrendingUp, BarChart3,
  PieChart, TrendingDown, Archive, Download,
  AlertTriangle
} from 'lucide-react';

const Stats = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      await api.exportExcel();
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Hisobot yuklashda xatolik yuz berdi');
    } finally {
      setIsDownloading(false);
    }
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [statsData, productsData] = await Promise.all([
        api.getStats(),
        api.getProducts()
      ]);
      const transactionsData = await api.getTransactions();
      setStats(statsData);
      setProducts(productsData);
      setTransactions(transactionsData);
    } catch (err) {
      console.error('Error loading data:', err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error || 
                          err.message || 
                          'Ma\'lumotlarni yuklashda xatolik';
      setError(errorMessage);
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

  const mainStats = [
    { key: 'totalProducts', title: t('stats.totalProducts'), icon: Package, color: 'blue' },
    { key: 'totalQuantity', title: t('stats.quantityInStock'), icon: Boxes, color: 'gray' },
  ];

  const volumeStats = [
    { key: 'totalVolume', title: t('stats.totalVolume'), icon: Scale, color: 'blue', unit: 'm³' },
    { key: 'totalSoldVolume', title: t('stats.soldVolume'), icon: TrendingDown, color: 'gray', unit: 'm³' },
  ];

  const salesColumns = [
    { key: 'name', label: t('products.name') },
    { 
      key: 'quantity', 
      label: t('stats.quantityInStock'),
      render: (qty, row) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-wood-light/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-wood-brown rounded-full"
              style={{ width: `${(qty / (qty + row.soldQuantity || 1)) * 100}%` }}
            />
          </div>
          <span>{qty}</span>
        </div>
      )
    },
    { 
      key: 'soldQuantity', 
      label: t('stats.soldQuantity'),
      render: (qty, row) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-wood-light/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500 rounded-full"
              style={{ width: `${(qty / (qty + row.quantity || 1)) * 100}%` }}
            />
          </div>
          <span className="text-red-600">{qty}</span>
        </div>
      )
    },
    { 
      key: 'profit', 
      label: t('stats.profit'),
      render: (profit) => (
        <span className="text-green-600 font-medium">
          +{profit.toLocaleString()} so'm
        </span>
      )
    },
    { 
      key: 'soldVolume', 
      label: t('stats.soldVolume'),
      render: (vol) => `${vol.toFixed(3)} m³`
    },
  ];

  const incomingTransactions = transactions.filter((t) => t.type === 'IN');
  const outgoingTransactions = transactions.filter((t) => t.type === 'OUT');

  const incomingColumns = [
    { key: 'productName', label: t('products.name') },
    { key: 'quantity', label: 'Soni' },
    { key: 'unitPrice', label: 'Narx', render: (v) => `${v.toLocaleString()} so'm` },
    {
      key: 'occurredAt',
      label: 'Sana',
      render: (v) => new Date(v).toLocaleDateString('uz-UZ')
    },
    {
      key: 'occurredAt',
      label: 'Soat',
      render: (v) => new Date(v).toLocaleTimeString('uz-UZ')
    }
  ];

  const outgoingColumns = [
    { key: 'productName', label: t('products.name') },
    { key: 'quantity', label: 'Sotilgan soni' },
    { key: 'unitPrice', label: 'Sotilgan narx', render: (v) => `${v.toLocaleString()} so'm` },
    {
      key: 'occurredAt',
      label: 'Sana',
      render: (v) => new Date(v).toLocaleDateString('uz-UZ')
    },
    {
      key: 'occurredAt',
      label: 'Soat',
      render: (v) => new Date(v).toLocaleTimeString('uz-UZ')
    }
  ];

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{t('nav.stats')}</h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Batafsil statistika va tahlillar</p>
        </div>
        <button
          onClick={handleDownloadReport}
          disabled={isDownloading || isLoading}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
        >
          <Download className="w-4 h-4 sm:w-5 sm:h-5" />
          {isDownloading ? t('common.downloading') : t('common.downloadReport')}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <div>
            <p className="font-medium">Xatolik yuz berdi</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 lg:col-span-2">
          {mainStats.map((stat) => (
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
        <StatsBox
          title={t('stats.profit')}
          value={stats?.totalProfit || 0}
          unit="so'm"
          icon={TrendingUp}
          color="blue"
          isLoading={isLoading}
        />
      </div>

      {/* Volume Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {volumeStats.map((stat) => (
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <Card title="Ombor holati" icon={Archive}>
          {isLoading ? (
            <div className="h-32 skeleton rounded-xl"></div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Jami mahsulotlar</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{stats?.totalProducts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Ombordagi dona</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{stats?.totalQuantity}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Sotilgan dona</span>
                <span className="font-semibold text-gray-500 dark:text-gray-500">{stats?.totalSoldQuantity}</span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Sotish foizi</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {((stats?.totalSoldQuantity / (stats?.totalQuantity + stats?.totalSoldQuantity || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card title="Hajm tahlili" icon={PieChart}>
          {isLoading ? (
            <div className="h-32 skeleton rounded-xl"></div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Jami hajm</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{stats?.totalVolume?.toFixed(2)} m³</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Sotilgan hajm</span>
                <span className="font-semibold text-gray-500 dark:text-gray-500">{stats?.totalSoldVolume?.toFixed(2)} m³</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Qolgan hajm</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {(stats?.totalVolume - stats?.totalSoldVolume)?.toFixed(2)} m³
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-300 dark:from-blue-600 dark:to-blue-400 rounded-full"
                    style={{
                      width: `${((stats?.totalSoldVolume / (stats?.totalVolume || 1)) * 100)}%`
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center">
                  Sotilgan hajm: {((stats?.totalSoldVolume / (stats?.totalVolume || 1)) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </Card>

        <Card title="Moliyaviy ko'rsatkichlar" icon={BarChart3}>
          {isLoading ? (
            <div className="h-32 skeleton rounded-xl"></div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Sotishdan daromad</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {stats?.totalRevenue?.toLocaleString()} so'm
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Sof foyda</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400 text-lg">
                  +{stats?.totalProfit?.toLocaleString()} so'm
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Foyda foizi</span>
                <span className="font-semibold text-blue-500 dark:text-blue-400">~30%</span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Ombor qiymati</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {stats?.totalInventoryValue?.toLocaleString()} so'm
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Sales Table */}
      <Card title="Mahsulotlar sotuvi bo'yicha" icon={ShoppingCart}>
        <DataTable
          columns={salesColumns}
          data={products}
          isLoading={isLoading}
          searchPlaceholder={t('products.search')}
          emptyMessage={t('products.noProducts')}
        />
      </Card>

      <Card title="Ombor harakatlari tarixi" icon={BarChart3}>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <DataTable
            columns={incomingColumns}
            data={incomingTransactions}
            isLoading={isLoading}
            searchPlaceholder="Kirimni qidiring..."
            emptyMessage="Kirim yo'q"
          />
          <DataTable
            columns={outgoingColumns}
            data={outgoingTransactions}
            isLoading={isLoading}
            searchPlaceholder="Chiqimni qidiring..."
            emptyMessage="Chiqim yo'q"
          />
        </div>
      </Card>
    </div>
  );
};

export default Stats;
