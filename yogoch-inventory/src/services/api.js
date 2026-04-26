import axios from 'axios';

// Backend API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.detail ||
  error?.response?.data?.error ||
  (typeof error?.response?.data === 'string' ? error.response.data : null) ||
  error?.message ||
  fallback;

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('yogoch_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('yogoch_token');
      localStorage.removeItem('yogoch_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Transform frontend field names to backend format
const transformProductToBackend = (data) => {
  const payload = {
    name: data.name,
    quantity: parseInt(data.quantity) || 0,
    purchase_price: parseFloat(data.purchasePrice) || 0,
    occurred_at: data.occurredAt || undefined,
    sizes: (data.sizes || []).map(size => ({
      length: parseFloat(size.length) || 0,
      width: parseFloat(size.width) || 0,
      height: parseFloat(size.height) || 0
    }))
  };

  if (data.soldQuantity !== undefined && data.soldQuantity !== null && data.soldQuantity !== '') {
    payload.sold_quantity = parseInt(data.soldQuantity) || 0;
  }
  return payload;
};

// Transform backend response to frontend format
const transformProductToFrontend = (data) => {
  return {
    id: data.id,
    name: data.name,
    quantity: data.quantity,
    purchasePrice: data.purchase_price,
    soldQuantity: data.sold_quantity,
    occurredAt: data.occurred_at,
    sizes: (data.sizes || []).map(size => ({
      length: size.length,
      width: size.width,
      height: size.height,
      volume: size.volume
    })),
    totalVolume: data.total_volume,
    soldVolume: data.sold_volume,
    profit: data.profit,
    createdAt: data.created_at
  };
};

// Real API implementation for Django backend
const api = {
  // Auth
  login: async (username, password) => {
    try {
      const response = await apiClient.post('/auth/login/', {
        username,
        password
      });
      
      return {
        token: response.data.token,
        user: response.data.user
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Invalid credentials';
      throw new Error(message);
    }
  },

  createSuperuser: async ({ username, password }) => {
    try {
      const response = await apiClient.post('/auth/create-superuser/', { username, password });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Superuser yaratishda xatolik yuz berdi'));
    }
  },

  // Products
  getProducts: async () => {
    try {
      const response = await apiClient.get('/products/');
      return response.data.map(transformProductToFrontend);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  getProduct: async (id) => {
    try {
      const response = await apiClient.get(`/products/${id}/`);
      return transformProductToFrontend(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  createProduct: async (data) => {
    try {
      const backendData = transformProductToBackend(data);
      const response = await apiClient.post('/products/', backendData);
      return transformProductToFrontend(response.data);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  updateProduct: async (id, data) => {
    try {
      const backendData = transformProductToBackend(data);
      const response = await apiClient.put(`/products/${id}/`, backendData);
      return transformProductToFrontend(response.data);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      await apiClient.delete(`/products/${id}/`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  restockProduct: async (id, { quantity, purchasePrice, occurredAt }) => {
    try {
      const response = await apiClient.post(`/products/${id}/restock/`, {
        quantity: parseInt(quantity),
        purchase_price: parseFloat(purchasePrice),
        occurred_at: occurredAt
      });
      return transformProductToFrontend(response.data);
    } catch (error) {
      console.error('Error restocking product:', error);
      throw new Error(getErrorMessage(error, 'Mahsulotni omborga qo\'shishda xatolik yuz berdi'));
    }
  },

  sellProduct: async (id, { quantity, salePrice, occurredAt }) => {
    try {
      const response = await apiClient.post(`/products/${id}/sell/`, {
        quantity: parseInt(quantity),
        sale_price: parseFloat(salePrice),
        occurred_at: occurredAt
      });
      return transformProductToFrontend(response.data);
    } catch (error) {
      console.error('Error selling product:', error);
      throw new Error(getErrorMessage(error, 'Sotuvni saqlashda xatolik yuz berdi'));
    }
  },

  // Stats - endpoint is now /api/products/stats/
  getStats: async () => {
    try {
      const response = await apiClient.get('/stats/');
      const data = response.data;
      
      // Handle error response from backend
      if (data.error) {
        throw new Error(data.error);
      }
      
      return {
        totalProducts: data.total_products,
        totalQuantity: data.total_quantity,
        totalSoldQuantity: data.total_sold_quantity,
        totalVolume: data.total_volume,
        totalSoldVolume: data.total_sold_volume,
        totalInventoryValue: data.total_inventory_value,
        totalRevenue: data.total_revenue,
        totalProfit: data.total_profit,
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw new Error(getErrorMessage(error, 'Statistikani yuklashda xatolik yuz berdi'));
    }
  },

  getTransactions: async () => {
    try {
      const response = await apiClient.get('/transactions/');
      return (response.data || []).map((item) => ({
        id: item.id,
        productName: item.product_name,
        type: item.transaction_type,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
        unitCost: Number(item.unit_cost),
        occurredAt: item.occurred_at,
        createdAt: item.created_at
      }));
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Harakatlar tarixini yuklashda xatolik yuz berdi'));
    }
  },

  getDebts: async () => {
    try {
      const response = await apiClient.get('/debts/');
      return (response.data || []).map((item) => ({
        id: item.id,
        productId: item.product,
        productName: item.product_name,
        customerFio: item.customer_fio,
        phone: item.phone,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
        totalAmount: Number(item.total_amount),
        volumeM3: Number(item.volume_m3),
        occurredAt: item.occurred_at
      }));
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Qarz ma\'lumotlarini yuklashda xatolik yuz berdi'));
    }
  },

  deleteDebt: async (id) => {
    try {
      await apiClient.delete(`/debts/${id}/`);
      return { success: true };
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Qarz yozuvini o\'chirishda xatolik yuz berdi'));
    }
  },

  createDebt: async (payload) => {
    try {
      const response = await apiClient.post('/debts/', {
        product: payload.productId,
        customer_fio: payload.customerFio,
        phone: payload.phone,
        quantity: parseInt(payload.quantity),
        unit_price: parseFloat(payload.unitPrice),
        occurred_at: payload.occurredAt
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Qarz yozuvini saqlashda xatolik yuz berdi'));
    }
  },

  exportDebtsExcel: async () => {
    try {
      const response = await apiClient.get('/debts/export/excel/', { responseType: 'blob' });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const disposition = response.headers['content-disposition'] || '';
      const match = disposition.match(/filename=\"?([^"]+)\"?/i);
      link.download = match?.[1] || `qarzdorlar_royxati_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return { success: true };
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Qarzdorlar ro\'yxatini yuklashda xatolik yuz berdi'));
    }
  },

  // Excel Export
  exportExcel: async () => {
    try {
      const response = await apiClient.get('/export/excel/', {
        responseType: 'blob'
      });
      
      // Create download link
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const disposition = response.headers['content-disposition'] || '';
      const match = disposition.match(/filename=\"?([^"]+)\"?/i);
      link.download = match?.[1] || `inventory_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error exporting Excel:', error);
      throw new Error(getErrorMessage(error, 'Excel hisobotni yuklashda xatolik yuz berdi'));
    }
  }
};

export default api;
