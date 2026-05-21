const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const { mockAIService } = require('../services/mockServices');
const auth = require('../middleware/auth');

// GET /api/orders/analytics - Dashboard analytics (Protected)
router.get('/analytics', auth, async (req, res) => {
  try {
    const storeId = new mongoose.Types.ObjectId(req.user.id);

    // --- Stats ---
    const allOrders = await Order.find({ storeId });
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(o => o.status === 'Pending').length;
    const acceptedOrders = allOrders.filter(o => o.status === 'Accepted' || o.status === 'Paid').length;
    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.price || 0), 0);

    // --- Monthly data for last 6 months ---
    const now = new Date();
    const monthly = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      const monthOrders = allOrders.filter(o => {
        const od = new Date(o.createdAt);
        return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
      });
      monthly.push({
        label,
        orders: monthOrders.length,
        revenue: monthOrders.reduce((sum, o) => sum + (o.price || 0), 0),
      });
    }

    // --- Top items (parse from AI summaries) ---
    const itemMap = {};
    allOrders.forEach(order => {
      const summary = order.aiSummary || order.orderDescription || '';
      // Remove the "AI Parsed:" prefix if present
      const cleaned = summary.replace(/^AI Parsed:\s*/i, '');
      cleaned.split(',').forEach(item => {
        const trimmed = item.trim().toLowerCase();
        if (trimmed.length > 1) {
          itemMap[trimmed] = (itemMap[trimmed] || 0) + 1;
        }
      });
    });
    const topItems = Object.entries(itemMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    // --- Customer directory ---
    const customerMap = {};
    allOrders.forEach(order => {
      const key = order.mobileNumber;
      if (!customerMap[key]) {
        customerMap[key] = {
          name: order.customerName,
          mobile: order.mobileNumber,
          orders: 0,
          totalSpend: 0,
          lastOrder: order.createdAt,
        };
      }
      customerMap[key].orders += 1;
      customerMap[key].totalSpend += order.price || 0;
      if (new Date(order.createdAt) > new Date(customerMap[key].lastOrder)) {
        customerMap[key].lastOrder = order.createdAt;
      }
    });
    const customers = Object.values(customerMap).sort((a, b) => b.orders - a.orders);

    res.json({ totalOrders, pendingOrders, acceptedOrders, totalRevenue, monthly, topItems, customers });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /api/orders/store/:storeSlug - Fetch store details for customer (PUBLIC)
router.get('/store/:storeSlug', async (req, res) => {
  try {
    const store = await User.findOne({ storeSlug: req.params.storeSlug }).select('storeName storeSlug');
    if (!store) return res.status(404).json({ error: 'Store not found' });
    res.json(store);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch store' });
  }
});

// POST /api/orders/:storeSlug - Customer submits an order (PUBLIC)
router.post('/:storeSlug', async (req, res) => {
  try {
    const store = await User.findOne({ storeSlug: req.params.storeSlug });
    if (!store) return res.status(404).json({ error: 'Store not found' });

    const { customerName, mobileNumber, orderDescription } = req.body;
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

// GET /api/orders - Get all orders for the logged-in store (Protected)
router.get('/', auth, async (req, res) => {
  try {
    const storeId = new mongoose.Types.ObjectId(req.user.id);
    const orders = await Order.find({ storeId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// PUT /api/orders/:id/accept - Accept an order with price (Protected)
// BUG FIX: Use findByIdAndUpdate + explicit ObjectId cast to avoid string vs ObjectId mismatch
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const storeId = new mongoose.Types.ObjectId(req.user.id);
    const { price } = req.body;

    // First verify the order belongs to this store
    const existing = await Order.findOne({
      _id: new mongoose.Types.ObjectId(req.params.id),
      storeId,
    });

    if (!existing) {
      return res.status(404).json({ error: 'Order not found or not yours' });
    }

    const paymentLink = `https://pay.whatyapar.com/${existing._id}`;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Accepted',
        paymentLink,
        price: price || 0,
      },
      { new: true }
    );

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).json({ error: 'Failed to accept order' });
  }
});

module.exports = router;
