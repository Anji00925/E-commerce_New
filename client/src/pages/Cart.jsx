import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { setCartItems, removeFromCartSuccess } from '../features/cartSlice';
import { Trash } from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems, cartTotal } = useSelector(state => state.cart);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { data } = await api.get('/cart');
        dispatch(setCartItems(data || []));
      } catch (error) {
        toast.error('Failed to load cart');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [dispatch]);

  const removeFromCartHandler = async (productId) => {
    try {
      await api.delete(`/cart/${productId}`);
      dispatch(removeFromCartSuccess(productId));
      toast.success('Item removed');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  if (loading) {
    return <div className="flex-center" style={{ height: '50vh' }}><div className="loader"></div></div>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <div>
          <p style={{ marginBottom: '1rem' }}>Your cart is empty.</p>
          <Link to="/" className="btn btn-outline">Go Back</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 600px' }}>
            {cartItems.map(item => (
              <div key={item.id} className="card" style={{ display: 'flex', padding: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                <img 
                  src={item.products.image_url?.trim() ? item.products.image_url : 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22150%22%20height%3D%22150%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23cccccc%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216px%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%23333333%22%3ENo%20Img%3C%2Ftext%3E%3C%2Fsvg%3E'}
                  onError={(e) => { e.target.onerror = null; e.target.src="data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22150%22%20height%3D%22150%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23cccccc%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216px%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%23333333%22%3EBroken%3C%2Ftext%3E%3C%2Fsvg%3E"; }}
                  alt={item.products.name} 
                  style={{ width: '80px', height: '80px', objectFit: 'contain', marginRight: '1rem' }} 
                />
                <div style={{ flex: 1 }}>
                  <Link to={`/product/${item.product_id}`} style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.25rem' }}>
                    {item.products.name}
                  </Link>
                  <p style={{ color: 'var(--primary-color)' }}>₹{item.products.price}</p>
                </div>
                <div style={{ margin: '0 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span>Qty: {item.quantity}</span>
                  <button 
                    onClick={() => removeFromCartHandler(item.product_id)} 
                    style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}
                  >
                    <Trash size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ flex: '1 1 300px' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Order Summary</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <span>Total:</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.75rem' }}
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
