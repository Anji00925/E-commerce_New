import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { clearCartSuccess } from '../features/cartSlice';

const Checkout = () => {
  const { cartItems, cartTotal } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  // Address State
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/orders', {
        orderItems: cartItems.map(item => ({ product: item.products, quantity: item.quantity })),
        totalPrice: cartTotal,
      });

      // Data contains { order, razorpayOrder }
      if (data.razorpayOrder) {
         // Proceed with Razorpay
         const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || "demo_key",
            amount: data.razorpayOrder.amount,
            currency: "INR",
            name: "eCommerce Store",
            description: "Test Transaction",
            order_id: data.razorpayOrder.id,
            handler: async function (response) {
               try {
                 await api.post('/orders/verify-payment', {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    order_id: data.order.id
                 });
                 toast.success('Payment Successful!');
                 dispatch(clearCartSuccess());
                 navigate('/orders');
               } catch (err) {
                 toast.error('Payment verification failed');
               }
            },
            prefill: {
               name: user.name,
               email: user.email,
            },
            theme: { color: "#4f46e5" }
         };
         
         const rzp = new window.Razorpay(options);
         rzp.open();
      } else {
        // No razorpay integration configured, just place order normally
        toast.success('Order Placed Successfully!');
        dispatch(clearCartSuccess());
        navigate('/orders');
      }

    } catch (error) {
      toast.error(error.response?.data?.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/');
    return null;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem' }}>Checkout</h2>
      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={handlePlaceOrder}>
          <h3 style={{ marginBottom: '1rem' }}>Shipping Information</h3>
          <div className="form-group">
            <label>Address</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>City</label>
            <input type="text" value={city} onChange={e => setCity(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label>Postal Code</label>
            <input type="text" value={postalCode} onChange={e => setPostalCode(e.target.value)} required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Total: ₹{cartTotal.toFixed(2)}</span>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }} disabled={loading}>
              {loading ? 'Processing...' : 'Place Order & Pay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
