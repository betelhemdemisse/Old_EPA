const { Awareness } = require("../models");

exports.createAwareness = async (req, res) => {
    try {
        const { title, awareness_description } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "title is required"
            });
        }

        let file_path = null;
        let file_name = null;

        if (req.file) {
            file_path = `public/awareness/${req.file.filename}`;
            file_name = req.file.originalname;
        }

        const awareness = await Awareness.create({
            title,
            awareness_description,
            file_path,
            file_name,
        });

        return res.status(201).json({
            message: "Awareness created successfully",
            data: awareness
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};


exports.getAllAwareness = async (req, res) => {
    try {
        const awarenessList = await Awareness.findAll();

        return res.status(200).json({
            message: "Awareness list fetched successfully",
            data: awarenessList
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};

exports.getAwareness = async (req, res) => {
    try {
        const { awareness_id } = req.params;

        const awareness = await Awareness.findByPk(awareness_id);


        if (!awareness) {
            return res.status(404).json({ message: "Awareness not found" });
        }

        return res.status(200).json({
            message: "Awareness fetched successfully",
            data: awareness
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};

exports.updateAwareness = async (req, res) => {
    try {
        const { awareness_id } = req.params;
        const { title, awareness_description } = req.body;

        const awareness = await Awareness.findByPk(awareness_id);

        if (!awareness) {
            return res.status(404).json({ message: "Awareness not found" });
        }

        let file_path = awareness.file_path;
        let file_name = awareness.file_name;

        if (req.file) {
            file_path = `public/awareness/${req.file.filename}`;
            file_name = req.file.originalname;
        }

        await awareness.update({
            title: title ?? awareness.title,
            awareness_description: awareness_description ?? awareness.awareness_description,
            file_path,
            file_name
        });

        return res.status(200).json({
            message: "Awareness updated successfully",
            data: awareness
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};


exports.deleteAwareness = async (req, res) => {
    try {
        const { awareness_id } = req.params;

        const awareness = await Awareness.findByPk(awareness_id);

        if (!awareness) {
            return res.status(404).json({ message: "Awareness not found" });
        }

        await awareness.destroy();

        return res.status(200).json({
            message: "Awareness deleted successfully",
            awareness_id
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};
