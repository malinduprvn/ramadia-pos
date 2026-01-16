import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';

const Kitchen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { socket } = useSocket();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (socket) {
      // Join kitchen room
      socket.emit('join', 'kitchen');

      socket.on('new-order', (order) => {
        console.log('New order received:', order);
        setOrders(prev => [order, ...prev]);
      });

      socket.on('order-updated', (updatedOrder) => {
        console.log('Order updated:', updatedOrder);
        setOrders(prev => prev.map(order =>
          order._id === updatedOrder._id ? updatedOrder : order
        ));
      });
    }
  }, [socket]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/orders?status=pending&status=preparing&status=ready');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/orders/${orderId}/status`, { status: newStatus });
      // The socket will handle the UI update
    } catch (error) {
      alert('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'preparing': return 'badge-info';
      case 'ready': return 'badge-success';
      case 'served': return 'badge-neutral';
      default: return 'badge-ghost';
    }
  };

  const getStatusButton = (order) => {
    switch (order.status) {
      case 'pending':
        return (
          <button
            className="btn btn-info btn-sm"
            onClick={() => updateOrderStatus(order._id, 'preparing')}
          >
            Start Preparing
          </button>
        );
      case 'preparing':
        return (
          <button
            className="btn btn-success btn-sm"
            onClick={() => updateOrderStatus(order._id, 'ready')}
          >
            Mark Ready
          </button>
        );
      case 'ready':
        return (
          <button
            className="btn btn-neutral btn-sm"
            onClick={() => updateOrderStatus(order._id, 'served')}
          >
            Mark Served
          </button>
        );
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const orderTime = new Date(dateString);
    const diffInMinutes = Math.floor((now - orderTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-lg">Loading kitchen orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <h1 className="text-2xl sm:text-4xl font-bold text-primary">Kitchen Display System</h1>
          <div className="text-sm text-base-content/70">
            Real-time order management
          </div>
        </div>

        {/* Status Filter */}
        <div className="tabs tabs-boxed mb-6 overflow-x-auto">
          {['all', 'pending', 'preparing', 'ready'].map((status) => (
            <a
              key={status}
              className={`tab whitespace-nowrap ${filter === status ? 'tab-active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && (
                <span className="ml-2 badge badge-sm">
                  {orders.filter(order => order.status === status).length}
                </span>
              )}
            </a>
          ))}
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="card bg-base-100 shadow-xl border-l-4 border-l-primary">
              <div className="card-body">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="card-title text-lg">Order #{order._id.slice(-6)}</h2>
                    <p className="text-sm text-base-content/70">
                      {getTimeAgo(order.createdAt)}
                    </p>
                  </div>
                  <div className={`badge ${getStatusColor(order.status)} badge-lg`}>
                    {order.status.toUpperCase()}
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-2 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-base-200 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <span className="badge badge-primary badge-sm">{item.qty}</span>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold">${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="divider my-2"></div>

                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold">Total:</span>
                  <span className="text-lg font-bold text-primary">${order.totalAmount.toFixed(2)}</span>
                </div>

                {/* Action Button */}
                <div className="card-actions justify-end">
                  {getStatusButton(order)}
                </div>

                {/* Table Info */}
                {order.sessionId && (
                  <div className="mt-3 text-xs text-base-content/60 text-center">
                    Table Session: {order.sessionId._id.slice(-6)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-2xl font-bold text-base-content/70 mb-2">No Active Orders</h3>
            <p className="text-base-content/50">Orders will appear here in real-time as they're placed</p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat bg-base-100 rounded-lg shadow">
            <div className="stat-title">Total Orders</div>
            <div className="stat-value text-primary">{orders.length}</div>
          </div>
          <div className="stat bg-base-100 rounded-lg shadow">
            <div className="stat-title">Pending</div>
            <div className="stat-value text-warning">{orders.filter(o => o.status === 'pending').length}</div>
          </div>
          <div className="stat bg-base-100 rounded-lg shadow">
            <div className="stat-title">Preparing</div>
            <div className="stat-value text-info">{orders.filter(o => o.status === 'preparing').length}</div>
          </div>
          <div className="stat bg-base-100 rounded-lg shadow">
            <div className="stat-title">Ready</div>
            <div className="stat-value text-success">{orders.filter(o => o.status === 'ready').length}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kitchen;