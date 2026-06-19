import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getProducts, 
  searchProducts, 
  getCategories, 
  createCategory,
  addToCart, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../services/api';

const Catalog = () => {
  const { user, isAdmin, isCustomer } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('id');

  // Admin Modals State
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodQty, setProdQty] = useState('');
  const [prodCatId, setProdCatId] = useState('');

  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Cart Alert state
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, sortBy, categoryFilter]);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      if (response.data && response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let response;
      if (search.trim() !== '') {
        response = await searchProducts(search, page, 6, sortBy);
      } else {
        response = await getProducts(page, 6, sortBy);
      }

      if (response.data && response.data.success) {
        const pageData = response.data.data;
        let content = pageData.content;
        
        // Filter by category client-side since API returns page contents
        if (categoryFilter) {
          content = content.filter(p => p.categoryId === parseInt(categoryFilter));
        }

        setProducts(content);
        setTotalPages(pageData.totalPages);
      }
    } catch (err) {
      console.error('Error fetching products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchProducts();
  };

  const handleAddToCart = async (productId) => {
    try {
      const response = await addToCart(productId, 1);
      if (response.data && response.data.success) {
        showFeedback('Item added to cart!', 'success');
      }
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Failed to add item to cart', 'error');
    }
  };

  const showFeedback = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 3000);
  };

  // Admin Create/Update Product handler
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const productPayload = {
      name: prodName,
      description: prodDesc,
      price: parseFloat(prodPrice),
      quantity: parseInt(prodQty),
      categoryId: parseInt(prodCatId)
    };

    try {
      let response;
      if (editProduct) {
        response = await updateProduct(editProduct.id, productPayload);
        showFeedback('Product updated successfully!', 'success');
      } else {
        response = await createProduct(productPayload);
        showFeedback('Product created successfully!', 'success');
      }

      if (response.data && response.data.success) {
        closeModal();
        fetchProducts();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await createCategory({ name: catName, description: catDesc });
      if (response.data && response.data.success) {
        showFeedback('Category created successfully!', 'success');
        setShowCategoryModal(false);
        setCatName('');
        setCatDesc('');
        fetchCategories(); // Refresh category list so it appears in the dropdowns immediately
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleEditClick = (product) => {
    setEditProduct(product);
    setProdName(product.name);
    setProdDesc(product.description || '');
    setProdPrice(product.price);
    setProdQty(product.quantity);
    setProdCatId(product.categoryId);
    setShowModal(true);
  };

  const handleDeleteClick = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        showFeedback('Product deleted successfully!', 'success');
        fetchProducts();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const openCreateModal = () => {
    setEditProduct(null);
    setProdName('');
    setProdDesc('');
    setProdPrice('');
    setProdQty('');
    setProdCatId(categories[0]?.id || '');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditProduct(null);
  };

  return (
    <div className="container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Explore Products</h1>
        {isAdmin() && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={() => setShowCategoryModal(true)}>
              Add Category
            </button>
            <button className="btn btn-primary" onClick={openCreateModal}>
              Add New Product
            </button>
          </div>
        )}
      </div>

      {message.text && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          background: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          fontWeight: '600',
          animation: 'fadeIn 0.2s ease forwards'
        }}>
          {message.text}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '40px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '280px', display: 'flex', gap: '12px' }}>
          <input
            type="text"
            placeholder="Search for laptops, phones, t-shirts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 20px' }}>
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ width: '180px' }}>
            <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}>
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div style={{ width: '150px' }}>
            <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(0); }}>
              <option value="id">Default (ID)</option>
              <option value="price">Sort by Price</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Loading products...</span>
        </div>
      ) : products.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>No products found.</span>
        </div>
      ) : (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '30px',
            marginBottom: '40px'
          }}>
            {products.map((product) => (
              <div key={product.id} className="glass-panel" style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                transition: 'var(--transition-normal)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <span className="badge" style={{
                    background: 'rgba(139, 92, 246, 0.15)',
                    color: 'var(--secondary)',
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                  }}>
                    {product.categoryName}
                  </span>
                  <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)' }}>
                    ${product.price}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '10px' }}>{product.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px', flexGrow: 1, lineHeight: '1.6' }}>
                  {product.description || 'No description available for this item.'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '16px' }}>
                  <span style={{ fontSize: '0.85rem', color: product.quantity > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: '600' }}>
                    {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                  </span>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {isAdmin() && (
                      <>
                        <button className="btn btn-secondary" style={{ padding: '8px 12px' }} onClick={() => handleEditClick(product)}>
                          Edit
                        </button>
                        <button className="btn btn-danger" style={{ padding: '8px 12px' }} onClick={() => handleDeleteClick(product.id)}>
                          Delete
                        </button>
                      </>
                    )}

                    {isCustomer() && (
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '8px 16px' }}
                        disabled={product.quantity <= 0}
                        onClick={() => handleAddToCart(product.id)}
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center' }}>
              <button 
                className="btn btn-secondary" 
                disabled={page === 0} 
                onClick={() => setPage(prev => prev - 1)}
              >
                Previous
              </button>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Page {page + 1} of {totalPages}
              </span>
              <button 
                className="btn btn-secondary" 
                disabled={page === totalPages - 1} 
                onClick={() => setPage(prev => prev + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Admin Create/Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '36px' }}>
            <h2 className="page-title" style={{ marginBottom: '24px' }}>
              {editProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Product Name</label>
                <input type="text" value={prodName} onChange={(e) => setProdName(e.target.value)} required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Description</label>
                <textarea rows="3" value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Price ($)</label>
                  <input type="number" step="0.01" min="0" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Stock Quantity</label>
                  <input type="number" min="0" value={prodQty} onChange={(e) => setProdQty(e.target.value)} required />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Category</label>
                <select value={prodCatId} onChange={(e) => setProdCatId(e.target.value)} required>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Create Category Modal */}
      {showCategoryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '36px' }}>
            <h2 className="page-title" style={{ marginBottom: '24px' }}>Add New Category</h2>
            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Category Name</label>
                <input type="text" value={catName} onChange={(e) => setCatName(e.target.value)} required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Description</label>
                <textarea rows="3" value={catDesc} onChange={(e) => setCatDesc(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCategoryModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
