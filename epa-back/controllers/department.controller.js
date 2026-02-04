"use strict";
const db = require("../models");
const Department = db.Department;

// Get all departments
exports.getAll = async (req, res) => {
    try {
        const departments = await Department.findAll({
            order: [['department_name', 'ASC']]
        });
        res.send(departments);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving departments."
        });
    }
};

// Get department by ID
exports.getById = async (req, res) => {
    const id = req.params.id;

    try {
        const department = await Department.findByPk(id);
        
        if (department) {
            res.send(department);
        } else {
            res.status(404).send({
                message: `Cannot find Department with id=${id}.`
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Error retrieving Department with id=" + id
        });
    }
};

// Create a new department
exports.create = async (req, res) => {
    try {
      const { department_name } = req.body;
      console.log("department_name",department_name)
        if (!req.body.department_name) {
            return res.status(400).send({
                message: "Department name cannot be empty!"
            });
        }

        const department = {
            department_name: req.body.department_name,
            description: req.body.description || null,
            created_at: new Date(),
            updated_at: new Date()
        };

        const data = await Department.create(department);
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Department."
        });
    }
};

// Update a department by ID
exports.update = async (req, res) => {
    const id = req.params.id;

    try {
        const [num] = await Department.update(req.body, {
            where: { department_id: id }
        });

        if (num === 1) {
            res.send({
                message: "Department was updated successfully."
            });
        } else {
            res.status(404).send({
                message: `Cannot update Department with id=${id}. Department was not found or req.body is empty!`
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Error updating Department with id=" + id
        });
    }
};

// Remove a department by ID
exports.remove = async (req, res) => {
    const id = req.params.id;

    try {
        const num = await Department.destroy({
            where: { department_id: id }
        });

        if (num === 1) {
            res.send({
                message: "Department was deleted successfully!"
            });
        } else {
            res.status(404).send({
                message: `Cannot delete Department with id=${id}. Department was not found!`
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Could not delete Department with id=" + id
        });
    }
};