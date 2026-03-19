import SeoContent from '../models/SeoContent.js';

// @desc    Get all SEO contents (Admin)
// @route   GET /api/seo
// @access  Private/Admin
export const getSeoContents = async (req, res) => {
  try {
    const contents = await SeoContent.find().sort({ createdAt: -1 });
    res.json(contents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get SEO content by pageType and slug (Public)
// @route   GET /api/seo/match
// @access  Public
export const getMatchedSeoContent = async (req, res) => {
  const { pageType, slug } = req.query;
  try {
    const query = { isActive: true, pageType };
    if (pageType !== 'home') {
      query.targetSlug = slug;
    }
    const content = await SeoContent.findOne(query);
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create SEO content
// @route   POST /api/seo
// @access  Private/Admin
export const createSeoContent = async (req, res) => {
  const { title, description, pageType, targetSlug, isActive, keywords, metaTitle, metaDescription } = req.body;
  try {
    const content = new SeoContent({ 
      title, description, pageType, 
      targetSlug: pageType === 'home' ? '' : targetSlug, 
      isActive, keywords, metaTitle, metaDescription 
    });
    const saved = await content.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update SEO content
// @route   PUT /api/seo/:id
// @access  Private/Admin
export const updateSeoContent = async (req, res) => {
  try {
    const content = await SeoContent.findById(req.params.id);
    if (content) {
      content.title = req.body.title || content.title;
      content.description = req.body.description || content.description;
      content.pageType = req.body.pageType || content.pageType;
      content.targetSlug = req.body.pageType === 'home' ? '' : (req.body.targetSlug || content.targetSlug);
      if (req.body.isActive !== undefined) content.isActive = req.body.isActive;
      if (req.body.keywords !== undefined) content.keywords = req.body.keywords;
      if (req.body.metaTitle !== undefined) content.metaTitle = req.body.metaTitle;
      if (req.body.metaDescription !== undefined) content.metaDescription = req.body.metaDescription;
      const updated = await content.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Content not found' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete SEO content
// @route   DELETE /api/seo/:id
// @access  Private/Admin
export const deleteSeoContent = async (req, res) => {
  try {
    const content = await SeoContent.findById(req.params.id);
    if (content) {
      await content.deleteOne();
      res.json({ message: 'Content removed' });
    } else {
      res.status(404).json({ message: 'Content not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
