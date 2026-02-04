const { SoundArea } = require("../models");

exports.createSoundArea = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const soundArea = await SoundArea.create({
      name,
      description
    });

    return res.status(201).json({
      message: "Sound area created successfully",
      data: soundArea
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAllSoundAreas = async (req, res) => {
  try {
    const soundAreas = await SoundArea.findAll();

    return res.status(200).json({
      message: "Sound areas fetched successfully",
      data: soundAreas
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getSoundArea = async (req, res) => {
  try {
    const { id } = req.params;

    const soundArea = await SoundArea.findByPk(id);

    if (!soundArea) {
      return res.status(404).json({ message: "Sound area not found" });
    }

    return res.status(200).json({
      message: "Sound area fetched successfully",
      data: soundArea
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateSoundArea = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const soundArea = await SoundArea.findByPk(id);
    if (!soundArea) {
      return res.status(404).json({ message: "Sound area not found" });
    }

    await soundArea.update({
      name: name ?? soundArea.name,
      description: description ?? soundArea.description
    });

    return res.status(200).json({
      message: "Sound area updated successfully",
      data: soundArea
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.deleteSoundArea = async (req, res) => {
  try {
    const { id } = req.params;

    const soundArea = await SoundArea.findByPk(id);
    if (!soundArea) {
      return res.status(404).json({ message: "Sound area not found" });
    }

    await soundArea.destroy();

    return res.status(200).json({
      message: "Sound area deleted successfully",
      id
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
