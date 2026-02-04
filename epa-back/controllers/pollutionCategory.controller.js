"use strict";
const { Model, DataTypes, Sequelize } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const db = require("../models");
const PollutionCategory = db.PollutionCategory;
const SubPollutionCategory = db.SubPollutionCategory;

/**
 * Get all pollution categories with their subcategories
 */
exports.getAll = async (req, res) => {
  try {
    const categories = await PollutionCategory.findAll({
      include: [
        {
          model: SubPollutionCategory,
          as: "subcategories",
          attributes: ["sub_pollution_category_id", "sub_pollution_category", "description"]
        }
      ],
      order: [["pollution_category", "ASC"]]
    });
    res.status(200).json(categories);
  } catch (err) {
    console.error("Error fetching pollution categories:", err);
    res.status(500).json({ message: "Error fetching pollution categories", error: err.message });
  }
};

/**
 * Get pollution category by ID
 */
exports.getById = async (req, res) => {

  console.log("Fetching pollution category with ID:", req.params.id);
  try {
    const category = await PollutionCategory.findByPk(req.params.id, {
      include: [
        {
          model: SubPollutionCategory,
          as: "subcategories",
          attributes: ["sub_pollution_category_id", "sub_pollution_category", "description"]
        }
      ]
    });

    if (!category) {
      return res.status(404).json({ message: "Pollution category not found" });
    }

    res.status(200).json(category);
  } catch (err) {
    console.error("Error fetching pollution category:", err);
    res.status(500).json({ message: "Error fetching pollution category", error: err.message });
  }
};

/**
 * Create a new pollution category
 */
exports.create = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { pollution_category, description, is_sound } = req.body;

    if (!pollution_category) {
      return res.status(400).json({ message: "Pollution category is required" });
    }

    const category = await PollutionCategory.create(
      {
        pollution_category_id: uuidv4(),
        pollution_category,
        description: description || null,
        is_sound: is_sound ?? false,
        created_by: req.user?.id,
        updated_by: req.user?.id
      },
      { transaction: t }
    );

    await t.commit();
    res.status(201).json(category);
  } catch (err) {
    await t.rollback();
    console.error("Error creating pollution category:", err);
    res.status(500).json({ message: "Error creating pollution category", error: err.message });
  }
};


/**
 * Update an existing pollution category
 */
exports.update = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const category = await PollutionCategory.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Pollution category not found" });
    }

    const { pollution_category, description, is_sound } = req.body;

    await category.update(
      {
        pollution_category: pollution_category || category.pollution_category,
        description: description !== undefined ? description : category.description,

        // ✅ NEW
        is_sound: is_sound !== undefined ? is_sound : category.is_sound,

        updated_by: req.user?.id || "system"
      },
      { transaction: t }
    );

    await t.commit();
    res.status(200).json(category);
  } catch (err) {
    await t.rollback();
    console.error("Error updating pollution category:", err);
    res.status(500).json({ message: "Error updating pollution category", error: err.message });
  }
};


/**
 * Delete a pollution category
 */
exports.remove = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const category = await PollutionCategory.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Pollution category not found" });
    }

    await category.destroy({ transaction: t });
    await t.commit();
    res.status(200).json({ message: "Pollution category deleted successfully" });
  } catch (err) {
    await t.rollback();
    console.error("Error deleting pollution category:", err);

    if (err.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({ message: "Cannot delete: category has subcategories" });
    }

    res.status(500).json({ message: "Error deleting pollution category", error: err.message });
  }
};
