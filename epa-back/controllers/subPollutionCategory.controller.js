const db = require("../models");
const SubPollutionCategory = db.SubPollutionCategory;
const { Op } = require("sequelize");
const PollutionCategory = db.PollutionCategory;

const { v4: uuidv4 } = require("uuid");


// Get all sub-pollution categories
exports.getAll = async (req, res) => {
  try {
    const subcategories = await SubPollutionCategory.findAll({
      include: [
        {
          model: PollutionCategory,
          as: "pollution_category",
          attributes: ["pollution_category_id", "pollution_category"]
        }
      ],
      order: [["sub_pollution_category", "ASC"]]
    });

    res.status(200).json(subcategories);
  } catch (err) {
    console.error("Error fetching sub-pollution categories:", err);
    res.status(500).json({ message: "Error fetching sub-pollution categories", error: err.message });
  }
};

// Get sub-pollution category by ID
exports.getById = async (req, res) => {
  try {
    const subcategory = await SubPollutionCategory.findByPk(req.params.id, {
      include: [
        {
          model: PollutionCategory,
          as: "pollution_category",
          attributes: ["pollution_category_id", "pollution_category"]
        }
      ]
    });

    if (!subcategory) return res.status(404).json({ message: "Sub-pollution category not found" });

    res.status(200).json(subcategory);
  } catch (err) {
    console.error("Error fetching sub-pollution category:", err);
    res.status(500).json({ message: "Error fetching sub-pollution category", error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      pollution_category_id,
      sub_pollution_category,
      investigation_days,
      description
    } = req.body;
console.log("req.bodyyy",req.body)
    if (!pollution_category_id || !sub_pollution_category) {
      return res.status(400).json({
        message: "pollution_category_id and sub_pollution_category are required",
      });
    }
const parsedInvestigationDays =
  investigation_days !== undefined && investigation_days !== null && investigation_days !== ""
    ? parseInt(investigation_days, 10)
    : null;

    const category = await PollutionCategory.findByPk(pollution_category_id);
    if (!category) {
      return res.status(404).json({ message: "Parent pollution category not found" });
    }

   const existing = await SubPollutionCategory.findOne({
  where: {
    pollution_category_id,
    [Op.and]: where(
      fn("LOWER", col("sub_pollution_category")),
      fn("LOWER", sub_pollution_category.trim())
    ),
  },
});


    if (existing) {
      return res.status(409).json({
        message: "Sub-pollution category name already exists in this category",
      });
    }

    const sub_pollution_category_id = uuidv4();

    const subcategory = await SubPollutionCategory.create({
      sub_pollution_category_id,
      pollution_category_id,
      sub_pollution_category: sub_pollution_category.trim(),
     investigation_days: parsedInvestigationDays,
      description: description || null,
    });

    const result = await SubPollutionCategory.findByPk(
      subcategory.sub_pollution_category_id,
      {
        include: [
          {
            model: PollutionCategory,
            as: "pollution_category",
            attributes: ["pollution_category_id", "pollution_category"],
          },
        ],
      }
    );

    return res.status(201).json(result);

  } catch (err) {
    console.error("Error creating sub-pollution category:", err);
    return res.status(500).json({
      message: "Error creating sub-pollution category",
      error: err.message,
    });
  }
};


// Update sub-pollution category
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { pollution_category_id, sub_pollution_category,investigation_days, description } = req.body;

    const subcategory = await SubPollutionCategory.findByPk(id);
    if (!subcategory) return res.status(404).json({ message: "Sub-pollution category not found" });

    if (pollution_category_id) {
      const category = await PollutionCategory.findByPk(pollution_category_id);
      if (!category) return res.status(404).json({ message: "Parent pollution category not found" });
    }

    await subcategory.update({
      pollution_category_id: pollution_category_id || subcategory.pollution_category_id,
      sub_pollution_category: sub_pollution_category || subcategory.sub_pollution_category,
      investigation_days: investigation_days || subcategory.investigation_days,
      description: description !== undefined ? description : subcategory.description,
      updated_by: req.user?.id || "system"
    });

    const updatedRecord = await SubPollutionCategory.findByPk(id, {
      include: [
        {
          model: PollutionCategory,
          as: "pollution_category",
          attributes: ["pollution_category_id", "pollution_category"]
        }
      ]
    });

    res.status(200).json(updatedRecord);
  } catch (err) {
    console.error("Error updating sub-pollution category:", err);
    res.status(500).json({ message: "Error updating sub-pollution category", error: err.message });
  }
};

// Delete sub-pollution category
exports.remove = async (req, res) => {
  try {
    const subcategory = await SubPollutionCategory.findByPk(req.params.id);
    if (!subcategory) return res.status(404).json({ message: "Sub-pollution category not found" });

    await subcategory.destroy();
    res.status(200).json({ message: "Sub-pollution category deleted successfully" });
  } catch (err) {
    console.error("Error deleting sub-pollution category:", err);
    if (err.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({ message: "Cannot delete: this sub-category is being used" });
    }
    res.status(500).json({ message: "Error deleting sub-pollution category", error: err.message });
  }
};
