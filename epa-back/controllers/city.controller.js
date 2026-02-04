// controllers/cityController.js
const { City , Subcity , Woreda } = require("../models");


exports.createCity = async (req, res) => {
  try {
    const { city_name, description } = req.body;
    const userId = req.user?.user_id;

    if (!city_name) {
      return res.status(400).json({ error: "city_name is required" });
    }

    const existing = await City.findOne({ where: { city_name } });
    if (existing) {
      return res.status(400).json({ error: "A city with this name already exists" });
    }

    const city = await City.create({
      city_name,
      description: description || null,
      created_by: userId || null,
      updated_by: userId || null,
    });

    res.status(201).json({
      message: "City created successfully",
      city,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllCities = async (req, res) => {
  try {
   const cities = await City.findAll({
  attributes: [
    "city_id",
    "city_name",
    "description",
    "created_at",
    "updated_at",
    "created_by",
    "updated_by",
  ],
  include: [
    {
      model: Subcity,
      as: "subcities",  
      include: [
        {
          model: Woreda,
          as: "woredas",
        },
      ],
    },
  ],
  order: [["city_name", "ASC"]],
});


    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCityById = async (req, res) => {
  try {
    const { id } = req.params;

    const city = await City.findByPk(id, {
      attributes: [
        "city_id",
        "city_name",
        "description",
        "created_at",
        "updated_at",
        "created_by",
        "updated_by",
      ],
    });

    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }

    res.json(city);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { city_name, description } = req.body;
    const userId = req.user?.user_id;

    const city = await City.findByPk(id);
    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }

    // Prevent duplicate city_name
    if (city_name && city_name !== city.city_name) {
      const conflict = await City.findOne({ where: { city_name } });
      if (conflict) {
        return res.status(400).json({ error: "Another city with this name already exists" });
      }
    }

    await city.update({
      city_name: city_name || city.city_name,
      description: description !== undefined ? description : city.description,
      updated_by: userId || null,
    });

    res.json({
      message: "City updated successfully",
      city,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteCity = async (req, res) => {
  try {
    const { id } = req.params;

    const city = await City.findByPk(id);
    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }

    await city.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};