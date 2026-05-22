const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
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
    default: '',
  },
  items: {
    type: [String],
    default: [],
  },
  paymentLink: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Paid'],
    default: 'Pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
