import { useEffect, useMemo, useState } from 'react';
import { FileDown, HandCoins, CheckCircle2, Trash2, AlertTriangle, X } from 'lucide-react';
import Card from '../../components/Card';
import DataTable from '../../components/DataTable';
import api from '../../services/api';

const getNowLocalDateTime = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60 * 1000).toISOString().slice(0, 16);
};

const Debts = () => {
  const [products, setProducts] = useState([]);
  const [debts, setDebts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [debtToDelete, setDebtToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    productId: '',
    customerFio: '',
    phone: '+998',
    quantity: '',
    unitPrice: '',
    occurredAt: getNowLocalDateTime()
  });

  const normalizeDigits = (value) => String(value || '').replace(/\D/g, '');
  const formatThousands = (value) => {
    const digits = normalizeDigits(value);
    if (!digits) return '';
    return Number(digits).toLocaleString('uz-UZ');
  };

  const selectedProduct = useMemo(
    () => products.find((p) => String(p.id) === String(formData.productId)),
    [products, formData.productId]
  );
  const volumePerUnit = useMemo(
    () => (selectedProduct?.sizes || []).reduce((acc, s) => acc + Number(s.volume || 0), 0),
    [selectedProduct]
  );
  const totalAmount = (Number(formData.quantity) || 0) * (Number(formData.unitPrice) || 0);
  const totalVolume = volumePerUnit * (Number(formData.quantity) || 0);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productsData, debtsData] = await Promise.all([api.getProducts(), api.getDebts()]);
      setProducts(productsData);
      setDebts(debtsData);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.createDebt(formData);
      setFormData({
        productId: '',
        customerFio: '',
        phone: '+998',
        quantity: '',
        unitPrice: '',
        occurredAt: getNowLocalDateTime()
      });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await api.exportDebtsExcel();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const openConfirm = (debt) => {
    setDebtToDelete(debt);
    setIsConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (isDeleting) return;
    setIsConfirmOpen(false);
    setDebtToDelete(null);
  };

  const confirmPaidAndDelete = async () => {
    if (!debtToDelete) return;
    setIsDeleting(true);
    setError('');
    try {
      await api.deleteDebt(debtToDelete.id);
      closeConfirm();
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    { key: 'customerFio', label: 'FIO' },
    { key: 'productName', label: 'Mahsulot' },
    { key: 'phone', label: 'Telefon' },
    { key: 'quantity', label: 'Soni' },
    { key: 'unitPrice', label: 'Bir dona narxi', render: (v) => `${v.toLocaleString()} so'm` },
    { key: 'totalAmount', label: 'Jami', render: (v) => `${v.toLocaleString()} so'm` },
    { key: 'volumeM3', label: 'Hajm (m³)', render: (v) => `${Number(v).toFixed(3)} m³` },
    { key: 'occurredAt', label: 'Sana', render: (v) => new Date(v).toLocaleDateString('uz-UZ') },
    { key: 'occurredAt', label: 'Soat', render: (v) => new Date(v).toLocaleTimeString('uz-UZ') },
    {
      key: 'status',
      label: "Holati",
      render: () => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
          To'lanmagan
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Amal',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openConfirm(row)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs sm:text-sm font-medium"
            title="To'landi (o'chirish)"
          >
            <CheckCircle2 className="w-4 h-4" />
            To'landi
          </button>
          <button
            onClick={() => openConfirm(row)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="O'chirish"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Qarz bo'limi</h2>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-60"
        >
          <FileDown className="w-4 h-4" />
          {isExporting ? 'Yuklanmoqda...' : 'Qarzdorlar ro\'yxati'}
        </button>
      </div>

      <Card title="Qarzga berish" icon={HandCoins}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <select
            value={formData.productId}
            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
            className="p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            required
          >
            <option value="">Mahsulot tanlang</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={formData.customerFio}
            onChange={(e) => setFormData({ ...formData, customerFio: e.target.value })}
            className="p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            placeholder="FIO"
            required
          />
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            placeholder="+998901234567"
            required
          />
          <input
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            placeholder="Nechta mahsulot"
            required
          />
          <input
            type="text"
            inputMode="numeric"
            min="1"
            value={formatThousands(formData.unitPrice)}
            onChange={(e) => setFormData({ ...formData, unitPrice: normalizeDigits(e.target.value) })}
            className="p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            placeholder="Bir dona narxi"
            required
          />
          <input
            type="datetime-local"
            value={formData.occurredAt}
            onChange={(e) => setFormData({ ...formData, occurredAt: e.target.value })}
            className="p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            required
          />
          <div className="col-span-1 md:col-span-2 lg:col-span-3 grid sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
              Jami qarz summasi: <strong>{totalAmount.toLocaleString()} so'm</strong>
            </div>
            <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
              Jami hajm: <strong>{totalVolume.toFixed(3)} m³</strong>
            </div>
          </div>
          <button type="submit" className="col-span-1 md:col-span-2 lg:col-span-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3">
            Qarzni saqlash
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      </Card>

      <Card title="Qarz yozuvlari" icon={HandCoins}>
        <DataTable
          columns={columns}
          data={debts}
          isLoading={isLoading}
          searchPlaceholder="Qarz yozuvlarini qidiring..."
          emptyMessage="Qarz yozuvlari hali yo'q"
        />
      </Card>

      {/* Confirm Card / Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-md shadow-2xl">
            <div className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-700 dark:text-yellow-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Ishonchingiz komilmi?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
                <strong className="text-gray-800 dark:text-gray-200">{debtToDelete?.customerFio}</strong> qarz yozuvini
                <br />
                <span className="text-gray-700 dark:text-gray-300 font-semibold">to'langan</span> deb belgilab, o'chirib yuboramiz.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                <button
                  onClick={closeConfirm}
                  disabled={isDeleting}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg sm:rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-60"
                >
                  Yo'q
                </button>
                <button
                  onClick={confirmPaidAndDelete}
                  disabled={isDeleting}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-green-600 text-white rounded-lg sm:rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isDeleting ? (
                    <>
                      <X className="w-4 h-4 animate-spin" />
                      O'chirilmoqda...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Ha
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Debts;
