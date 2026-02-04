"use strict";
const db = require("../models");
const PenaltyCategory = db.PenaltyCategory; 
const PenalitySubCategory = db.PenalitySubCategory;
const AdministratorAccounts = db.AdministratorAccounts;

const { v4: uuidv4 } = require("uuid");

// Get all penalties
exports.getAll = async (req, res) => {
    try {
        const penalties = await PenaltyCategory.findAll({
            include: [
                {
                    model: db.PenalitySubCategory, // Use db reference, not the class
                    as: "penalitySubCategory"
                },
                {
                    model: db.AdministratorAccounts,
                    as: 'creator',
                    attributes: ['user_id', 'email']
                },
                {
                    model: db.AdministratorAccounts,
                    as: 'updater',
                    attributes: ['user_id', 'email']
                }
            ],
            order: [['penalty_name', 'ASC']],
        });
        res.status(200).json({
            success: true,
            data: penalties
        });
    } catch (err) {
        console.error("Error retrieving penalties:", err);
        res.status(500).json({
            success: false,
            message: "Some error occurred while retrieving penalties.",
            error: err.message
        });
    }
};
// Get penalty by ID
exports.getById = async (req, res) => {
    // const id = req.params.id;
    console.log("u hereee");
    console.log(req.params );
    console.log("Fetching penalty with ID:", id);
    const id = req.params.id;

    try {
        const penalty = await PenaltyCategory.findByPk(id, {
            include: [
                {
                    model: PenalitySubCategory,
                    as: "penalitySubCategory"
                },
                {
                    model: AdministratorAccounts,
                    as: 'creator',
                    attributes: ['user_id', 'email']
                },
                {
                    model: AdministratorAccounts,
                    as: 'updater',
                    attributes: ['user_id',  'email']
                }
            ]
        });
        
        if (penalty) {
            res.status(200).json({
                success: true,
                data: penalty
            });
        } else {
            res.status(404).json({
                success: false,
                message: `Cannot find PenaltyCategory with id=${id}.`
            });
        }
    } catch (err) {
        console.error("Error retrieving penalty:", err);
        res.status(500).json({
            success: false,
            message: "Error retrieving PenaltyCategory",
            error: err.message
        });
    }
};

// Create a new penalty
exports.create = async (req, res) => {
    try {
        if (!req.body.penalty_name) {
            return res.status(400).json({
                success: false,
                message: "PenaltyCategory name is required!"
            });
        }

      

        const penaltyData = {
            penalty_id: uuidv4(),
            penalty_name: req.body.penalty_name,
            description: req.body.description || null,
            is_active: req.body.is_active !== undefined ? req.body.is_active : true,
            created_by: req.user?.user_id || null // Assuming user info is in req.user
        };

        // Check if penalty name already exists
        const existingPenalty = await PenaltyCategory.findOne({
            where: { penalty_name: penaltyData.penalty_name }
        });

        if (existingPenalty) {
            return res.status(400).json({
                success: false,
                message: "Penalty name already exists!"
            });
        }

        const data = await PenaltyCategory.create(penaltyData);
        
        res.status(201).json({
            success: true,
            message: "PenaltyCategory created successfully!",
            data: data
        });
    } catch (err) {
        console.error("Error creating penalty:", err);
        res.status(500).json({
            success: false,
            message: "Some error occurred while creating the PenaltyCategory.",
            error: err.message
        });
    }
};

// Update a penalty by ID
exports.update = async (req, res) => {
    const id = req.params.id;

    try {
        const penalty = await PenaltyCategory.findByPk(id);
        
        if (!penalty) {
            return res.status(404).json({
                success: false,
                message: `PenaltyCategory with id=${id} not found.`
            });
        }

        const { penalty_name, description, is_active } = req.body;
        
        // Check if updating penalty_name and it's not a duplicate
        if (penalty_name && penalty_name !== penalty.penalty_name) {
            const existingPenalty = await PenaltyCategory.findOne({
                where: { penalty_name: penalty_name }
            });
            
            if (existingPenalty && existingPenalty.penalty_id !== id) {
                return res.status(400).json({
                    success: false,
                    message: "Penalty name already exists!"
                });
            }
        }
        
        if (penalty_name) penalty.penalty_name = penalty_name;
        if (description !== undefined) penalty.description = description;
        if (is_active !== undefined) penalty.is_active = is_active;
        
        penalty.updated_by = req.user?.user_id || null;
        
        await penalty.save();
        
        res.status(200).json({
            success: true,
            message: "PenaltyCategory was updated successfully.",
            data: penalty
        });
    } catch (err) {
        console.error("Error updating penalty:", err);
        res.status(500).json({
            success: false,
            message: "Error updating penalty",
            error: err.message
        });
    }
};

// Remove a penalty by ID
exports.remove = async (req, res) => {
    const id = req.params.id;

    try {
        // First check if the penalty exists
        const penalty = await PenaltyCategory.findByPk(id, {
            include: [{
                model: PenalitySubCategory,
                as: "penalitySubCategory"
            }]
        });
        
        if (!penalty) {
            return res.status(404).json({
                success: false,
                message: `PenaltyCategory with id=${id} not found.`
            });
        }

        // Check if there are subcategories
        if (penalty.penalitySubCategory && penalty.penalitySubCategory.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete penalty category because it has associated subcategories. Please delete subcategories first."
            });
        }

        // Delete the penalty
        await PenaltyCategory.destroy({
            where: { penalty_id: id }
        });

        res.status(200).json({
            success: true,
            message: "PenaltyCategory was deleted successfully!"
        });
    } catch (err) {
        console.error("Error deleting penalty:", err);
        res.status(500).json({
            success: false,
            message: "Could not delete PenaltyCategory",
            error: err.message
        });
    }
};

// Toggle active status
exports.toggleStatus = async (req, res) => {
    const id = req.params.id;

    try {
        const penalty = await PenaltyCategory.findByPk(id);
        
        if (!penalty) {
            return res.status(404).json({
                success: false,
                message: `PenaltyCategory with id=${id} not found.`
            });
        }

        penalty.is_active = !penalty.is_active;
        penalty.updated_by = req.user?.user_id || null;
        
        await penalty.save();
        
        res.status(200).json({
            success: true,
            message: `PenaltyCategory ${penalty.is_active ? 'activated' : 'deactivated'} successfully.`,
            data: penalty
        });
    } catch (err) {
        console.error("Error toggling penalty status:", err);
        res.status(500).json({
            success: false,
            message: "Error updating penalty status",
            error: err.message
        });
    }
};