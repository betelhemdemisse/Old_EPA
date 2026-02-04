const { v4: uuidv4 } = require("uuid");
const { PenalitySubCategory, PenaltyCategory } = require("../models");

module.exports = {
  // Create sub category
  async create(req, res) {
    try {
      console.log("penalty_idd", req.body)

      const { penalty_id, issue_type, description } = req.body;

      const exists = await PenaltyCategory.findOne({ where: { penalty_id: penalty_id } });
      console.log("exists", exists)

      if (!exists) {
        return res.status(404).json({ success: false, message: "Parent Penality Category not found" });
      }

      const newSubCat = await PenalitySubCategory.create({
        penality_sub_category_id: uuidv4(),
        penalty_id: penalty_id,
        issue_type,
        description,
      });

      res.status(201).json({ success: true, data: newSubCat });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  async getAll(req, res) {
    try {
      console.log("u r here")
      const list = await PenalitySubCategory.findAll();
      res.json(list);

    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  async getById(req, res) {
    console.log("u r heree")
      // console.log("reqreq", req)

    try {

      
      const { id } = req.params;

      const subCat = await PenalitySubCategory.findByPk(id, {
        include: [{ model: PenaltyCategory, as: "category" }],
      });

      if (!subCat) {
        return res.status(404).json({ success: false, message: "Sub Category not found" });
      }

      res.json({ success: true, data: subCat });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Update
  async update(req, res) {
    try {
      const { id } = req.params;
      const { penalty_id, issue_type, description } = req.body;

      const subCat = await PenalitySubCategory.findByPk(id);

      if (!subCat) {
        return res.status(404).json({ success: false, message: "Sub Category not found" });
      }

      if (penalty_id) {
        const exists = await PenaltyCategory.findByPk(penalty_id);
        if (!exists) {
          return res.status(404).json({ success: false, message: "Parent category not found" });
        }
      }

      await subCat.update({ penalty_id, issue_type, description });

      res.json({ success: true, message: "Updated successfully", data: subCat });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Delete
  async delete(req, res) {
    try {
      const { id } = req.params;

      const subCat = await PenalitySubCategory.findByPk(id);
      if (!subCat) {
        return res.status(404).json({ success: false, message: "Sub Category not found" });
      }

      await subCat.destroy();

      res.json({ success: true, message: "Deleted successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
};
