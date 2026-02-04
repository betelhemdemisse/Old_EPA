const Joi = require("joi");

// ----------------------------
// Create Administrator Schema
// ----------------------------
const createAdministratorSchema = Joi.object({
  name: Joi.string().required(),
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  role_ids: Joi.array().items(Joi.string().uuid()),
  phone: Joi.string().optional(),
  gender: Joi.string().valid("male", "female").optional(),
  sub_pollution_category_id: Joi.array().items(Joi.string().uuid()).optional(),
  hierarchy_ids: Joi.array().items(Joi.string().uuid()).optional(),
});

// ----------------------------
// Update Administrator Schema
// ----------------------------
const updateAdministratorSchema = createAdministratorSchema.fork(
  Object.keys(createAdministratorSchema.describe().keys),
  (field) => field.optional()
);

// ----------------------------
// Middleware
// ----------------------------
exports.validateCreateAdministrator = (req, res, next) => {
  const { error } = createAdministratorSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};

exports.validateUpdateAdministrator = (req, res, next) => {
  const { error } = updateAdministratorSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};
