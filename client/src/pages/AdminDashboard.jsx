import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { useSelector } from 'react-redux';
import { Trash, Edit } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const AdminDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'categories'
  
  // Category State
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  
  // Products State
  const [products, setProducts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loadingForm, setLoadingForm] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [offerLabel, setOfferLabel] = useState('');

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchCategories();
      fetchProducts();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data.products || []);
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  // ---- CATEGORY HANDLERS ----
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', { name: newCategory });
      toast.success('Category Added');
      setNewCategory('');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to add category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category Deleted');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  // ---- PRODUCT HANDLERS ----
  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setName(''); setPrice(''); setDiscountPrice(''); setDescription(''); setImageUrl(''); setStock(''); setCategoryId(''); setOfferLabel('');
  }

  const handleEditClick = (prod) => {
    setIsEditing(true);
    setEditId(prod.id);
    setName(prod.name);
    setPrice(prod.price);
    setDiscountPrice(prod.discount_price || '');
    setDescription(prod.description);
    setImageUrl(prod.image_url || '');
    setStock(prod.stock);
    setCategoryId(prod.category_id || '');
    setOfferLabel(prod.offer_label || '');
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setLoadingForm(true);

    const payload = {
      name,
      price: Number(price),
      discount_price: discountPrice ? Number(discountPrice) : null,
      description,
      image_url: imageUrl,
      stock: Number(stock),
      category_id: categoryId || null,
      offer_label: offerLabel || null
    };

    try {
      if (isEditing) {
        await api.put(`/products/${editId}`, payload);
        toast.success('Product Updated!');
      } else {
        await api.post('/products', payload);
        toast.success('Product Added!');
      }
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoadingForm(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if(!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product Deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="flex-center" style={{ height: '50vh' }}><h2>Access Denied</h2></div>;
  }

  return (
    <PageTransition>
      <div>
      <div className="tabs">
        <div className={`tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
          Manage Products
        </div>
        <div className={`tab ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
          Manage Categories
        </div>
      </div>

      {activeTab === 'categories' && (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Add New Category</h3>
          <form style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }} onSubmit={handleAddCategory}>
            <input 
              type="text" 
              placeholder="E.g. Electronics, Books..." 
              value={newCategory} 
              onChange={e => setNewCategory(e.target.value)} 
              required 
            />
            <button type="submit" className="btn btn-primary">Add</button>
          </form>

          <h3 style={{ marginBottom: '1rem' }}>Existing Categories</h3>
          <div>
            {categories.length === 0 ? <p>No categories found.</p> : categories.map(cat => (
              <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <span>{cat.name}</span>
                <button onClick={() => handleDeleteCategory(cat.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}><Trash size={18} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', flexDirection: 'row-reverse' }}>
          {/* Form Side */}
          <div style={{ flex: '1 1 400px' }}>
            <div className="card" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
                {isEditing && <button onClick={resetForm} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }}>Cancel</button>}
              </div>

              <form onSubmit={handleSubmitProduct}>
                <div className="form-group">
                  <label>Product Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Regular Price (₹)</label>
                    <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Discount Price (₹)</label>
                    <input type="number" step="0.01" placeholder="Optional" value={discountPrice} onChange={e => setDiscountPrice(e.target.value)} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                   <div className="form-group" style={{ flex: 1 }}>
                     <label>Category</label>
                     <select 
                       value={categoryId} 
                       onChange={e => setCategoryId(e.target.value)}
                       style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                     >
                       <option value="">None</option>
                       {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </select>
                   </div>
                   <div className="form-group" style={{ flex: 1 }}>
                     <label>Offer Label (Badge)</label>
                     <input type="text" placeholder="e.g. 50% OFF" value={offerLabel} onChange={e => setOfferLabel(e.target.value)} />
                   </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea rows="3" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', fontFamily: 'inherit' }} value={description} onChange={e => setDescription(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input type="url" placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label>Stock Quantity</label>
                  <input type="number" value={stock} onChange={e => setStock(e.target.value)} required />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={loadingForm}>
                   {loadingForm ? 'Saving...' : (isEditing ? 'Update Product' : 'Add Product')}
                </button>
              </form>
            </div>
          </div>

          {/* List Side */}
          <div style={{ flex: '1 1 600px' }}>
            <h3 style={{ marginBottom: '1rem' }}>All Products ({products.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {products.map(prod => (
                <div key={prod.id} className="card" style={{ display: 'flex', padding: '1rem', alignItems: 'center' }}>
                  <img src={prod.image_url?.trim() ? prod.image_url : 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%2250%22%20height%3D%2250%22%20fill%3D%22%23ccc%22%2F%3E%3C%2Fsvg%3E'} alt="" style={{ width: '50px', height: '50px', objectFit: 'contain', marginRight: '1rem' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold' }}>{prod.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'gray' }}>Price: ₹{prod.price} | Stock: {prod.stock}</div>
                    {prod.categories && <span style={{ fontSize: '0.75rem', background: 'var(--border-color)', padding: '2px 6px', borderRadius: '4px' }}>{prod.categories.name}</span>}
                    {prod.offer_label && <span className="badge" style={{ marginLeft: '0.5rem' }}>{prod.offer_label}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleEditClick(prod)} className="btn btn-outline" style={{ padding: '0.5rem' }}><Edit size={16} /></button>
                    <button onClick={() => handleDeleteProduct(prod.id)} className="btn btn-outline" style={{ padding: '0.5rem', color: 'red', borderColor: 'red' }}><Trash size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    </PageTransition>
  );
};

export default AdminDashboard;
