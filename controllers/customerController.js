const { Customer } = require('../models/customerModel');

// Create or update a customer inquiry
const createCustomer = async (req, res) => {
  try {
    const customerData = req.body;

    // Prepare the inquiry object
    const newInquiry = {
      servicesInterested: customerData.servicesInterested,
      budget: customerData.budget || 'Not sure yet',
      message: customerData.message || undefined,
      howDidYouHear: customerData.howDidYouHear || 'Other',
      createdAt: new Date(),
    };

    // Prepare customer-level data
    const customerUpdate = {
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      phone: customerData.phone,
      company: customerData.company || undefined,
    };

    // Check if customer with email exists
    const existingCustomer = await Customer.findOne({ email: customerData.email });

    let customer;
    let isNew = false;

    if (existingCustomer) {
      // Update existing customer: append new inquiry and update customer-level fields
      customer = await Customer.findOneAndUpdate(
        { email: customerData.email },
        {
          $set: customerUpdate,
          $push: { inquiries: newInquiry },
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new customer with the inquiry
      customer = await Customer.create({
        ...customerUpdate,
        email: customerData.email,
        inquiries: [newInquiry],
      });
      isNew = true;
    }

    // Return response
    const statusCode = isNew ? 201 : 200;
    const message = isNew ? 'Customer inquiry created successfully' : 'Customer inquiry added successfully';

    res.status(statusCode).json({
      success: true,
      message,
      data: customer,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to process customer inquiry',
      error: error.message,
    });
  }
};

// Get all customers with optional filtering
const getAllCustomers = async (req, res) => {
  try {
    const { status, servicesInterested, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (servicesInterested) {
      query['inquiries.servicesInterested'] = { $in: [servicesInterested] };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Customer.countDocuments(query);

    res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers',
      error: error.message,
    });
  }
};

// Get a single customer by ID
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer',
      error: error.message,
    });
  }
};

// Update customer status or information
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Prevent updating email to an existing one
    if (updateData.email) {
      const existingCustomer = await Customer.findOne({ 
        email: updateData.email,
        _id: { $ne: id },
      });
      
      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use by another customer',
        });
      }
    }

    const customer = await Customer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true },
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update customer',
      error: error.message,
    });
  }
};

// Delete a customer
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete customer',
      error: error.message,
    });
  }
};

// Get customer statistics
const getCustomerStats = async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const statusStats = await Customer.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const serviceStats = await Customer.aggregate([
      { $unwind: '$inquiries' },
      { $unwind: '$inquiries.servicesInterested' },
      {
        $group: {
          _id: '$inquiries.servicesInterested',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        statusBreakdown: statusStats,
        popularServices: serviceStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message,
    });
  }
};

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
};