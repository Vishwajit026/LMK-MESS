const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  budget: {
    type: String,
    required: true
  },
  propertyType: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  timeline: {
    type: String,
    required: true
  },
  requirements: {
    type: String
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Interested', 'Closed'],
    default: 'New'
  },
  score: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
