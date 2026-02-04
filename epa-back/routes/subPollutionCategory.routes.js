const express = require("express");
const router = express.Router();
const db = require("../models");
const { verifyToken } = require("../middleware/authMiddleware");
router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: SubPollutionCategories
 *   description: API endpoints for managing sub-pollution categories
 */

/**
 * @swagger
 * /api/sub-pollution-categories:
 *   get:
 *     summary: Get all sub-pollution categories
 *     tags: [SubPollutionCategories]
 *     responses:
 *       200:
 *         description: List of all sub-pollution categories
 */
router.get("/", async (req, res) => {
  try {
    const subCategories = await db.SubPollutionCategory.findAll({
      include: [{
        model: db.PollutionCategory,
        as: 'pollution_category',
        attributes: ['pollution_category_id', 'pollution_category']
      }],
      order: [['sub_pollution_category', 'ASC']]
    });
    res.json(subCategories);
  } catch (error) {
    console.error("Error fetching sub-pollution categories:", error);
    res.status(500).json({ error: "Error fetching sub-pollution categories" });
  }
});

/**
 * @swagger
 * /api/sub-pollution-categories/{id}:
 *   get:
 *     summary: Get a single sub-pollution category by ID
 *     tags: [SubPollutionCategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Sub-pollution category data
 *       404:
 *         description: Sub-pollution category not found
 */
router.get("/:id", async (req, res) => {
  try {
    const subCategory = await db.SubPollutionCategory.findByPk(req.params.id, {
      include: [{
        model: db.PollutionCategory,
        as: 'pollution_category',
        attributes: ['pollution_category_id', 'pollution_category']
      }]
    });
    
    if (!subCategory) {
      return res.status(404).json({ error: "Sub-pollution category not found" });
    }
    
    res.json(subCategory);
  } catch (error) {
    console.error("Error fetching sub-pollution category:", error);
    res.status(500).json({ error: "Error fetching sub-pollution category" });
  }
});

/**
 * @swagger
 * /api/sub-pollution-categories:
 *   post:
 *     summary: Create a new sub-pollution category
 *     tags: [SubPollutionCategories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pollution_category_id
 *               - sub_pollution_category
 *             properties:
 *               pollution_category_id:
 *                 type: string
 *                 format: uuid
 *               sub_pollution_category:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sub-pollution category created successfully
 *       400:
 *         description: Invalid input
 */
router.post("/", async (req, res) => {
  try {
    const { pollution_category_id, sub_pollution_category,investigation_days, description } = req.body;
    
    if (!pollution_category_id || !sub_pollution_category) {
      return res.status(400).json({ 
        error: "pollution_category_id and sub_pollution_category are required" 
      });
    }

    const parentCategory = await db.PollutionCategory.findByPk(pollution_category_id);
    if (!parentCategory) {
      return res.status(404).json({ error: "Parent pollution category not found" });
    }

    const subCategory = await db.SubPollutionCategory.create({
      pollution_category_id,
      sub_pollution_category,
      investigation_days,
      description: description || null,
    });

    const result = await db.SubPollutionCategory.findByPk(subCategory.sub_pollution_category_id, {
      include: [{
        model: db.PollutionCategory,
        as: 'pollution_category',
        attributes: ['pollution_category_id', 'pollution_category']
      }]
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating sub-pollution category:", error);
    res.status(500).json({ 
      error: "Error creating sub-pollution category",
      details: error.message 
    });
  }
});

/**
 * @swagger
 * /api/sub-pollution-categories/{id}:
 *   put:
 *     summary: Update a sub-pollution category by ID
 *     tags: [SubPollutionCategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pollution_category_id:
 *                 type: string
 *                 format: uuid
 *               sub_pollution_category:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sub-pollution category updated successfully
 *       404:
 *         description: Sub-pollution category not found
 */
router.put("/:id", async (req, res) => {
  try {
    const subCategory = await db.SubPollutionCategory.findByPk(req.params.id);
    
    if (!subCategory) {
      return res.status(404).json({ error: "Sub-pollution category not found" });
    }

    const { pollution_category_id, sub_pollution_category, description ,investigation_days,} = req.body;

    if (pollution_category_id && pollution_category_id !== subCategory.pollution_category_id) {
      const parentCategory = await db.PollutionCategory.findByPk(pollution_category_id);
      if (!parentCategory) {
        return res.status(404).json({ error: "Parent pollution category not found" });
      }
      subCategory.pollution_category_id = pollution_category_id;
    }

    if (sub_pollution_category) subCategory.sub_pollution_category = sub_pollution_category;
    if (investigation_days) subCategory.investigation_days = investigation_days;
    if (description !== undefined) subCategory.description = description;
    
    subCategory.updated_by = req.user?.id;
    await subCategory.save();

    const result = await db.SubPollutionCategory.findByPk(subCategory.sub_pollution_category_id, {
      include: [{
        model: db.PollutionCategory,
        as: 'pollution_category',
        attributes: ['pollution_category_id', 'pollution_category']
      }]
    });

    res.json(result);
  } catch (error) {
    console.error("Error updating sub-pollution category:", error);
    res.status(500).json({ 
      error: "Error updating sub-pollution category",
      details: error.message 
    });
  }
});

/**
 * @swagger
 * /api/sub-pollution-categories/{id}:
 *   delete:
 *     summary: Delete a sub-pollution category by ID
 *     tags: [SubPollutionCategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Sub-pollution category deleted successfully
 *       404:
 *         description: Sub-pollution category not found
 */
router.delete("/:id", async (req, res) => {
  try {
    const subCategory = await db.SubPollutionCategory.findByPk(req.params.id);
    
    if (!subCategory) {
      return res.status(404).json({ error: "Sub-pollution category not found" });
    }

    await subCategory.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting sub-pollution category:", error);
    
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ 
        error: "Cannot delete: This sub-category is being used by other records"
      });
    }
    
    res.status(500).json({ 
      error: "Error deleting sub-pollution category",
      details: error.message 
    });
  }
});

module.exports = router;
