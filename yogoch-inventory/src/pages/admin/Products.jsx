import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useSmartRefresh } from '../../hooks/useSmartRefresh';
import { useRefresh } from '../../contexts/RefreshContext';
import Card from '../../components/Card';
import DataTable from '../../components/DataTable';
import api from '../../services/api';
import { Package, Plus, Minus, Pencil, Trash2, X, Check, AlertTriangle } from 'lucide-react';

const Products = () => {
  const { t } = useTranslation();
  const { triggerRefresh } = useRefresh();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockAction, setStockAction] = useState(null); // 'restock' | 'sell'
  const [stockProduct, setStockProduct] = useState(null);
  const [stockForm, setStockForm] = useState({ quantity: '', price: '', occurredAt: '' });
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    purchasePrice: '',
    occurredAt: '',
    sizes: [{ length: '', width: '', height: '', volume: 0 }]
  });
  const [error, setError] = useState(null);

  const normalizeDigits = (value) => String(value || '').replace(/\D/g, '');
  const getNowLocalDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 16);
  };
  const formatThousands = (value) => {
    const digits = normalizeDigits(value);
    if (!digits) return '';
    return Number(digits).toLocaleString('uz-UZ');
  };

  const loadProducts = useCallback(async () => {
    // Don't refresh if modal is open to avoid disrupting user
    if (isModalOpen || isDeleteModalOpen) return;
    
    try {
      setIsLoading(true);
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isModalOpen, isDeleteModalOpen]);

  // Auto-refresh every 30 seconds (only when modals are closed)
  useSmartRefresh(loadProducts, { 
    interval: 30000,
    enabled: !isModalOpen && !isDeleteModalOpen, 
    onVisibilityChange: true, 
    onFocus: true,
    immediate: false
  });

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      quantity: '',
      purchasePrice: '',
      occurredAt: getNowLocalDateTime(),
      sizes: [{ length: '', width: '', height: '', volume: 0 }]
    });
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      quantity: product.quantity,
      purchasePrice: product.purchasePrice,
      occurredAt: product.occurredAt ? String(product.occurredAt).slice(0, 16) : getNowLocalDateTime(),
      sizes: product.sizes.length > 0 ? product.sizes : [{ length: '', width: '', height: '', volume: 0 }]
    });
    setIsModalOpen(true);
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await api.deleteProduct(productToDelete.id);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      loadProducts();
      // Trigger global refresh for other pages
      triggerRefresh('delete');
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      // Calculate volume and totals - convert width and height from cm to meters
      const sizesWithVolume = formData.sizes.map(size => {
        const length = parseFloat(size.length) || 0;
        const width = parseFloat(size.width) || 0;
        const height = parseFloat(size.height) || 0;
        const widthInMeters = width / 100;
        const heightInMeters = height / 100;
        return {
          ...size,
          length,
          width,
          height,
          volume: length * widthInMeters * heightInMeters
        };
      });
      
      const totalVolume = sizesWithVolume.reduce((acc, s) => acc + s.volume, 0) * formData.quantity;
      const productData = {
        ...formData,
        sizes: sizesWithVolume,
        totalVolume
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productData);
      } else {
        await api.createProduct(productData);
      }
      
      setIsModalOpen(false);
      setError(null);
      loadProducts();
      // Trigger global refresh for other pages
      triggerRefresh(editingProduct ? 'edit' : 'create');
    } catch (err) {
      console.error('Error saving product:', err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error || 
                          err.message || 
                          'Mahsulot saqlashda xatolik yuz berdi';
      setError(errorMessage);
    }
  };

  const openStockActionModal = (product, action) => {
    setStockProduct(product);
    setStockAction(action);
    setStockForm({ quantity: '', price: '', occurredAt: getNowLocalDateTime() });
    setError(null);
  };

  const closeStockActionModal = () => {
    setStockProduct(null);
    setStockAction(null);
    setStockForm({ quantity: '', price: '', occurredAt: '' });
  };

  const submitStockAction = async () => {
    if (!stockProduct || !stockAction) return;
    setError(null);
    try {
      if (stockAction === 'restock') {
        await api.restockProduct(stockProduct.id, {
          quantity: stockForm.quantity,
          purchasePrice: stockForm.price,
          occurredAt: stockForm.occurredAt
        });
      } else {
        await api.sellProduct(stockProduct.id, {
          quantity: stockForm.quantity,
          salePrice: stockForm.price,
          occurredAt: stockForm.occurredAt
        });
      }
      closeStockActionModal();
      loadProducts();
      triggerRefresh(stockAction);
    } catch (err) {
      setError(err.message || 'Amalni bajarishda xatolik yuz berdi');
    }
  };

  const addSize = () => {
    setFormData({
      ...formData,
      sizes: [...formData.sizes, { length: '', width: '', height: '', volume: 0 }]
    });
  };

  const removeSize = (index) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter((_, i) => i !== index)
    });
  };

  const updateSize = (index, field, value) => {
    const newSizes = formData.sizes.map((size, i) => {
      if (i === index) {
        const updated = { ...size, [field]: parseFloat(value) || 0 };
        // Convert width and height from cm to meters for calculation
        const widthInMeters = updated.width / 100;
        const heightInMeters = updated.height / 100;
        updated.volume = updated.length * widthInMeters * heightInMeters;
        return updated;
      }
      return size;
    });
    setFormData({ ...formData, sizes: newSizes });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setError(null);
  };

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...formData.sizes];
    newSizes[index] = {
      ...newSizes[index],
      [field]: value === '' ? '' : parseFloat(value) || 0
    };
    // Recalculate volume - convert width and height from cm to meters
    const length = parseFloat(newSizes[index].length) || 0;
    const width = parseFloat(newSizes[index].width) || 0;
    const height = parseFloat(newSizes[index].height) || 0;
    const widthInMeters = width / 100;
    const heightInMeters = height / 100;
    newSizes[index].volume = length * widthInMeters * heightInMeters;
    setFormData({ ...formData, sizes: newSizes });
  };

  const columns = [
    { key: 'name', label: t('products.name') },
    { key: 'quantity', label: t('products.quantity') },
    { 
      key: 'purchasePrice', 
      label: t('products.price'),
      render: (price) => `${price.toLocaleString()} so'm`
    },
    { 
      key: 'sizes', 
      label: `${t('stats.length')}×${t('stats.width')}×${t('stats.height')}`,
      render: (sizes) => sizes?.map(s => `${s.length}×${s.width}×${s.height}m`).join(', ') || '-'
    },
    { 
      key: 'soldQuantity', 
      label: t('stats.soldQuantity'),
      render: (qty, row) => {
        const total = qty + row.quantity;
        const percent = total > 0 ? ((qty / total) * 100).toFixed(1) : '0.0';
        return `${qty} (${percent}%)`;
      }
    },
    {
      key: 'actions',
      label: t('products.actions'),
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title={t('products.edit')}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title={t('products.delete')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const incomingColumns = [
    { key: 'name', label: t('products.name') },
    { key: 'quantity', label: t('products.quantity') },
    {
      key: 'actions',
      label: 'Amal',
      render: (_, row) => (
        <button
          onClick={() => openStockActionModal(row, 'restock')}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
        >
          <Plus className="w-4 h-4" /> Qo'shish
        </button>
      )
    }
  ];

  const soldColumns = [
    { key: 'name', label: t('products.name') },
    { key: 'quantity', label: 'Omborda qoldi' },
    {
      key: 'actions',
      label: 'Amal',
      render: (_, row) => (
        <button
          onClick={() => openStockActionModal(row, 'sell')}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
        >
          <Minus className="w-4 h-4" /> Sotish
        </button>
      )
    }
  ];

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{t('products.title')}</h2>
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          {t('products.addNew')}
        </button>
      </div>

      <Card title={t('products.title')} icon={Package}>
        <DataTable
          columns={columns}
          data={products}
          isLoading={isLoading}
          searchPlaceholder={t('products.search')}
          emptyMessage={t('products.noProducts')}
        />
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <Card title="Olib kelingan mahsulotlar" icon={Plus}>
          <DataTable
            columns={incomingColumns}
            data={products}
            isLoading={isLoading}
            searchable={false}
            pagination={false}
            mobileCardView={false}
            emptyMessage={t('products.noProducts')}
          />
        </Card>

        <Card title="Sotilgan mahsulotlar" icon={Minus}>
          <DataTable
            columns={soldColumns}
            data={products}
            isLoading={isLoading}
            searchable={false}
            pagination={false}
            mobileCardView={false}
            emptyMessage={t('products.noProducts')}
          />
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-md shadow-2xl transform transition-all">
            <div className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                {t('products.delete')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
                <strong className="text-gray-800 dark:text-gray-200">"{productToDelete?.name}"</strong> mahsulotini o'chirishni xohlaysizmi?
                <br />
                <span className="text-xs sm:text-sm text-red-500 dark:text-red-400 mt-2 block">
                  Bu amalni qaytarib bo'lmaydi!
                </span>
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                <button
                  onClick={cancelDelete}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg sm:rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('products.cancel')}
                </button>
                <button
                  onClick={confirmDelete}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg sm:rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('products.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 rounded-t-xl sm:rounded-t-2xl z-10">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
                {editingProduct ? t('products.edit') : t('products.addNew')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('products.name')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('stats.quantityInStock')}
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 transition-colors"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('stats.purchasePrice')}(so'm)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.purchasePrice ? Number(formData.purchasePrice).toLocaleString('uz-UZ') : ''}
                    onChange={(e) => {
                      setFormData({ ...formData, purchasePrice: normalizeDigits(e.target.value) });
                    }}
                    className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 transition-colors"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sana va vaqt
                </label>
                <input
                  type="datetime-local"
                  value={formData.occurredAt}
                  onChange={(e) => setFormData({ ...formData, occurredAt: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 transition-colors"
                  required
                />
              </div>

              {/* Sizes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('stats.productSizes')}
                  </label>
                </div>
                {formData.sizes.map((size, index) => (
                  <div key={index} className="mb-4">
                    {/* Size Labels */}
                    <div className="grid grid-cols-3 gap-2 mb-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{t('stats.length')} (m)</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{t('stats.width')} (sm)</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{t('stats.height')} (sm)</span>
                    </div>
                    {/* Size Inputs */}
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <input
                          type="number"
                          step="0.01"
                          placeholder=""
                          value={size.length}
                          onChange={(e) => handleSizeChange(index, 'length', e.target.value)}
                          className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 transition-colors"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          step="0.01"
                          placeholder=""
                          value={size.width}
                          onChange={(e) => handleSizeChange(index, 'width', e.target.value)}
                          className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 transition-colors"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          step="0.01"
                          placeholder=""
                          value={size.height}
                          onChange={(e) => handleSizeChange(index, 'height', e.target.value)}
                          className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 transition-colors"
                        />
                      </div>
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 min-w-[90px] text-center font-medium border border-gray-200 dark:border-gray-600">
                        {size.volume === 0 ? '0m³' : Number.isInteger(size.volume) ? `${size.volume}m³` : `${size.volume.toFixed(2)}m³`}
                      </div>
                      {formData.sizes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSize(index)}
                          className="p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg flex-shrink-0 transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSize}
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <span className="text-lg">+</span> {t('stats.addSize')}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {t('products.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {stockAction && stockProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-2xl">
            <div className="p-5 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                {stockAction === 'restock' ? 'Olib kelingan mahsulotlar' : 'Sotilgan mahsulotlar'}
              </h3>
              <button onClick={closeStockActionModal} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Mahsulot: <strong>{stockProduct.name}</strong>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Soni</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatThousands(stockForm.quantity)}
                  onChange={(e) => setStockForm({ ...stockForm, quantity: normalizeDigits(e.target.value) })}
                  className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {stockAction === 'restock' ? 'Kirish narxi (so\'m)' : 'Sotilgan narxi (so\'m)'}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatThousands(stockForm.price)}
                  onChange={(e) => setStockForm({ ...stockForm, price: normalizeDigits(e.target.value) })}
                  className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sana va vaqt
                </label>
                <input
                  type="datetime-local"
                  value={stockForm.occurredAt}
                  onChange={(e) => setStockForm({ ...stockForm, occurredAt: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeStockActionModal}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 rounded-lg"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={submitStockAction}
                  className={`flex-1 px-4 py-2.5 text-white rounded-lg ${stockAction === 'restock' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  Saqlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
