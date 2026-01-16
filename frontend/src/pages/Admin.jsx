import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [tables, setTables] = useState([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showTableForm, setShowTableForm] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'waiter'
  });
  const [tableForm, setTableForm] = useState({ tableNumber: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, tablesRes] = await Promise.all([
        axios.get('/users'),
        axios.get('/tables')
      ]);
      setUsers(usersRes.data);
      setTables(tablesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/users', userForm);
      fetchData();
      setShowUserForm(false);
      setUserForm({ name: '', email: '', password: '', role: 'waiter' });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create user');
    }
  };

  const createTable = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/tables', tableForm);
      fetchData();
      setShowTableForm(false);
      setTableForm({ tableNumber: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create table');
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/users/${id}`);
        fetchData();
      } catch (error) {
        alert('Failed to delete user');
      }
    }
  };

  const deleteTable = async (id) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      try {
        await axios.delete(`/tables/${id}`);
        fetchData();
      } catch (error) {
        alert('Failed to delete table');
      }
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Management */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">Users</h2>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setShowUserForm(true)}
              >
                Add User
              </button>
            </div>
            
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user._id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-base-content/70">{user.email} - {user.role}</p>
                  </div>
                  <button 
                    className="btn btn-error btn-xs"
                    onClick={() => deleteUser(user._id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Tables Management */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">Tables</h2>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setShowTableForm(true)}
              >
                Add Table
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {tables.map((table) => (
                <div key={table._id} className="flex justify-between items-center p-2 border rounded">
                  <span>Table {table.tableNumber}</span>
                  <div className="flex gap-1">
                    <div className={`badge ${table.status === 'free' ? 'badge-success' : 'badge-warning'}`}>
                      {table.status}
                    </div>
                    <button 
                      className="btn btn-error btn-xs"
                      onClick={() => deleteTable(table._id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* User Form Modal */}
      {showUserForm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Add New User</h3>
            <form onSubmit={createUser}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={userForm.name}
                  onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered"
                  value={userForm.password}
                  onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Role</span>
                </label>
                <select
                  className="select select-bordered"
                  value={userForm.role}
                  onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                >
                  <option value="waiter">Waiter</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="modal-action">
                <button type="submit" className="btn btn-primary">Create User</button>
                <button 
                  type="button" 
                  className="btn btn-ghost"
                  onClick={() => setShowUserForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Table Form Modal */}
      {showTableForm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Add New Table</h3>
            <form onSubmit={createTable}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Table Number</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={tableForm.tableNumber}
                  onChange={(e) => setTableForm({...tableForm, tableNumber: e.target.value})}
                  required
                />
              </div>
              
              <div className="modal-action">
                <button type="submit" className="btn btn-primary">Create Table</button>
                <button 
                  type="button" 
                  className="btn btn-ghost"
                  onClick={() => setShowTableForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;