const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { mockAIService } = require('../services/mockServices');
const auth = require('../middleware/auth');

// GET /api/orders/store/:storeSlug - Fetch store details for customer
router.get('/store/:storeSlug', async (req, res) => {
  try {
    const store = await User.findOne({ storeSlug: req.params.storeSlug }).select('storeName storeSlug');
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    res.json(store);
  } catch (error) {
    console.error('Error fetching store:', error);
    res.status(500).json({ error: 'Failed to fetch store' });
  }
});

// POST /api/orders/:storeSlug - Customer submits an order to a specific store
router.post('/:storeSlug', async (req, res) => {
  try {
    const store = await User.findOne({ storeSlug: req.params.storeSlug });
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const { customerName, mobileNumber, orderDescription } = req.body;

    // Simulate AI parsing
    const aiSummary = await mockAIService(orderDescription);

    const newOrder = new Order({
      storeId: store._id,
      customerName,
      mobileNumber,
      orderDescription,
      aiSummary,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET /api/orders - Get all pending orders (Protected: Only for the logged in store owner)
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ storeId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// PUT /api/orders/:id/accept - Accept an order (Protected)
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, storeId: req.user.id });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = 'accepted';
    // Dummy payment link simulation
    order.paymentLink = `https://pay.whatyapar.com/${order._id}`;
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).json({ error: 'Failed to accept order' });
  }
});

module.exports = router;
