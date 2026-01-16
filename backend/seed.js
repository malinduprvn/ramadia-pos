require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Table = require('./src/models/Table');
const MenuItem = require('./src/models/MenuItem');
const connectDB = require('./src/config/database');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Table.deleteMany();
    await MenuItem.deleteMany();

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@ramadia.com',
      password: 'admin123',
      role: 'admin'
    });

    // Create demo users
    const users = await User.create([
      {
        name: 'Waiter One',
        email: 'waiter@ramadia.com',
        password: 'waiter123',
        role: 'waiter'
      },
      {
        name: 'Kitchen Staff',
        email: 'kitchen@ramadia.com',
        password: 'kitchen123',
        role: 'kitchen'
      },
      {
        name: 'Cashier',
        email: 'cashier@ramadia.com',
        password: 'cashier123',
        role: 'cashier'
      }
    ]);

    // Create tables
    const tables = [];
    for (let i = 1; i <= 10; i++) {
      tables.push(await Table.create({ tableNumber: i }));
    }

    // Create menu items
    const menuItems = await MenuItem.create([
      { name: 'Margherita Pizza', price: 12.99, category: 'Pizza', available: true },
      { name: 'Pepperoni Pizza', price: 14.99, category: 'Pizza', available: true },
      { name: 'Caesar Salad', price: 8.99, category: 'Salads', available: true },
      { name: 'Grilled Chicken', price: 16.99, category: 'Main Course', available: true },
      { name: 'Pasta Carbonara', price: 13.99, category: 'Pasta', available: true },
      { name: 'Chocolate Cake', price: 6.99, category: 'Desserts', available: true },
      { name: 'Coffee', price: 2.99, category: 'Beverages', available: true },
      { name: 'Coke', price: 2.49, category: 'Beverages', available: true }
    ]);

    console.log('Database seeded successfully!');
    console.log('Admin login: admin@ramadia.com / admin123');
    console.log('Demo users created with passwords ending in 123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();