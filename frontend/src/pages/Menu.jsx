import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    available: true
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get('/menu');
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axios.put(`/menu/${editingItem._id}`, formData);
      } else {
        await axios.post('/menu', formData);
      }
      fetchMenuItems();
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save menu item');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', category: '', available: true });
    setEditingItem(null);
    setShowForm(false);
  };

  const editItem = (item) => {
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category,
      available: item.available
    });
    setEditingItem(item);
    setShowForm(true);
  };

  const deleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`/menu/${id}`);
        fetchMenuItems();
      } catch (error) {
        alert('Failed to delete menu item');
      }
    }
  };

  if (loading) {
    return <div className="text-center">Loading menu...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Add Menu Item
        </button>
      </div>

      {showForm && (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">{editingItem ? 'Edit' : 'Add'} Menu Item</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Name</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Price</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input input-bordered"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Category</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Available</span>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({...formData, available: e.target.checked})}
                    />
                  </label>
                </div>
              </div>
              
              <div className="form-control mt-6">
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    {editingItem ? 'Update' : 'Add'} Item
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={resetForm}>
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div key={item._id} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">{item.name}</h2>
              <p className="text-lg font-semibold">${item.price}</p>
              <p className="text-sm text-base-content/70">{item.category}</p>
              <div className="card-actions justify-end">
                <div className={`badge ${item.available ? 'badge-success' : 'badge-error'}`}>
                  {item.available ? 'Available' : 'Unavailable'}
                </div>
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => editItem(item)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-sm btn-error"
                  onClick={() => deleteItem(item._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;