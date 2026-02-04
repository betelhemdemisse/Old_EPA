const { Subcity, City } = require('../models');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all subcities
 */
exports.getSubcities = async (req, res) => {
  try {
    const subcities = await Subcity.findAll({
      include: {
        model: City,
        as: 'city',
        attributes: ['city_id', 'city_name'], // adjust according to your City model
      },
      attributes: ['subcity_id', ['subcity_name', 'name'], 'city_id'], // map subcity_name -> name
    });

    return res.status(200).json({
      message: 'All subcities retrieved successfully',
      subcities,
    });
  } catch (error) {
    console.error('Error fetching subcities:', error);
    return res.status(500).json({
      message: 'Error fetching subcities',
      error: error.message,
    });
  }
};

/**
 * Get subcity by ID
 */
exports.getSubcityById = async (req, res) => {
  try {
    const { subcity_id } = req.params;

    const subcity = await Subcity.findByPk(subcity_id, {
      include: {
        model: City,
        as: 'city',
        attributes: ['city_id', 'city_name'],
      },
      attributes: ['subcity_id', ['subcity_name', 'name'], 'city_id'],
    });

    if (!subcity) {
      return res.status(404).json({ message: 'Subcity not found' });
    }

    return res.status(200).json({
      message: 'Subcity retrieved successfully',
      subcity,
    });
  } catch (error) {
    console.error('Error fetching subcity:', error);
    return res.status(500).json({
      message: 'Error fetching subcity',
      error: error.message,
    });
  }
};

/**
 * Create a new subcity
 */
exports.createSubcity = async (req, res) => {
  try {
    const { subcity_name, city_id } = req.body;

    if (!subcity_name) {
      return res.status(400).json({ message: 'Subcity name is required.' });
    }

    const city = await City.findByPk(city_id);
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }

    const subcity = await Subcity.create({
      subcity_id: uuidv4(),
      subcity_name: subcity_name,
      city_id,
    });

    return res.status(201).json({
      message: 'Subcity created successfully',
      subcity,
    });
  } catch (error) {
    console.error('Error creating subcity:', error);
    return res.status(500).json({
      message: 'Error creating subcity',
      error: error.message,
    });
  }
};

/**
 * Get all subcities for a specific city
 */
exports.getSubcitiesByCity = async (req, res) => {
  try {
    const { city_id } = req.params;

    const city = await City.findByPk(city_id, {
      include: {
        model: Subcity,
        as: 'subcities',
        attributes: ['subcity_id', ['subcity_name', 'name']],
      },
    });

    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }

    return res.status(200).json({
      message: 'Subcities retrieved successfully',
      subcities: city.subcities,
    });
  } catch (error) {
    console.error('Error fetching subcities:', error);
    return res.status(500).json({
      message: 'Error fetching subcities',
      error: error.message,
    });
  }
};

/**
 * Update a subcity
 */
exports.updateSubcity = async (req, res) => {
  try {
    const { subcity_id } = req.params;
    const { subcity_name, city_id } = req.body;

    const subcity = await Subcity.findByPk(subcity_id);
    if (!subcity) {
      return res.status(404).json({ message: 'Subcity not found' });
    }

    if (city_id) {
      const city = await City.findByPk(city_id);
      if (!city) {
        return res.status(404).json({ message: 'City not found' });
      }
      subcity.city_id = city_id;
    }

    if (subcity_name) {
      subcity.subcity_name = subcity_name;
    }

    await subcity.save();

    return res.status(200).json({
      message: 'Subcity updated successfully',
      subcity,
    });
  } catch (error) {
    console.error('Error updating subcity:', error);
    return res.status(500).json({
      message: 'Error updating subcity',
      error: error.message,
    });
  }
};

/**
 * Delete a subcity
 */
exports.deleteSubcity = async (req, res) => {
  try {
    const { subcity_id } = req.params;

    const subcity = await Subcity.findByPk(subcity_id);
    if (!subcity) {
      return res.status(404).json({ message: 'Subcity not found' });
    }

    await subcity.destroy();

    return res.status(200).json({ message: 'Subcity deleted successfully' });
  } catch (error) {
    console.error('Error deleting subcity:', error);
    return res.status(500).json({
      message: 'Error deleting subcity',
      error: error.message,
    });
  }
};