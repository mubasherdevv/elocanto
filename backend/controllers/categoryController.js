import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import Ad from '../models/Ad.js';
import ActivityLog from '../models/ActivityLog.js';

// @desc    Fetch all categories with counts
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const subCount = await Subcategory.countDocuments({ category: cat._id });
        const adCount = await Ad.countDocuments({ category: cat._id, isActive: true, isApproved: true });
        return { ...cat.toObject(), subcategoryCount: subCount, adCount };
      })
    );
    res.json(categoriesWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single category by slug or id
// @route   GET /api/categories/:slug
// @access  Public
const getCategoryBySlug = async (req, res) => {
  try {
    const cat = await Category.findOne({ slug: req.params.slug });
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    res.json(cat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { name, icon, description, parentId, image } = req.body;
    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Category already exists' });
    const category = await Category.create({ name, icon, description, parentId: parentId || null, image: image || '' });
    
    await ActivityLog.create({
      adminId: req.user._id,
      actionType: 'CREATE_CATEGORY',
      description: `Created category: ${name}`,
      targetId: category._id,
      targetType: 'Category'
    });
    
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    const { name, icon, description, parentId, image, isActive } = req.body;
    if (name) category.name = name;
    if (icon !== undefined) category.icon = icon;
    if (description !== undefined) category.description = description;
    if (parentId !== undefined) category.parentId = parentId;
    if (image !== undefined) category.image = image;
    if (isActive !== undefined) category.isActive = isActive;
    const updated = await category.save();
    
    await ActivityLog.create({
      adminId: req.user._id,
      actionType: 'EDIT_CATEGORY',
      description: `Updated category: ${category.name}`,
      targetId: category._id,
      targetType: 'Category'
    });
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    const subCount = await Subcategory.countDocuments({ category: category._id });
    if (subCount > 0) {
      return res.status(400).json({ message: `Cannot delete. ${subCount} subcategories belong to this category.` });
    }
    const adCount = await Ad.countDocuments({ category: category._id });
    if (adCount > 0) {
      return res.status(400).json({ message: `Cannot delete. ${adCount} ads use this category.` });
    }
    const categoryName = category.name;
    await category.deleteOne();
    
    await ActivityLog.create({
      adminId: req.user._id,
      actionType: 'DELETE_CATEGORY',
      description: `Deleted category: ${categoryName}`,
      targetType: 'Category'
    });
    
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory };
