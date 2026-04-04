import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'deals', or category_id

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories')
        ]);
        setProducts(prodRes.data.products || []);
        setCategories(catRes.data || []);
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleFilterChange = async (filterId) => {
    setActiveFilter(filterId);
    setLoading(true);
    try {
      let query = '/products';
      if (filterId !== 'all' && filterId !== 'deals') {
        query += `?category=${filterId}`;
      }
      const { data } = await api.get(query);
      let fetchedProducts = data.products || [];
      
      // If we clicked Deals, filter them locally (or could be done via backend)
      if (filterId === 'deals') {
        fetchedProducts = fetchedProducts.filter(p => p.discount_price != null && p.discount_price > 0);
      }
      setProducts(fetchedProducts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>Shop Now</h1>
        <div className="pill-container">
          <button 
            className={`pill ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            All Products
          </button>
          <button 
            className={`pill ${activeFilter === 'deals' ? 'active' : ''}`}
            onClick={() => handleFilterChange('deals')}
            style={activeFilter === 'deals' ? {} : { borderColor: '#ef4444', color: '#ef4444' }}
          >
            🔥 Deals
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id} 
              className={`pill ${activeFilter === cat.id ? 'active' : ''}`}
              onClick={() => handleFilterChange(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ height: '50vh' }}>
          <div className="loader"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="card flex-center" style={{ padding: '3rem' }}>
          <p>No products available right now for this filter.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
