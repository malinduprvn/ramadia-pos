import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Cashier = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [session, setSession] = useState(null);
  const [orders, setOrders] = useState([]);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOccupiedTables();
  }, []);

  const fetchOccupiedTables = async () => {
    try {
      const response = await axios.get('/tables');
      const occupiedTables = response.data.filter(table => table.status === 'occupied');
      setTables(occupiedTables);
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectTable = async (table) => {
    setSelectedTable(table);
    try {
      // Get active session for this table
      const sessionResponse = await axios.get(`/tables/${table._id}/sessions`);
      const activeSession = sessionResponse.data.find(s => s.status === 'open');
      
      if (activeSession) {
        setSession(activeSession);
        // Get orders for this session
        const ordersResponse = await axios.get(`/orders/session/${activeSession._id}`);
        setOrders(ordersResponse.data);
      }
    } catch (error) {
      console.error('Error fetching session/orders:', error);
    }
  };

  const createInvoice = async () => {
    try {
      const response = await axios.post('/invoices', { sessionId: session._id });
      setInvoice(response.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create invoice');
    }
  };

  const processPayment = async (method) => {
    try {
      await axios.post(`/invoices/${invoice._id}/payment`, { 
        method, 
        amount: invoice.finalAmount 
      });
      
      // Close the session
      await axios.put(`/tables/session/${session._id}/close`);
      
      // Reset state
      setSelectedTable(null);
      setSession(null);
      setOrders([]);
      setInvoice(null);
      
      // Refresh tables
      fetchOccupiedTables();
      
      alert('Payment processed successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to process payment');
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Cashier</h1>
      
      {!selectedTable ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Select a Table to Bill</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {tables.map((table) => (
              <div 
                key={table._id} 
                className="card bg-warning shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
                onClick={() => selectTable(table)}
              >
                <div className="card-body p-4 text-center">
                  <h3 className="card-title justify-center">Table {table.tableNumber}</h3>
                  <p className="text-sm">Occupied</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Table {selectedTable.tableNumber}</h2>
            <button 
              className="btn btn-ghost"
              onClick={() => {
                setSelectedTable(null);
                setSession(null);
                setOrders([]);
                setInvoice(null);
              }}
            >
              Back to Tables
            </button>
          </div>
          
          {orders.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">Orders</h3>
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="border rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold">Order #{order._id.slice(-6)}</span>
                          <span className={`badge ${order.status === 'served' ? 'badge-success' : 'badge-warning'}`}>
                            {order.status}
                          </span>
                        </div>
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.qty}x {item.name}</span>
                            <span>${(item.price * item.qty).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="divider my-2"></div>
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>${order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">Billing</h3>
                  
                  {!invoice ? (
                    <div>
                      <p className="mb-4">Total Orders: {orders.length}</p>
                      <p className="text-lg font-semibold mb-6">
                        Total Amount: ${orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}
                      </p>
                      <button 
                        className="btn btn-primary w-full"
                        onClick={createInvoice}
                      >
                        Generate Invoice
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${invoice.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>${invoice.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Discount:</span>
                          <span>-${invoice.discount.toFixed(2)}</span>
                        </div>
                        <div className="divider"></div>
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total:</span>
                          <span>${invoice.finalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <button 
                          className="btn btn-success w-full"
                          onClick={() => processPayment('cash')}
                        >
                          Pay with Cash
                        </button>
                        <button 
                          className="btn btn-info w-full"
                          onClick={() => processPayment('card')}
                        >
                          Pay with Card
                        </button>
                        <button 
                          className="btn btn-secondary w-full"
                          onClick={() => processPayment('qr')}
                        >
                          Pay with QR
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-info">
              <span>No orders found for this table.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Cashier;