import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { addToCartSuccess } from '../features/cartSlice';
import PageTransition from '../components/PageTransition';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (error) {
        toast.error('Product not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const addToCartHandler = async () => {
    if (!user) {
      toast.error('Please login to add to cart');
      return navigate('/login');
    }

    try {
      const { data } = await api.post('/cart', { product_id: product.id, quantity: qty });
      dispatch(addToCartSuccess(data));
      toast.success('Added to cart!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  if (loading) {
    return <div className="flex-center" style={{ height: '50vh' }}><div className="loader"></div></div>;
  }

  if (!product) return null;

  const displayPrice = product.discount_price || product.price;

  return (
    <PageTransition>
      <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
        <div style={{ flex: '1 1 400px' }}>
          <img
            src={product.image_url?.trim() ? product.image_url : 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22600%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23cccccc%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224px%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%23333333%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E'}
            onError={(e) => { e.target.onerror = null; e.target.src="data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22600%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23cccccc%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224px%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%23333333%22%3EBroken%20Image%3C%2Ftext%3E%3C%2Fsvg%3E"; }}
            alt={product.name}
            style={{ width: '100%', borderRadius: '8px', objectFit: 'contain', backgroundColor: '#fff', border: '1px solid var(--border-color)' }}
          />
        </div>
        <div style={{ flex: '1 1 400px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {product.name}
            {product.offer_label && <span className="badge">{product.offer_label}</span>}
          </h2>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '1rem' }}>
            {product.discount_price ? (
               <>₹{product.discount_price} <span style={{ textDecoration: 'line-through', color: 'gray', fontSize: '1rem', marginLeft: '0.5rem' }}>₹{product.price}</span></>
            ) : (
               `₹${product.price}`
            )}
          </p>
          {product.categories?.name && (
            <p style={{ marginBottom: '1rem', color: 'gray' }}>Category: {product.categories.name}</p>
          )}
          <p style={{ marginBottom: '1.5rem', whiteSpace: 'pre-line' }}>{product.description}</p>

          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span>Status:</span>
              <span style={{ fontWeight: 'bold', color: product.stock > 0 ? 'green' : 'red' }}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {product.stock > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span>Qty: (₹{displayPrice} each)</span>
                <select
                  value={qty}
                  onChange={e => setQty(Number(e.target.value))}
                  style={{ padding: '0.5rem', borderRadius: '4px', width: '80px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-color)' }}
                >
                  {[...Array(Math.min(product.stock, 10)).keys()].map(x => (
                    <option key={x + 1} value={x + 1}>{x + 1}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
              disabled={product.stock === 0}
              onClick={addToCartHandler}
            >
              Add to Cart - ₹{displayPrice * qty}
            </button>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default ProductDetails;
