import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Authorization token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const login = (credentials) => API.post('/auth/login', credentials);
export const register = (userData) => API.post('/auth/register', userData);

// Product endpoints
export const getProducts = (page = 0, size = 10, sort = 'id') => 
  API.get(`/products?page=${page}&size=${size}&sort=${sort}`);
export const searchProducts = (keyword, page = 0, size = 10, sort = 'id') => 
  API.get(`/products/search?keyword=${keyword}&page=${page}&size=${size}&sort=${sort}`);
export const getProductById = (id) => API.get(`/products/${id}`);
export const createProduct = (productData) => API.post('/products', productData);
export const updateProduct = (id, productData) => API.put(`/products/${id}`, productData);
export const deleteProduct = (id) => API.delete(`/products/${id}`);

// Category endpoints
export const getCategories = () => API.get('/categories');
export const createCategory = (categoryData) => API.post('/categories', categoryData);
export const updateCategory = (id, categoryData) => API.put(`/categories/${id}`, categoryData);
export const deleteCategory = (id) => API.delete(`/categories/${id}`);

// Cart endpoints
export const getCart = () => API.get('/cart');
export const addToCart = (productId, quantity) => API.post('/cart/add', { productId, quantity });
export const removeFromCart = (productId) => API.delete(`/cart/remove/${productId}`);

// Order endpoints
export const placeOrder = () => API.post('/orders');
export const getOrders = () => API.get('/orders');
export const getOrderById = (id) => API.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => API.put(`/orders/${id}/status`, { status });
export const cancelOrder = (id) => API.put(`/orders/${id}/cancel`);

export default API;
