import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    switch (user.role) {
      case 'admin':
        return [
          { to: '/admin', label: 'Admin' },
          { to: '/dashboard', label: 'Dashboard' },
          { to: '/tables', label: 'Tables' },
          { to: '/menu', label: 'Menu' },
          { to: '/orders', label: 'Orders' },
          { to: '/kitchen', label: 'Kitchen' },
          { to: '/cashier', label: 'Cashier' }
        ];
      case 'manager':
        return [
          { to: '/dashboard', label: 'Dashboard' },
          { to: '/tables', label: 'Tables' },
          { to: '/menu', label: 'Menu' },
          { to: '/orders', label: 'Orders' }
        ];
      case 'waiter':
        return [
          { to: '/tables', label: 'Tables' },
          { to: '/orders', label: 'Orders' }
        ];
      case 'kitchen':
        return [
          { to: '/kitchen', label: 'Kitchen Display' }
        ];
      case 'cashier':
        return [
          { to: '/cashier', label: 'Cashier' }
        ];
      default:
        return [];
    }
  };

  return (
    <nav className="navbar bg-base-100 shadow-lg">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost normal-case text-xl font-bold">
          RAMADIA POS
        </Link>
      </div>
      
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {getNavLinks().map((link) => (
            <li key={link.to}>
              <Link to={link.to}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="navbar-end">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full bg-primary flex items-center justify-center text-primary-content font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </label>
          <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
            <li className="menu-title">
              <span className="text-base-content">{user.name}</span>
            </li>
            <li className="menu-title">
              <span className="text-sm text-base-content/70 capitalize">{user.role}</span>
            </li>
            <div className="divider my-0"></div>
            <li><a onClick={handleLogout}>Logout</a></li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;