const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  orderDescription: {
    type: String,
    required: true,
  },
  aiSummary: {
    type: String,
    default: "",
  },
  paymentLink: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Paid'],
    default: 'Pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
