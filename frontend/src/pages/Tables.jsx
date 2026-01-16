import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [session, setSession] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [existingOrders, setExistingOrders] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { joinTable, emitNewOrder } = useSocket();

  useEffect(() => {
    fetchTables();
    fetchMenuItems();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await axios.get('/tables');
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get('/menu');
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const openSession = async (tableId) => {
    try {
      const response = await axios.post('/tables/session/open', { tableId });
      setSession(response.data);
      setTables(tables.map(table =>
        table._id === tableId
          ? { ...table, status: 'occupied' }
          : table
      ));
      joinTable(tableId);
      alert('Table session opened successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to open session');
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
        // Get existing orders for this session
        const ordersResponse = await axios.get(`/orders/session/${activeSession._id}`);
        setExistingOrders(ordersResponse.data);
      }
    } catch (error) {
      console.error('Error fetching session/orders:', error);
    }
  };

  const addToOrder = (menuItem) => {
    const existingItem = currentOrder.find(item => item.menuItemId === menuItem._id);

    if (existingItem) {
      setCurrentOrder(currentOrder.map(item =>
        item.menuItemId === menuItem._id
          ? { ...item, qty: item.qty + 1 }
          : item
      ));
    } else {
      setCurrentOrder([...currentOrder, {
        menuItemId: menuItem._id,
        name: menuItem.name,
        qty: 1,
        price: menuItem.price
      }]);
    }
  };

  const updateQuantity = (menuItemId, newQty) => {
    if (newQty <= 0) {
      setCurrentOrder(currentOrder.filter(item => item.menuItemId !== menuItemId));
    } else {
      setCurrentOrder(currentOrder.map(item =>
        item.menuItemId === menuItemId
          ? { ...item, qty: newQty }
          : item
      ));
    }
  };

  const submitOrder = async () => {
    if (!session || currentOrder.length === 0) return;

    try {
      const response = await axios.post('/orders', {
        sessionId: session._id,
        items: currentOrder
      });

      // Add to existing orders
      setExistingOrders([...existingOrders, response.data]);

      // Emit socket event for real-time updates
      emitNewOrder(response.data._id);

      // Reset current order
      setCurrentOrder([]);
      setShowOrderForm(false);

      alert('Order submitted successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit order');
    }
  };

  const getCategories = () => {
    const categories = ['all', ...new Set(menuItems.map(item => item.category))];
    return categories;
  };

  const filteredMenuItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const getOrderTotal = (order) => {
    return order.items.reduce((total, item) => total + (item.price * item.qty), 0);
  };

  if (loading) {
    return <div className="text-center">Loading tables...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Tables</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {tables.map((table) => (
          <div key={table._id} className="card bg-base-100 shadow-xl">
            <div className="card-body p-4">
              <h2 className="card-title justify-center">Table {table.tableNumber}</h2>
              <div className={`badge ${table.status === 'free' ? 'badge-success' : 'badge-warning'}`}>
                {table.status}
              </div>
              {table.status === 'free' && (
                <button
                  className="btn btn-primary btn-sm mt-2"
                  onClick={() => openSession(table._id)}
                >
                  Open Table
                </button>
              )}
              {table.status === 'occupied' && (
                <button
                  className="btn btn-outline btn-sm mt-2"
                  onClick={() => selectTable(table)}
                >
                  Manage Orders
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedTable && (
        <div className="modal modal-open">
          <div className="modal-box max-w-6xl w-full mx-4">
            <h3 className="font-bold text-lg mb-4">Table {selectedTable.tableNumber} - Order Management</h3>

            <div className="flex gap-4 mb-6">
              <button
                className="btn btn-primary"
                onClick={() => setShowOrderForm(true)}
                disabled={!session}
              >
                Add New Order
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setSelectedTable(null);
                  setSession(null);
                  setExistingOrders([]);
                  setCurrentOrder([]);
                  setShowOrderForm(false);
                }}
              >
                Close
              </button>
            </div>

            {/* Existing Orders */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Current Orders</h4>
              {existingOrders.length === 0 ? (
                <p className="text-base-content/70">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {existingOrders.map((order) => (
                    <div key={order._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">Order #{order._id.slice(-6)}</span>
                        <div className={`badge ${order.status === 'served' ? 'badge-success' : order.status === 'ready' ? 'badge-info' : 'badge-warning'}`}>
                          {order.status}
                        </div>
                      </div>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.qty}x {item.name}</span>
                            <span>${(item.price * item.qty).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="divider my-2"></div>
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>${order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">Add Order for Table {selectedTable?.tableNumber}</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Menu Items */}
              <div>
                <div className="tabs tabs-boxed mb-4">
                  {getCategories().map((category) => (
                    <a
                      key={category}
                      className={`tab ${selectedCategory === category ? 'tab-active' : ''}`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </a>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                  {filteredMenuItems.filter(item => item.available).map((item) => (
                    <div key={item._id} className="card bg-base-100 shadow-sm">
                      <div className="card-body p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">{item.name}</h4>
                            <p className="text-sm text-base-content/70">{item.category}</p>
                            <p className="text-lg font-bold">${item.price}</p>
                          </div>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => addToOrder(item)}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Order */}
              <div>
                <h4 className="font-semibold mb-3">Current Order</h4>
                {currentOrder.length === 0 ? (
                  <p className="text-base-content/70">No items added yet</p>
                ) : (
                  <div className="space-y-2">
                    {currentOrder.map((item) => (
                      <div key={item.menuItemId} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <span className="text-sm text-base-content/70 ml-2">${item.price}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="btn btn-xs btn-circle"
                            onClick={() => updateQuantity(item.menuItemId, item.qty - 1)}
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{item.qty}</span>
                          <button
                            className="btn btn-xs btn-circle"
                            onClick={() => updateQuantity(item.menuItemId, item.qty + 1)}
                          >
                            +
                          </button>
                          <span className="ml-2">${(item.price * item.qty).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                    <div className="divider"></div>
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>${currentOrder.reduce((total, item) => total + (item.price * item.qty), 0).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={submitOrder}
                disabled={currentOrder.length === 0}
              >
                Submit Order
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setCurrentOrder([]);
                  setShowOrderForm(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tables;