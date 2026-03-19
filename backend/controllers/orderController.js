import Order from '../models/Order.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  try {
    const { orderItems, shippingAddress, totalPrice } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400).json({ message: 'No order items' });
      return;
    } else {
      const order = new Order({
        orderItems: orderItems.map((x) => ({
          ...x,
          product: x._id,
          _id: undefined,
        })),
        user: req.user._id,
        shippingAddress,
        totalPrice,
      });

      const createdOrder = await order.save();
      res.status(201).json(createdOrder);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error', stack: error.stack });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('orderItems.product', 'name _id').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error', stack: error.stack });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error', stack: error.stack });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error', stack: error.stack });
  }
};

// @desc    Get 5 most recent orders for dashboard
// @route   GET /api/orders/recent
// @access  Private/Admin
const getRecentOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 }).limit(5);
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error', stack: error.stack });
  }
};

// @desc    Get order analytics
// @route   GET /api/orders/analytics
// @access  Private/Admin
const getOrderAnalytics = async (req, res) => {
  try {
    // 1. Get total orders and total revenue
    const totals = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
        },
      },
    ]);

    // 2. Get revenue for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format the daily revenue to ensure all 7 days are represented, even if 0
    const formattedDailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];

      const found = dailyRevenue.find((x) => x._id === dateString);
      formattedDailyRevenue.push({
        date: dateString,
        revenue: found ? found.revenue : 0,
        orders: found ? found.orders : 0,
        displayDate: d.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }

    res.json({
      totalOrders: totals.length > 0 ? totals[0].totalOrders : 0,
      totalRevenue: totals.length > 0 ? totals[0].totalRevenue : 0,
      dailyData: formattedDailyRevenue,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error', stack: error.stack });
  }
};

export { addOrderItems, getMyOrders, getOrders, updateOrderToDelivered, getRecentOrders, getOrderAnalytics };
