const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const { mockAIService } = require('../services/mockServices');
const auth = require('../middleware/auth');

// ─── Fuzzy helpers ─────────────────────────────────────────────────────────

// Simple Levenshtein distance
const levenshtein = (a, b) => {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
};

// Normalize a name: lowercase, trim, strip trailing 's'/'es' for plurals
const normalize = (name) => {
  let n = name.toLowerCase().trim();
  if (n.endsWith('es') && n.length > 4) n = n.slice(0, -2); // boxes→box
  else if (n.endsWith('s') && n.length > 3) n = n.slice(0, -1);  // bananas→banana
  return n;
};

// Merge itemMap entries that are fuzzy-similar (edit distance ≤ 2)
// Keeps the entry with the highest totalQuantity as the canonical name
const fuzzyMergeItems = (itemMap) => {
  const keys = Object.keys(itemMap);
  const merged = {}; // canonical key → merged entry
  const assigned = {}; // key → canonical key

  keys.forEach(key => {
    if (assigned[key]) return;
    // This key starts a new group
    const normKey = normalize(key);
    merged[key] = { ...itemMap[key] };
    assigned[key] = key;

    keys.forEach(other => {
      if (other === key || assigned[other]) return;
      const normOther = normalize(other);
      const dist = levenshtein(normKey, normOther);
      // Merge if edit distance ≤ 2 OR one is a substring of the other (short names)
      const maxLen = Math.max(normKey.length, normOther.length);
      const threshold = maxLen <= 6 ? 1 : 2;
      if (dist <= threshold) {
        // Merge other into key
        merged[key].totalQuantity += itemMap[other].totalQuantity;
        merged[key].orderCount += itemMap[other].orderCount;
        if (!merged[key].unit && itemMap[other].unit) merged[key].unit = itemMap[other].unit;
        assigned[other] = key;
      }
    });
  });

  return merged;
};
// ───────────────────────────────────────────────────────────────────────────


// GET /api/orders/analytics - Dashboard analytics (Protected)
router.get('/analytics', auth, async (req, res) => {
  try {
    const storeId = new mongoose.Types.ObjectId(req.user.id);
    const allOrders = await Order.find({ storeId });

    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(o => o.status === 'Pending').length;
    const acceptedOrders = allOrders.filter(o => o.status === 'Accepted' || o.status === 'Paid').length;
    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.price || 0), 0);

    // --- Monthly data (last 6 months) ---
    const now = new Date();
    const monthly = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      const monthOrders = allOrders.filter(o => {
        const od = new Date(o.createdAt);
        return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
      });
      const pendingCount = monthOrders.filter(o => o.status === 'Pending').length;
      const acceptedCount = monthOrders.filter(o => o.status === 'Accepted' || o.status === 'Paid').length;
      const totalItemQty = monthOrders.reduce((sum, o) => {
        if (o.items && o.items.length > 0) {
          return sum + o.items.reduce((s, it) => s + (Number(it.quantity) || 1), 0);
        }
        return sum + 1;
      }, 0);
      monthly.push({
        label,
        orders: monthOrders.length,
        pending: pendingCount,
        accepted: acceptedCount,
        revenue: monthOrders.reduce((sum, o) => sum + (o.price || 0), 0),
        itemQty: totalItemQty,
      });
    }

    // --- Top items: sum QUANTITIES per item (AI-normalized English names) ---
    const itemMap = {};
    allOrders.forEach(order => {
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          // item is { name, quantity, unit }
          const key = item.name ? item.name.trim().toLowerCase() : null;
          if (!key || key.length < 2) return;
          if (!itemMap[key]) {
            itemMap[key] = { name: key, totalQuantity: 0, orderCount: 0, unit: item.unit || '' };
          }
          itemMap[key].totalQuantity += Number(item.quantity) || 1;
          itemMap[key].orderCount += 1;
          // Use the most common unit for display
          if (item.unit) itemMap[key].unit = item.unit;
        });
      } else {
        // Fallback for old string-based items or raw text
        const summary = (order.aiSummary || order.orderDescription || '')
          .replace(/^AI Parsed:\s*/i, '');
        summary.split(',').forEach(part => {
          const cleaned = part.trim().toLowerCase()
            .replace(/^\d+(\.\d+)?\s*(kg|g|litre|l|ml|piece|pcs|dozen|meter|m|roll|packet|pack|box)?\s*/i, '')
            .trim();
          if (cleaned.length > 2) {
            if (!itemMap[cleaned]) itemMap[cleaned] = { name: cleaned, totalQuantity: 0, orderCount: 0, unit: '' };
            itemMap[cleaned].totalQuantity += 1;
            itemMap[cleaned].orderCount += 1;
          }
        });
      }
    });

    // Apply fuzzy merge to group similar names (paracetomol = paracetamol, banana = bananas)
    const mergedItems = fuzzyMergeItems(itemMap);

    const topItems = Object.values(mergedItems)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10)
      .map(({ name, totalQuantity, orderCount, unit }) => ({ name, totalQuantity, orderCount, unit }));


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

    // AI returns { summary, items } — both used for storage
    const aiResult = await mockAIService(orderDescription);
    const aiSummary = typeof aiResult === 'string' ? aiResult : (aiResult.summary || orderDescription);
    const items = typeof aiResult === 'object' && Array.isArray(aiResult.items) ? aiResult.items : [];

    const newOrder = new Order({
      storeId: store._id,
      customerName,
      mobileNumber,
      orderDescription,
      aiSummary,
      items,
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
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const storeId = new mongoose.Types.ObjectId(req.user.id);
    const { price } = req.body;

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
      { status: 'Accepted', paymentLink, price: price || 0 },
      { new: true }
    );

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).json({ error: 'Failed to accept order' });
  }
});

module.exports = router;
