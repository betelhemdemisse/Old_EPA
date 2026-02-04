'use strict';

const { Team } = require('../models');
const { v4: uuidv4 } = require('uuid');

exports.createTeam = async (req, res) => {
    try {
        const { department_id, category_id, team_name } = req.body;

        if (!department_id || !category_id || !team_name ) {
            return res.status(400).json({ error: "department_id, category_id, team_name are required" });
        }

        const existingTeam = await Team.findOne({
            where: { 
                team_name,
                department_id,
                category_id
            }
        });
        if (existingTeam) {
            return res.status(400).json({ error: "Team with this name already exists in the specified department and category." });
        }

        const team = await Team.create({
            team_id: uuidv4(),
            department_id,
            category_id,
            team_name,
            // created_by,
            // updated_by: created_by
        });

        res.status(201).json(team);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllTeams = async (req, res) => {
    try {
        const teams = await Team.findAll();
        res.status(200).json(teams);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getTeamById = async (req, res) => {
    try {
        const { id } = req.params;
        const team = await Team.findByPk(id);

        if (!team) {
            return res.status(404).json({ error: "Team not found" });
        }

        res.status(200).json(team);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const { department_id, category_id, team_name, updated_by } = req.body;

        const team = await Team.findByPk(id);
        if (!team) {
            return res.status(404).json({ error: "Team not found" });
        }

        if (department_id) team.department_id = department_id;
        if (category_id) team.category_id = category_id;
        if (team_name) team.team_name = team_name;
        if (updated_by) team.updated_by = updated_by;
        team.updated_at = new Date();

        await team.save();
        res.status(200).json(team);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const team = await Team.findByPk(id);

        if (!team) {
            return res.status(404).json({ error: "Team not found" });
        }

        await team.destroy();
        res.status(200).json({ message: "Team deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
