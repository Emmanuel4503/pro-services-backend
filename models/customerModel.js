const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  servicesInterested: {
    type: [String],
    required: [true, 'Please select at least one service'],
    enum: [
      'Search Engine Optimization (SEO)',
      'Social Media Marketing (SMM)',
      'Web Design & Development',
      'Content Creation',
      'Pay-Per-Click (PPC) Advertising',
      'Email Marketing',
      'Branding & Strategy',
      'Analytics & Reporting',
      'Google Business Profile Setup',
      'Influencer Marketing'
    ],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Please select at least one service'
    }
  },
  budget: {
    type: String,
    enum: ['Under $500', '$1,000 - $5,000', '$5,000 - $10,000', '$10,000 - $25,000', 'Over $25,000', 'Not sure yet'],
    default: 'Not sure yet'
  },
  message: {
    type: String,
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  howDidYouHear: {
    type: String,
    enum: ['Google Search', 'Social Media', 'Referral', 'Advertisement', 'Other'],
    default: 'Other'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const customerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(v) {
        const digitsOnly = v.replace(/\D/g, '');
        return /^[+]?[0-9\s\-().]{7,20}$/.test(v) && digitsOnly.length >= 7 && digitsOnly.length <= 15;
      },
      message: 'Please provide a valid international phone number (7-15 digits)'
    }
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  inquiries: [inquirySchema], // New array to store multiple inquiries
  isContacted: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'in-progress', 'converted', 'not-interested'],
    default: 'new'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
customerSchema.index({ status: 1 });
customerSchema.index({ createdAt: -1 });
customerSchema.index({ 'inquiries.createdAt': -1 }); // Index for sorting inquiries by creation date

// Virtual for full name
customerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON
customerSchema.set('toJSON', { virtuals: true });
customerSchema.set('toObject', { virtuals: true });

const Customer = mongoose.model('Customer', customerSchema);

module.exports = { Customer };