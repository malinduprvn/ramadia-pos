# RAMADIA Restaurant POS System

A professional Restaurant Point of Sale system built with MERN Stack (MongoDB, Express.js, React, Node.js) featuring real-time updates using Socket.IO.

## Features

- **Multi-role System**: Admin, Manager, Waiter, Kitchen, Cashier
- **Table Sessions**: Manage customer sessions per table
- **Real-time Updates**: Live order status updates between waiter, kitchen, and cashier
- **Kitchen Display Screen (KDS)**: Real-time order management
- **Billing System**: Comprehensive invoicing and payment processing
- **Responsive Design**: Works on tablets and desktops

## Tech Stack

- **Frontend**: React, Tailwind CSS, DaisyUI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-time**: Socket.IO
- **Authentication**: JWT

## Installation

1. Clone the repository
2. Run the setup script:
   ```bash
   setup.bat
   ```
   Or manually install dependencies:
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. Set up MongoDB and update the connection string in `backend/.env`

4. Seed the database with demo data:
   ```bash
   cd backend && npm run seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

- Access the application at `http://localhost:3000`
- Backend API at `http://localhost:5000`

## Demo Accounts

- **Admin**: admin@ramadia.com / admin123
- **Waiter**: waiter@ramadia.com / waiter123
- **Kitchen**: kitchen@ramadia.com / kitchen123
- **Cashier**: cashier@ramadia.com / cashier123

## Project Structure

```
ramadia/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── utils/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── utils/
│   └── public/
└── package.json
```

## License

ISC