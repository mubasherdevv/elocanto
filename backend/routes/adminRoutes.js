import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Ad from '../models/Ad.js';
import Report from '../models/Report.js';
import Settings from '../models/Settings.js';
import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import ActivityLog from '../models/ActivityLog.js';

const router = express.Router();

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
router.get('/analytics', protect, admin, async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalAds = await Ad.countDocuments();
  const totalSubcategories = await Subcategory.countDocuments();
  const activeAds = await Ad.countDocuments({ isActive: true });
  const inactiveAds = await Ad.countDocuments({ isActive: false });
  const featuredAds = await Ad.countDocuments({ isFeatured: true });
  const pendingAds = await Ad.countDocuments({ isApproved: false });
  const reportedAds = await Report.countDocuments({ status: 'pending' });

  // Mock data for charts (to be replaced by real aggregation if needed)
  const activityData = [
    { name: 'Mon', ads: 12, users: 4 },
    { name: 'Tue', ads: 19, users: 3 },
    { name: 'Wed', ads: 15, users: 8 },
    { name: 'Thu', ads: 22, users: 5 },
    { name: 'Fri', ads: 30, users: 10 },
    { name: 'Sat', ads: 25, users: 12 },
    { name: 'Sun', ads: 18, users: 7 },
  ];

  const categoryData = await Ad.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'categoryInfo' } },
    { $unwind: '$categoryInfo' },
    { $project: { name: '$categoryInfo.name', value: '$count' } }
  ]);

  res.json({
    stats: {
      totalUsers,
      totalAds,
      totalSubcategories,
      activeAds,
      inactiveAds,
      featuredAds,
      galleryAds: featuredAds, // Equivalent for now based on UI representation
      pendingAds,
      reportedAds,
    },
    activityData,
    categoryData
  });
});

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private/Admin
router.get('/reports', protect, admin, async (req, res) => {
  const reports = await Report.find({})
    .populate('reporter', 'name email')
    .populate('ad', 'title images price');
  res.json(reports);
});

// @desc    Update report status
// @route   PUT /api/admin/reports/:id
// @access  Private/Admin
router.put('/reports/:id', protect, admin, async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (report) {
    const oldStatus = report.status;
    report.status = req.body.status || report.status;
    report.adminNotes = req.body.adminNotes || report.adminNotes;
    const updatedReport = await report.save();
    
    await ActivityLog.create({
      adminId: req.user._id,
      actionType: 'UPDATE_SETTINGS',
      description: `Updated report status from ${oldStatus} to ${report.status}`,
      targetType: 'Report'
    });
    
    res.json(updatedReport);
  } else {
    res.status(404);
    throw new Error('Report not found');
  }
});

// @desc    Get site settings
// @route   GET /api/admin/settings
// @access  Private/Admin
router.get('/settings', protect, admin, async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  res.json(settings);
});

// @desc    Update site settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
router.put('/settings', protect, admin, async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: req.body },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );
    
    await ActivityLog.create({
      adminId: req.user._id,
      actionType: 'UPDATE_SETTINGS',
      description: 'Updated site settings',
      targetType: 'Settings'
    });
    
    res.json(settings);
  } catch (error) {
    res.status(400);
    throw new Error(error.message || 'Failed to update settings');
  }
});

// @desc    Auto update all active ads duration based on settings
// @route   POST /api/admin/update-ads-duration
// @access  Private/Admin
router.post('/update-ads-duration', protect, admin, async (req, res) => {
  try {
    const settings = await Settings.findOne({});
    if (!settings) {
      return res.status(400).json({ message: 'Settings not found' });
    }

    const simpleDuration = settings.simpleAdsDuration || 30;
    const featuredDuration = settings.featuredAdsDuration || 7;

    let simpleCount = 0;
    let featuredCount = 0;

    // Update simple ads
    const simpleAds = await Ad.find({ adType: 'simple', isActive: true });
    for (const ad of simpleAds) {
      ad.expiresAt = new Date(ad.createdAt.getTime() + simpleDuration * 24 * 60 * 60 * 1000);
      await ad.save();
      simpleCount++;
    }

    // Update featured ads
    const featuredAds = await Ad.find({ adType: 'featured', isActive: true });
    for (const ad of featuredAds) {
      ad.expiresAt = new Date(ad.createdAt.getTime() + featuredDuration * 24 * 60 * 60 * 1000);
      await ad.save();
      featuredCount++;
    }

    // Update ads with listingType simple (not adType)
    const listingSimpleAds = await Ad.find({ listingType: 'simple', isActive: true, adType: { $ne: 'simple' } });
    for (const ad of listingSimpleAds) {
      ad.expiresAt = new Date(ad.createdAt.getTime() + simpleDuration * 24 * 60 * 60 * 1000);
      await ad.save();
      simpleCount++;
    }

    // Update ads with listingType featured (not adType)
    const listingFeaturedAds = await Ad.find({ listingType: 'featured', isActive: true, adType: { $ne: 'featured' } });
    for (const ad of listingFeaturedAds) {
      ad.expiresAt = new Date(ad.createdAt.getTime() + featuredDuration * 24 * 60 * 60 * 1000);
      await ad.save();
      featuredCount++;
    }

    await ActivityLog.create({
      adminId: req.user._id,
      actionType: 'UPDATE_ADS_DURATION',
      description: `Auto-updated all ads: Simple (${simpleDuration} days), Featured (${featuredDuration} days)`,
      targetType: 'Ad'
    });

    res.json({
      message: 'All ads durations updated successfully',
      simpleAdsUpdated: simpleCount,
      featuredAdsUpdated: featuredCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update ads duration' });
  }
});


// @desc    Toggle user status (ban/unban)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
router.put('/users/:id/status', protect, admin, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    const wasBanned = user.isBanned;
    user.isBanned = !user.isBanned; 
    const updatedUser = await user.save();
    
    await ActivityLog.create({
      adminId: req.user._id,
      actionType: wasBanned ? 'UNBAN_USER' : 'BAN_USER',
      description: wasBanned ? `Unbanned user: ${user.name}` : `Banned user: ${user.name}`,
      targetId: user._id,
      targetType: 'User'
    });
    
    res.json(updatedUser);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user's ads (for admin moderation)
// @route   GET /api/admin/users/:id/ads
// @access  Private/Admin
router.get('/users/:id/ads', protect, admin, async (req, res) => {
  const ads = await Ad.find({ seller: req.params.id }).populate('category', 'name');
  res.json(ads);
});

// @desc    Get admin activity logs
// @route   GET /api/admin/logs/admin
// @access  Private/Admin
router.get('/logs/admin', protect, admin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      actionType, 
      adminName, 
      startDate, 
      endDate 
    } = req.query;

    const query = { adminId: { $ne: null } };

    if (actionType) {
      query.actionType = actionType;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (adminName) {
      query.$or = [
        { 'admin.name': { $regex: adminName, $options: 'i' } }
      ];
    }

    const logs = await ActivityLog.find(query)
      .populate('adminId', 'name email')
      .populate('targetId', 'title name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await ActivityLog.countDocuments(query);

    res.json({
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    res.status(500).json({ message: 'Failed to fetch admin logs' });
  }
});

// @desc    Get user activity logs
// @route   GET /api/admin/logs/user
// @access  Private/Admin
router.get('/logs/user', protect, admin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      actionType, 
      userName, 
      startDate, 
      endDate,
      suspicious 
    } = req.query;

    const query = { userId: { $ne: null } };

    if (actionType) {
      query.actionType = actionType;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (userName) {
      query['user.name'] = { $regex: userName, $options: 'i' };
    }

    if (suspicious === 'true') {
      query.actionType = { $in: ['REPORT_AD', 'VIEW_AD'] };
    }

    const logs = await ActivityLog.find(query)
      .populate('userId', 'name email isBanned')
      .populate('targetId', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await ActivityLog.countDocuments(query);

    res.json({
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user logs:', error);
    res.status(500).json({ message: 'Failed to fetch user logs' });
  }
});

// @desc    Get activity log action types
// @route   GET /api/admin/logs/types
// @access  Private/Admin
router.get('/logs/types', protect, admin, async (req, res) => {
  const { type } = req.query;
  
  const adminActions = [
    { value: 'ADMIN_LOGIN', label: 'Admin Login' },
    { value: 'ADMIN_LOGOUT', label: 'Admin Logout' },
    { value: 'CREATE_AD', label: 'Create Ad' },
    { value: 'EDIT_AD', label: 'Edit Ad' },
    { value: 'DELETE_AD', label: 'Delete Ad' },
    { value: 'CREATE_CATEGORY', label: 'Create Category' },
    { value: 'EDIT_CATEGORY', label: 'Edit Category' },
    { value: 'DELETE_CATEGORY', label: 'Delete Category' },
    { value: 'CREATE_SUBCATEGORY', label: 'Create Subcategory' },
    { value: 'EDIT_SUBCATEGORY', label: 'Edit Subcategory' },
    { value: 'DELETE_SUBCATEGORY', label: 'Delete Subcategory' },
    { value: 'BAN_USER', label: 'Ban User' },
    { value: 'UNBAN_USER', label: 'Unban User' },
    { value: 'ASSIGN_BADGE', label: 'Assign Badge' },
    { value: 'REMOVE_BADGE', label: 'Remove Badge' },
    { value: 'UPDATE_SETTINGS', label: 'Update Settings' },
    { value: 'UPDATE_SEO', label: 'Update SEO' }
  ];

  const userActions = [
    { value: 'USER_REGISTER', label: 'User Registration' },
    { value: 'USER_LOGIN', label: 'User Login' },
    { value: 'POST_AD', label: 'Post Ad' },
    { value: 'EDIT_USER_AD', label: 'Edit Ad' },
    { value: 'DELETE_USER_AD', label: 'Delete Ad' },
    { value: 'VIEW_AD', label: 'View Ad' },
    { value: 'CONTACT_SELLER_CALL', label: 'Contact Seller (Call)' },
    { value: 'CONTACT_SELLER_WHATSAPP', label: 'Contact Seller (WhatsApp)' },
    { value: 'REPORT_AD', label: 'Report Ad' },
    { value: 'ADD_FAVORITE', label: 'Add to Favorites' },
    { value: 'REMOVE_FAVORITE', label: 'Remove from Favorites' }
  ];

  if (type === 'admin') {
    res.json(adminActions);
  } else if (type === 'user') {
    res.json(userActions);
  } else {
    res.json({ admin: adminActions, user: userActions });
  }
});

// @desc    Helper function to log activity
// @route   POST /api/admin/logs
// @access  Private/Admin (internal use)
router.post('/logs', protect, admin, async (req, res) => {
  try {
    const { userId, adminId, actionType, targetId, targetType, description, ipAddress, location } = req.body;
    
    const log = await ActivityLog.create({
      userId,
      adminId,
      actionType,
      targetId,
      targetType,
      description,
      ipAddress,
      location
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('Error creating activity log:', error);
    res.status(500).json({ message: 'Failed to create activity log' });
  }
});

export default router;
