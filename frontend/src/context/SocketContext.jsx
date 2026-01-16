import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5002', {
        auth: {
          token
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        // Join role-based room
        newSocket.emit('join', user.role);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else if (socket) {
      socket.close();
      setSocket(null);
    }
  }, [user, token]);

  const joinTable = (tableId) => {
    if (socket) {
      socket.emit('join-table', tableId);
    }
  };

  const leaveTable = (tableId) => {
    if (socket) {
      socket.emit('leave-table', tableId);
    }
  };

  const emitOrderUpdate = (orderId) => {
    if (socket) {
      socket.emit('order-update', { orderId });
    }
  };

  const emitNewOrder = (orderId) => {
    if (socket) {
      socket.emit('new-order', { orderId });
    }
  };

  const emitSessionClosed = (tableId, sessionId) => {
    if (socket) {
      socket.emit('session-closed', { tableId, sessionId });
    }
  };

  const value = {
    socket,
    joinTable,
    leaveTable,
    emitOrderUpdate,
    emitNewOrder,
    emitSessionClosed
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};