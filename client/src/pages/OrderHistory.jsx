import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import PageTransition from '../components/PageTransition';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/myorders');
        setOrders(data);
      } catch (error) {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <div className="flex-center" style={{ height: '50vh' }}><div className="loader"></div></div>;
  }

  return (
    <PageTransition>
      <div>
      <h2 style={{ marginBottom: '2rem' }}>My Orders</h2>
      {orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {orders.map(order => (
            <div key={order.id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <p style={{ fontWeight: 'bold' }}>Order ID: {order.id}</p>
                  <p style={{ fontSize: '0.875rem', color: 'gray' }}>{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 'bold' }}>Total: ₹{order.total}</p>
                  <p>
                    Status: <span style={{ 
                      color: order.status === 'Delivered' ? 'green' : (order.status === 'Cancelled' ? 'red' : 'orange'),
                      fontWeight: 'bold'
                    }}>{order.status}</span>
                  </p>
                  <p style={{ fontSize: '0.875rem' }}>Payment: {order.payment_status}</p>
                </div>
              </div>

              <div>
                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Items:</strong>
                {order.order_items.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <img src={item.products.image_url?.trim() ? item.products.image_url : 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2250%22%20height%3D%2250%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23cccccc%22%2F%3E%3C%2Fsvg%3E'} onError={(e) => { e.target.onerror = null; e.target.src="data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2250%22%20height%3D%2250%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23cccccc%22%2F%3E%3C%2Fsvg%3E"; }} alt="product" style={{ width: '40px', height: '40px', objectFit: 'contain', marginRight: '1rem' }} />
                    <span style={{ flex: 1 }}>{item.products.name} (x{item.quantity})</span>
                    <span>₹{item.price_at_purchase}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </PageTransition>
  );
};

export default OrderHistory;
