const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { mockAIService, mockPaymentService } = require('../services/mockServices');

// POST /api/orders - Creates a new order and parses with mock AI
router.post('/', async (req, res) => {
  try {
    const { customerName, mobileNumber, orderDescription } = req.body;

    // 1. Get mock AI summary
    const aiSummary = await mockAIService(orderDescription);

    // 2. Save order to DB
    const newOrder = new Order({
      customerName,
      mobileNumber,
      orderDescription,
      aiSummary
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET /api/orders - Fetches all orders (for dashboard)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// PUT /api/orders/:id/accept - Accepts an order and generates mock payment link
router.put('/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'Pending') {
      return res.status(400).json({ error: `Order is already ${order.status}` });
    }

    // 2. Generate mock payment link
    const paymentLink = await mockPaymentService();

    // 3. Update order
    order.status = 'Accepted';
    order.paymentLink = paymentLink;
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).json({ error: 'Failed to accept order' });
  }
});

module.exports = router;
