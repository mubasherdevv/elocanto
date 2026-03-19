import City from '../models/City.js';

// @desc    Get all cities
// @route   GET /api/cities
// @access  Public
export const getCities = async (req, res) => {
  try {
    const cities = await City.find({}).sort({ name: 1 });
    res.json(cities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create a city
// @route   POST /api/cities
// @access  Private/Admin
export const createCity = async (req, res) => {
  try {
    const { name, image, isPopular } = req.body;
    const cityExists = await City.findOne({ name });

    if (cityExists) {
      return res.status(400).json({ message: 'City already exists' });
    }

    const city = await City.create({ name, image, isPopular });
    res.status(201).json(city);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update a city
// @route   PUT /api/cities/:id
// @access  Private/Admin
export const updateCity = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);

    if (city) {
      city.name = req.body.name || city.name;
      city.image = req.body.image || city.image;
      city.isPopular = req.body.isPopular !== undefined ? req.body.isPopular : city.isPopular;

      const updatedCity = await city.save();
      res.json(updatedCity);
    } else {
      res.status(404).json({ message: 'City not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete a city
// @route   DELETE /api/cities/:id
// @access  Private/Admin
export const deleteCity = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);

    if (city) {
      await city.deleteOne();
      res.json({ message: 'City removed' });
    } else {
      res.status(404).json({ message: 'City not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
