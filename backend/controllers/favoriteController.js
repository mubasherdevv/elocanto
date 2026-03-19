import Favorite from '../models/Favorite.js';

// @desc    Toggle favorite (add/remove)
// @route   POST /api/favorites/:adId
// @access  Private
export const toggleFavorite = async (req, res) => {
  try {
    const { adId } = req.params;
    const existing = await Favorite.findOne({ user: req.user._id, ad: adId });
    if (existing) {
      await existing.deleteOne();
      return res.json({ message: 'Removed from favorites', favorited: false });
    }
    await Favorite.create({ user: req.user._id, ad: adId });
    res.json({ message: 'Added to favorites', favorited: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get user's favorites
// @route   GET /api/favorites
// @access  Private
export const getUserFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path: 'ad',
        populate: [
          { path: 'seller', select: 'name profilePhoto city' },
          { path: 'category', select: 'name slug icon' }
        ]
      })
      .sort({ createdAt: -1 });
    res.json(favorites.map(f => f.ad).filter(Boolean));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Check if an ad is favorited by current user
// @route   GET /api/favorites/check/:adId
// @access  Private
export const checkFavorite = async (req, res) => {
  try {
    const fav = await Favorite.findOne({ user: req.user._id, ad: req.params.adId });
    res.json({ favorited: !!fav });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
