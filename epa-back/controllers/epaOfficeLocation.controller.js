const { EpaOfficeLocation } = require("../models");

exports.createEpaOfficeLocation = async (req, res) => {
  try {
    const { latitude, longitude, name, phone_number, email, description } = req.body;

    if (!latitude || !longitude || !name) {
      return res.status(400).json({
        message: "latitude, longitude and name are required"
      });
    }

    const officeLocation = await EpaOfficeLocation.create({
      latitude,
      longitude,
      name,
      phone_number,
      email,
      description
    });

    return res.status(201).json({
      message: "EPA office location created successfully",
      data: officeLocation
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

exports.getAllEpaOfficeLocations = async (req, res) => {
  try {
    const officeLocations = await EpaOfficeLocation.findAll();

    return res.status(200).json({
      message: "EPA office locations fetched successfully",
      data: officeLocations
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

exports.getEpaOfficeLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const officeLocation = await EpaOfficeLocation.findByPk(id);

    if (!officeLocation) {
      return res.status(404).json({ message: "EPA office location not found" });
    }

    return res.status(200).json({
      message: "EPA office location fetched successfully",
      data: officeLocation
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

exports.updateEpaOfficeLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, name, phone_number, email, description } = req.body;

    const officeLocation = await EpaOfficeLocation.findByPk(id);

    if (!officeLocation) {
      return res.status(404).json({ message: "EPA office location not found" });
    }

    await officeLocation.update({
      latitude: latitude ?? officeLocation.latitude,
      longitude: longitude ?? officeLocation.longitude,
      name: name ?? officeLocation.name,
      phone_number: phone_number ?? officeLocation.phone_number,
      email: email ?? officeLocation.email,
      description: description ?? officeLocation.description
    });

    return res.status(200).json({
      message: "EPA office location updated successfully",
      data: officeLocation
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

exports.deleteEpaOfficeLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const officeLocation = await EpaOfficeLocation.findByPk(id);

    if (!officeLocation) {
      return res.status(404).json({ message: "EPA office location not found" });
    }

    await officeLocation.destroy();

    return res.status(200).json({
      message: "EPA office location deleted successfully",
      id
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};
