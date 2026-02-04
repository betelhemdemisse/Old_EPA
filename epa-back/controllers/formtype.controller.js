const { ReportType, FormType, ReportingForm } = require("../models");
const { v4: uuidv4 } = require("uuid");

exports.createFormType = async (req, res) => {
  try {
    if (!req.user.permissions.includes("formType:create")) {
      return res.status(403).json({ message: "You do not have permission to create FormType" });
    }

    const { form_type, description } = req.body;
    if (!form_type) return res.status(400).json({ message: "form type is required" });

    const newFormType = await FormType.create({
      id: uuidv4(),
      form_type,
      description,
      created_by: req.user?.user_id,
    });

    res.status(201).json(newFormType);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create FormType", error });
  }
};

exports.getAllFormTypes = async (req, res) => {
  try {
    if (!req.user.permissions.includes("formType:read")) {
      return res.status(403).json({ message: "You do not have permission to read FormTypes" });
    }

    const formTypes = await FormType.findAll();
    res.json(formTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch FormTypes", error });
  }
};

exports.getFormTypeById = async (req, res) => {
  try {
    if (!req.user.permissions.includes("formType:read")) {
      return res.status(403).json({ message: "You do not have permission to read FormType" });
    }

    const { id } = req.params;
    const formType = await FormType.findByPk(id);
    if (!formType) return res.status(404).json({ message: "FormType not found" });
    res.json(formType);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch FormType", error });
  }
};

exports.updateFormType = async (req, res) => {
  try {
    if (!req.user.permissions.includes("formType:update")) {
      return res.status(403).json({ message: "You do not have permission to update FormType" });
    }

    const { id } = req.params;
    const { form_type, description } = req.body;

    const formType = await FormType.findByPk(id);
    if (!formType) return res.status(404).json({ message: "FormType not found" });

    formType.form_type = form_type || formType.form_type;
    formType.description = description || formType.description;
    formType.updated_by = req.user?.user_id;
    formType.updated_at = new Date();

    await formType.save();
    res.json(formType);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update FormType", error });
  }
};

exports.deleteFormType = async (req, res) => {
  try {
    if (!req.user.permissions.includes("formType:delete")) {
      return res.status(403).json({ message: "You do not have permission to delete FormType" });
    }

    const { id } = req.params;
    const formType = await FormType.findByPk(id);
    if (!formType) return res.status(404).json({ message: "FormType not found" });

    await formType.destroy();
    res.json({ message: "FormType deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete FormType", error });
  }
};
