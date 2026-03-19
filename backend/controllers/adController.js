import Ad from '../models/Ad.js';
import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import ActivityLog from '../models/ActivityLog.js';
import Settings from '../models/Settings.js';

const getSettings = async () => {
  let settings = await Settings.findOne({});
  if (!settings) settings = await Settings.create({});
  return settings;
};

// @desc    Get all ads with filters & pagination
// @route   GET /api/ads
// @access  Public
export const getAds = async (req, res) => {
  try {
    const settings = await getSettings();
    const pageSize = parseInt(req.query.pageSize) || settings.featuredAdsPerPage || 12;
    const page = parseInt(req.query.page) || 1;

    const query = { 
      isActive: true, 
      isApproved: true,
      expiresAt: { $gt: new Date() } // Filter out expired ads
    };

    // Keyword search
    if (req.query.keyword) {
      query.$text = { $search: req.query.keyword };
    }

    // Category filter (by slug or id)
    if (req.query.category) {
      const cat = await Category.findOne({
        $or: [{ slug: req.query.category }, { _id: req.query.category.match(/^[0-9a-fA-F]{24}$/) ? req.query.category : null }]
      });
      if (cat) query.category = cat._id;
    }

    // Subcategory filter
    if (req.query.subcategory) {
      const sub = await Subcategory.findOne({
        $or: [{ slug: req.query.subcategory }, { _id: req.query.subcategory.match(/^[0-9a-fA-F]{24}$/) ? req.query.subcategory : null }]
      });
      if (sub) query.subcategory = sub._id;
    }

    // City filter
    if (req.query.city) {
      query.city = { $regex: req.query.city, $options: 'i' };
    }

    // ... rest of the filters (price, condition, etc.)
    if (req.query.priceMin || req.query.priceMax) {
      query.price = {};
      if (req.query.priceMin) query.price.$gte = Number(req.query.priceMin);
      if (req.query.priceMax) query.price.$lte = Number(req.query.priceMax);
    }
    if (req.query.condition) query.condition = req.query.condition;
    
    // Support both listingType and adType
    const adType = req.query.adType || req.query.listingType;
    if (adType) {
      query.adType = adType;
      query.listingType = adType;
    }

    // Sorting
    let sortBy = { createdAt: -1 };
    if (req.query.sort === 'price_asc') sortBy = { price: 1 };
    if (req.query.sort === 'price_desc') sortBy = { price: -1 };
    if (req.query.sort === 'oldest') sortBy = { createdAt: 1 };

    // Rotation Logic for Featured Ads
    // If listingType is 'featured' and no specific sort is requested, we randomize
    if (adType === 'featured' && !req.query.sort) {
      const count = await Ad.countDocuments(query);
      const ads = await Ad.aggregate([
        { $match: query },
        { $sample: { size: pageSize } },
        { $lookup: { from: 'users', localField: 'seller', foreignField: '_id', as: 'seller' } },
        { $unwind: '$seller' },
        { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' } },
        { $unwind: '$category' },
        { $project: { 'seller.password': 0, 'seller.isAdmin': 0 } }
      ]);
      
      return res.json({ ads, page: 1, pages: 1, total: count });
    }

    const count = await Ad.countDocuments(query);
    const ads = await Ad.find(query)
      .populate('seller', 'name profilePhoto city phone createdAt')
      .populate('category', 'name slug icon')
      .populate('subcategory', 'name image')
      .sort(sortBy)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ ads, page, pages: Math.ceil(count / pageSize), total: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get featured ads (for homepage or category rotation)
// @route   GET /api/ads/featured
// @access  Public
export const getFeaturedAds = async (req, res) => {
  try {
    const settings = await getSettings();
    const query = { 
      isFeatured: true, 
      isActive: true, 
      isApproved: true,
      expiresAt: { $gt: new Date() }
    };

    // If category is provided, filter by it
    if (req.query.category) {
      const cat = await Category.findOne({ slug: req.query.category });
      if (cat) query.category = cat._id;
    }

    const limit = parseInt(req.query.limit) || settings.featuredAdsLimit || 10;
    
    let ads;
    if (settings.rotationLogic === 'random') {
      ads = await Ad.aggregate([
        { $match: query },
        { $sample: { size: limit } },
        { $lookup: { from: 'users', localField: 'seller', foreignField: '_id', as: 'seller' } },
        { $unwind: '$seller' },
        { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' } },
        { $unwind: '$category' },
        { $lookup: { from: 'subcategories', localField: 'subcategory', foreignField: '_id', as: 'subcategory' } },
        { $unwind: { path: '$subcategory', preserveNullAndEmptyArrays: true } },
        { $project: { 'seller.password': 0, 'seller.isAdmin': 0 } }
      ]);
    } else {
      ads = await Ad.find(query)
        .populate('seller', 'name profilePhoto city phone')
        .populate('category', 'name slug icon')
        .populate('subcategory', 'name image')
        .sort({ createdAt: -1 })
        .limit(limit);
    }

    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get latest ads (for homepage)
// @route   GET /api/ads/latest
// @access  Public
export const getLatestAds = async (req, res) => {
  try {
    const settings = await getSettings();
    const limit = settings.latestAdsLimit || 12;
    const ads = await Ad.find({ 
      isActive: true, 
      isApproved: true,
      expiresAt: { $gt: new Date() }
    })
      .populate('seller', 'name profilePhoto city phone')
      .populate('category', 'name slug icon')
      .populate('subcategory', 'name image')
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single ad by id or slug
// @route   GET /api/ads/:id
// @access  Public
export const getAdById = async (req, res) => {
  try {
    let id = req.params.id;
    
    // Check if it's a slug (title-id) or raw ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      const parts = id.split('-');
      id = parts[parts.length - 1]; // Assume ID is at the end
    }

    const ad = await Ad.findById(id)
      .populate('seller', 'name profilePhoto city phone bio createdAt')
      .populate('category', 'name slug icon')
      .populate('subcategory', 'name image');
    
    if (!ad) return res.status(404).json({ message: 'Ad not found' });

    // Restrict public view of unapproved ads. Admin or Seller can see.
    if (!ad.isApproved && (!req.user || (req.user._id.toString() !== ad.seller._id.toString() && !req.user.isAdmin))) {
      return res.status(403).json({ message: 'This advertisement is pending approval.' });
    }

    // Increment views
    ad.views += 1;
    await ad.save();

    // Get other ads by same seller
    const sellerAds = await Ad.find({
      seller: ad.seller._id,
      _id: { $ne: ad._id },
      isActive: true,
      expiresAt: { $gt: new Date() }
    })
      .populate('category', 'name slug icon')
      .limit(4)
      .sort({ createdAt: -1 });

    res.json({ ...ad.toObject(), sellerAds });
  } catch (err) {
    console.error('Error fetching ad:', err);
    res.status(500).json({ message: 'Server error while fetching advertisement' });
  }
};

// @desc    Create ad
// @route   POST /api/ads
// @access  Private
export const createAd = async (req, res) => {
  try {
    const settings = await getSettings();
    const { title, description, price, category, subcategory, city, images, condition, adType, listingType, phone, brand, isNegotiable } = req.body;
    
    const finalAdType = adType || listingType || 'simple';
    const duration = finalAdType === 'featured' 
      ? settings.featuredAdsDuration 
      : settings.simpleAdsDuration;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + duration);
    
    const ad = await Ad.create({
      seller: req.user._id,
      title, description, price, category, subcategory, city,
      images: (images || []).slice(0, settings.maxImagesPerAd),
      condition: condition || 'used',
      adType: finalAdType,
      listingType: finalAdType,
      phone: phone || req.user.phone,
      brand,
      isNegotiable: isNegotiable || false,
      expiresAt,
    });
    const populated = await ad.populate([
      { path: 'seller', select: 'name profilePhoto city' },
      { path: 'category', select: 'name slug icon' },
      { path: 'subcategory', select: 'name image' }
    ]);
    
    await ActivityLog.create({
      userId: req.user._id,
      actionType: 'POST_AD',
      description: `Posted new ad: ${title}`,
      targetId: ad._id,
      targetType: 'Ad'
    });
    
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update ad
// @route   PUT /api/ads/:id
// @access  Private (seller or admin)
export const updateAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Ad not found' });
    if (ad.seller.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const fields = ['title', 'description', 'price', 'category', 'subcategory', 'city', 'images', 'condition', 'adType', 'listingType', 'isActive', 'isApproved', 'isFeatured', 'phone', 'expiresAt', 'brand', 'isNegotiable'];
    fields.forEach(f => { if (req.body[f] !== undefined) ad[f] = req.body[f]; });
    const updated = await ad.save();
    
    if (req.user.isAdmin) {
      await ActivityLog.create({
        adminId: req.user._id,
        actionType: 'EDIT_AD',
        description: `Edited ad: ${ad.title}`,
        targetId: ad._id,
        targetType: 'Ad'
      });
    } else {
      await ActivityLog.create({
        userId: req.user._id,
        actionType: 'EDIT_USER_AD',
        description: `Edited own ad: ${ad.title}`,
        targetId: ad._id,
        targetType: 'Ad'
      });
    }
    
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete ad
// @route   DELETE /api/ads/:id
// @access  Private (seller or admin)
export const deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Ad not found' });
    if (ad.seller.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const adTitle = ad.title;
    const isAdmin = req.user.isAdmin;
    await ad.deleteOne();
    
    if (isAdmin) {
      await ActivityLog.create({
        adminId: req.user._id,
        actionType: 'DELETE_AD',
        description: `Deleted ad: ${adTitle}`,
        targetType: 'Ad'
      });
    } else {
      await ActivityLog.create({
        userId: req.user._id,
        actionType: 'DELETE_USER_AD',
        description: `Deleted own ad: ${adTitle}`,
        targetType: 'Ad'
      });
    }
    
    res.json({ message: 'Ad removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get current user's ads
// @route   GET /api/ads/my
// @access  Private
export const getMyAds = async (req, res) => {
  try {
    const ads = await Ad.find({ seller: req.user._id })
      .populate('category', 'name slug icon')
      .sort({ createdAt: -1 });
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get ads by seller id
// @route   GET /api/ads/seller/:sellerId
// @access  Public
export const getSellerAds = async (req, res) => {
  try {
    const ads = await Ad.find({ 
      seller: req.params.sellerId, 
      isActive: true, 
      isApproved: true,
      expiresAt: { $gt: new Date() }
    })
      .populate('category', 'name slug icon')
      .sort({ createdAt: -1 });
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Admin – get all ads
// @route   GET /api/ads/admin/all
// @access  Admin
export const getAllAdsAdmin = async (req, res) => {
  try {
    const ads = await Ad.find({})
      .populate('seller', 'name email profilePhoto phone city')
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .sort({ createdAt: -1 });
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Admin – Get all ads for a specific user
// @route   GET /api/ads/admin/user/:userId
// @access  Admin
export const getAdsByUserAdmin = async (req, res) => {
  try {
    const ads = await Ad.find({ seller: req.params.userId })
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
