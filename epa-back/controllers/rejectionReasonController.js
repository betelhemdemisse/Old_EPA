const { RejectionReason } = require('../models');
const { v4: uuidv4 } = require('uuid');

// Get all rejection reasons
exports.getAllRejectionReasons = async (req, res) => {
  try {
    const reasons = await RejectionReason.findAll({
      order: [['created_at', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      data: reasons,
    });
  } catch (error) {
    console.error("getAllRejectionReasons ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch rejection reasons",
      error: error.message,
    });
  }
};

// Get a single rejection reason by ID
exports.getRejectionReasonById = async (req, res) => {
  try {
    const { id } = req.params;
    const reason = await RejectionReason.findByPk(id);

    if (!reason) {
      return res.status(404).json({
        success: false,
        message: "Rejection reason not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: reason,
    });
  } catch (error) {
    console.error("getRejectionReasonById ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch rejection reason",
      error: error.message,
    });
  }
};

// Create a new rejection reason
exports.createRejectionReason = async (req, res) => {
  try {
    const { reason, description } = req.body;
    const created_by = req.user.id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Reason is required",
      });
    }

    const newReason = await RejectionReason.create({
      rejection_reason_id: uuidv4(),
      reason,
      description,
      created_by,
    });

    return res.status(201).json({
      success: true,
      message: "Rejection reason created successfully",
      data: newReason,
    });
  } catch (error) {
    console.error("createRejectionReason ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create rejection reason",
      error: error.message,
    });
  }
};

// Update a rejection reason
exports.updateRejectionReason = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, description } = req.body;
    const updated_by = req.user.id;

    const existingReason = await RejectionReason.findByPk(id);

    if (!existingReason) {
      return res.status(404).json({
        success: false,
        message: "Rejection reason not found",
      });
    }

    await existingReason.update({
      reason: reason || existingReason.reason,
      description: description || existingReason.description,
      updated_by,
    });

    return res.status(200).json({
      success: true,
      message: "Rejection reason updated successfully",
      data: existingReason,
    });
  } catch (error) {
    console.error("updateRejectionReason ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update rejection reason",
      error: error.message,
    });
  }
};

// Delete a rejection reason
exports.deleteRejectionReason = async (req, res) => {
  try {
    const { id } = req.params;

    const existingReason = await RejectionReason.findByPk(id);

    if (!existingReason) {
      return res.status(404).json({
        success: false,
        message: "Rejection reason not found",
      });
    }

    await existingReason.destroy();

    return res.status(200).json({
      success: true,
      message: "Rejection reason deleted successfully",
    });
  } catch (error) {
    console.error("deleteRejectionReason ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete rejection reason",
      error: error.message,
    });
  }
};
