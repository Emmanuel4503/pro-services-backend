const express = require('express');
const {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerStats
} = require('../controllers/customerController');

const customerRouter = express.Router();

// Create a new customer inquiry
customerRouter.post('/', createCustomer);

// Get all customers with optional filtering
customerRouter.get('/', getAllCustomers);

// Get customer statistics
customerRouter.get('/stats', getCustomerStats);

// Get a single customer by ID
customerRouter.get('/:id', getCustomerById);

// Update customer information
customerRouter.put('/:id', updateCustomer);

// Partially update customer (can use PATCH for partial updates)
customerRouter.patch('/:id', updateCustomer);

// Delete a customer
customerRouter.delete('/:id', deleteCustomer);

module.exports = { customerRouter };