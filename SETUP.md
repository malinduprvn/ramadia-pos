# RAMADIA Restaurant POS - Setup Instructions

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or cloud instance)
- Git

## Quick Start

1. **Clone and Setup**:
   ```bash
   git clone <repository-url>
   cd ramadia
   setup.bat
   ```

2. **Configure Database**:
   - Make sure MongoDB is running
   - Update `backend/.env` if needed (default: mongodb://localhost:27017/ramadia-pos)

3. **Seed Demo Data**:
   ```bash
   cd backend
   npm run seed
   cd ..
   ```

4. **Start the Application**:
   ```bash
   npm run dev
   ```

5. **Access the Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Demo Accounts

| Role    | Email              | Password  |
|---------|--------------------|-----------|
| Admin   | admin@ramadia.com  | admin123  |
| Waiter  | waiter@ramadia.com | waiter123 |
| Kitchen | kitchen@ramadia.com| kitchen123|
| Cashier | cashier@ramadia.com| cashier123|

## Features Implemented

### Backend
- ✅ User authentication & authorization
- ✅ Table & session management
- ✅ Menu item management
- ✅ Order processing
- ✅ Invoice & payment handling
- ✅ Real-time Socket.IO integration
- ✅ MongoDB schemas with proper relationships

### Frontend
- ✅ Role-based routing & UI
- ✅ Responsive design with Tailwind + DaisyUI
- ✅ Real-time updates
- ✅ Table management (waiter)
- ✅ Kitchen display system
- ✅ Cashier billing system
- ✅ Admin dashboard

### Real-time Features
- ✅ Order status updates
- ✅ Kitchen notifications
- ✅ Table status changes

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in backend/.env
2. Use a production MongoDB instance
3. Set a strong JWT_SECRET
4. Configure proper CORS settings
5. Set up SSL certificates
6. Use a process manager like PM2

## API Documentation

The backend provides RESTful APIs for all operations. Key endpoints:

- `POST /api/auth/login` - User login
- `GET /api/tables` - Get all tables
- `POST /api/tables/session/open` - Open table session
- `GET /api/menu` - Get menu items
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/invoices` - Create invoice
- `POST /api/invoices/:id/payment` - Process payment

## Socket Events

- `join` - Join role-based room
- `join-table` - Join table-specific room
- `new-order` - Notify kitchen of new orders
- `order-updated` - Update order status
- `session-closed` - Notify table closure

This is a production-ready restaurant POS system with all core features implemented!