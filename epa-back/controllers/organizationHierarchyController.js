"use strict";

const {
    organizationHierarchy,
    Region,
    City,
    Subcity,
    Zone,
    Woreda
} = require("../models");

const { v4: uuidv4 } = require("uuid");


exports.createHierarchy = async (req, res) => {
    try {
        const {
            hierarchy_name,
            parent_id,
            region_id,
            city_id,
            subcity_id,
            zone_id,
            woreda_id,
            isRegional
        } = req.body;
        if (!hierarchy_name) {
            return res.status(400).json({
                status: false,
                message: "hierarchy_name is required"
            });
        }

        if (parent_id) {
            const parentExists = await organizationHierarchy.findByPk(parent_id);
            if (!parentExists) {
                return res.status(404).json({
                    status: false,
                    message: "Parent hierarchy not found"
                });
            }
        }

        if (region_id && !(await Region.findByPk(region_id))) {
            return res.status(404).json({ status: false, message: "region_id not found" });
        }
        if (city_id && !(await City.findByPk(city_id))) {
            return res.status(404).json({ status: false, message: "city_id not found" });
        }
        if (subcity_id && !(await Subcity.findByPk(subcity_id))) {
            return res.status(404).json({ status: false, message: "subcity_id not found" });
        }
        if (zone_id && !(await Zone.findByPk(zone_id))) {
            return res.status(404).json({ status: false, message: "zone_id not found" });
        }
        if (woreda_id && !(await Woreda.findByPk(woreda_id))) {
            return res.status(404).json({ status: false, message: "woreda_id not found" });
        }

        const newHierarchy = await organizationHierarchy.create({
            organization_hierarchy_id: uuidv4(),
            hierarchy_name,
            parent_id: parent_id || null,
            region_id,
            city_id,
            subcity_id,
            zone_id,
            woreda_id,
            isRegional
        });

        res.status(201).json({
            status: true,
            message: "Hierarchy created successfully",
            data: newHierarchy
        });

    } catch (error) {
        console.error("CREATE ERROR:", error);
        res.status(500).json({ status: false, message: error.message });
    }
};



exports.getAllHierarchy = async (req, res) => {
  try {
    const nodes = await organizationHierarchy.findAll({
      include: [
        { model: Region, as: "region" },
        { model: City, as: "city" },
        { model: Subcity, as: "subcity" },
        { model: Zone, as: "zone" },
        { model: Woreda, as: "woreda" },
        { model: organizationHierarchy, as: "parent" }
      ]
    });

    const data = nodes.map(node => node.get({ plain: true }));

    const map = {};
    const roots = [];

    data.forEach(item => {
      map[item.organization_hierarchy_id] = { ...item, children: [] };
    });

    data.forEach(item => {
      if (item.parent_id) {
        const parent = map[item.parent_id];
        if (parent) parent.children.push(map[item.organization_hierarchy_id]);
      } else {
        roots.push(map[item.organization_hierarchy_id]);
      }
    });

    res.status(200).json({ status: true, data: roots });

  } catch (error) {
    console.error("GET ALL ERROR:", error);
    res.status(500).json({ status: false, message: error.message });
  }
};


exports.getHierarchyById = async (req, res) => {
    try {
        const { id } = req.params;

        const hierarchy = await organizationHierarchy.findByPk(id, {
            include: [
                { model: organizationHierarchy, as: "parent" },
                { model: organizationHierarchy, as: "children" },
                { model: Region, as: "region" },
                { model: City, as: "city" },
                { model: Subcity, as: "subcity" },
                { model: Zone, as: "zone" },
                { model: Woreda, as: "woreda" },
            ]
        });

        if (!hierarchy) {
            return res.status(404).json({
                status: false,
                message: "Hierarchy not found"
            });
        }

        res.status(200).json({ status: true, data: hierarchy });

    } catch (error) {
        console.error("GET BY ID ERROR:", error);
        res.status(500).json({ status: false, message: error.message });
    }
};


exports.updateHierarchy = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            hierarchy_name,
            parent_id,
            region_id,
            city_id,
            subcity_id,
            zone_id,
            woreda_id,
            isRegional
        } = req.body;

        const hierarchy = await organizationHierarchy.findByPk(id);

        if (!hierarchy) {
            return res.status(404).json({ status: false, message: "Hierarchy not found" });
        }

        if (parent_id && parent_id === id) {
            return res.status(400).json({
                status: false,
                message: "A hierarchy cannot be its own parent"
            });
        }

        if (parent_id && !(await organizationHierarchy.findByPk(parent_id))) {
            return res.status(404).json({ status: false, message: "Parent not found" });
        }
        if (region_id && !(await Region.findByPk(region_id))) {
            return res.status(404).json({ status: false, message: "region_id not found" });
        }
        if (city_id && !(await City.findByPk(city_id))) {
            return res.status(404).json({ status: false, message: "city_id not found" });
        }
        if (subcity_id && !(await Subcity.findByPk(subcity_id))) {
            return res.status(404).json({ status: false, message: "subcity_id not found" });
        }
        if (zone_id && !(await Zone.findByPk(zone_id))) {
            return res.status(404).json({ status: false, message: "zone_id not found" });
        }
        if (woreda_id && !(await Woreda.findByPk(woreda_id))) {
            return res.status(404).json({ status: false, message: "woreda_id not found" });
        }

        await hierarchy.update({
            hierarchy_name: hierarchy_name || hierarchy.hierarchy_name,
            parent_id: parent_id ?? hierarchy.parent_id,
            region_id,
            city_id,
            subcity_id,
            zone_id,
            woreda_id,
            isRegional
        });

        res.status(200).json({ status: true, message: "Hierarchy updated", data: hierarchy });

    } catch (error) {
        console.error("UPDATE ERROR:", error);
        res.status(500).json({ status: false, message: error.message });
    }
};


exports.deleteHierarchy = async (req, res) => {
    try {
        const { id } = req.params;

        const hierarchy = await organizationHierarchy.findByPk(id);
        if (!hierarchy) {
            return res.status(404).json({
                status: false,
                message: "Hierarchy not found"
            });
        }

        const childCount = await organizationHierarchy.count({
            where: { parent_id: id }
        });

        if (childCount > 0) {
            return res.status(400).json({
                status: false,
                message: "Cannot delete a hierarchy that has children"
            });
        }

        await hierarchy.destroy();

        res.status(200).json({
            status: true,
            message: "Hierarchy deleted successfully"
        });

    } catch (error) {
        console.error("DELETE ERROR:", error);
        res.status(500).json({ status: false, message: error.message });
    }
};
