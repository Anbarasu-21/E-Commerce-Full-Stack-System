import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOrders, updateOrderStatus, cancelOrder } from '../services/api';

const Orders = () => {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const statusOptions = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getOrders();
      if (response.data && response.data.success) {
        const sorted = response.data.data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        setOrders(sorted);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await updateOrderStatus(orderId, newStatus);
      if (response.data && response.data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleCancelOrder = async (orderId, currentStatus) => {
    if (currentStatus === 'SHIPPED' || currentStatus === 'DELIVERED') {
      alert('This order cannot be cancelled — it has already been shipped or delivered.');
      return;
    }
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        const response = await cancelOrder(orderId);
        if (response.data && response.data.success) {
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
          alert('Order cancelled successfully.');
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to cancel order');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadgeClass = (status) => `badge badge-${status.toLowerCase()}`;

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <h1 className="page-title">{isAdmin() ? 'Manage Customer Orders' : 'My Order History'}</h1>

      {orders.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
            No orders found.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {orders.map((order) => (
            <div key={order.id} className="glass-panel" style={{ padding: '32px' }}>
              {/* Order Header */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '20px',
                marginBottom: '20px',
                gap: '16px'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '6px' }}>
                    Order ID: #{order.id}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Placed on: {formatDate(order.orderDate)} | Customer:{' '}
                    <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{order.customerName}</span>
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  {/* Admin: dropdown to change status */}
                  {isAdmin() ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Status:</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        style={{ padding: '6px 12px', fontSize: '0.85rem', width: '160px' }}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    /* Customer: badge + cancel button */
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className={getStatusBadgeClass(order.status)}>
                        {order.status}
                      </span>
                      {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && order.status !== 'SHIPPED' && (
                        <button
                          className="btn btn-danger"
                          style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                          onClick={() => handleCancelOrder(order.id, order.status)}
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  )}

                  <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)' }}>
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Items Ordered
                </h4>
                {order.orderItems.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    fontSize: '0.95rem'
                  }}>
                    <div>
                      <span style={{ fontWeight: '500' }}>{item.productName}</span>
                      <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>(x{item.quantity})</span>
                    </div>
                    <span style={{ fontWeight: '600' }}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
