import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('yogoch_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Mock data for development
const mockProducts = [
  {
    id: 1,
    name: "Qarag'ay taxta",
    sizes: [{ length: 6, width: 0.15, height: 0.025, volume: 0.0225 }],
    quantity: 150,
    purchasePrice: 450000,
    soldQuantity: 45,
    soldVolume: 1.0125,
    totalVolume: 3.375,
    profit: 1350000
  },
  {
    id: 2,
    name: "Zarafshon brus",
    sizes: [{ length: 4, width: 0.1, height: 0.1, volume: 0.04 }],
    quantity: 80,
    purchasePrice: 680000,
    soldQuantity: 25,
    soldVolume: 1.0,
    totalVolume: 3.2,
    profit: 1700000
  },
  {
    id: 3,
    name: "Terak plita",
    sizes: [{ length: 2.5, width: 0.2, height: 0.03, volume: 0.015 }],
    quantity: 200,
    purchasePrice: 320000,
    soldQuantity: 80,
    soldVolume: 1.2,
    totalVolume: 3.0,
    profit: 960000
  },
  {
    id: 4,
    name: "Qayin reyka",
    sizes: [{ length: 3, width: 0.05, height: 0.02, volume: 0.003 }],
    quantity: 500,
    purchasePrice: 85000,
    soldQuantity: 150,
    soldVolume: 0.45,
    totalVolume: 1.5,
    profit: 375000
  },
  {
    id: 5,
    name: "Tolta briket",
    sizes: [{ length: 0.15, width: 0.09, height: 0.06, volume: 0.00081 }],
    quantity: 1000,
    purchasePrice: 12000,
    soldQuantity: 400,
    soldVolume: 0.324,
    totalVolume: 0.81,
    profit: 480000
  }
];

// Mock API implementation
const mockApi = {
  // Auth
  login: async (username, password) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (username === 'admin' && password === 'admin') {
      return {
        token: 'mock_jwt_token_' + Date.now(),
        user: { username: 'admin', role: 'admin' }
      };
    }
    throw new Error('Invalid credentials');
  },

  // Products
  getProducts: async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [...mockProducts];
  },

  getProduct: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const product = mockProducts.find(p => p.id === id);
    if (!product) throw new Error('Product not found');
    return product;
  },

  createProduct: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newProduct = { ...data, id: Date.now() };
    mockProducts.push(newProduct);
    return newProduct;
  },

  updateProduct: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    mockProducts[index] = { ...mockProducts[index], ...data };
    return mockProducts[index];
  },

  deleteProduct: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    mockProducts.splice(index, 1);
    return { success: true };
  },

  // Stats
  getStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const totals = mockProducts.reduce((acc, product) => ({
      totalProducts: acc.totalProducts + 1,
      totalQuantity: acc.totalQuantity + product.quantity,
      totalPurchasePrice: acc.totalPurchasePrice + (product.purchasePrice * product.quantity),
      totalVolume: acc.totalVolume + product.totalVolume,
      totalSoldQuantity: acc.totalSoldQuantity + product.soldQuantity,
      totalSoldVolume: acc.totalSoldVolume + (product.soldQuantity * (product.totalVolume / product.quantity))
    }), {
      totalProducts: 0,
      totalQuantity: 0,
      totalPurchasePrice: 0,
      totalVolume: 0,
      totalSoldQuantity: 0,
      totalSoldVolume: 0
    });

    return totals;
  }
};

// Export mock API as default for now (switch to real api when backend is ready)
export default mockApi;
