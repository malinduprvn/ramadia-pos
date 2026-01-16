import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Welcome</h2>
            <p>Hello, {user.name}!</p>
            <p className="text-sm text-base-content/70 capitalize">Role: {user.role}</p>
          </div>
        </div>
        
        <div className="card bg-primary text-primary-content shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Tables</h2>
            <p>Manage restaurant tables</p>
          </div>
        </div>
        
        <div className="card bg-secondary text-secondary-content shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Orders</h2>
            <p>View and manage orders</p>
          </div>
        </div>
        
        <div className="card bg-accent text-accent-content shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Menu</h2>
            <p>Manage menu items</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;