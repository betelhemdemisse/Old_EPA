const Joi = require("joi");
const { CustomerAccount } = require("../models");

const createCustomerSchema = Joi.object({
  full_name: Joi.string().required().messages({
    "string.empty": "Full name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
  }),
  phone_number: Joi.string().pattern(/^\d+$/).required().messages({
    "string.pattern.base": "Phone number must be numeric",
    "string.empty": "Phone number is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "string.empty": "Password is required",
  }),
  confirm_password: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Passwords must match",
      "string.empty": "Confirm password is required",
    }),
});

const verifyOTPSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
  }),
  otp: Joi.string().length(6).required().messages({
    "string.length": "OTP must be 6 characters long",
    "string.empty": "OTP is required",
  }),
});

const updateCustomerSchema = Joi.object({
  full_name: Joi.string().optional(),

  new_password: Joi.string().min(6).optional().messages({
    "string.min": "Password must be at least 6 characters long",
  }),

  confirm_password: Joi.string()
    .valid(Joi.ref("new_password"))
    .when("new_password", {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "any.only": "Passwords must match",
      "any.required": "Confirm password is required",
    }),

  current_password: Joi.string()
    .min(6)
    .when("new_password", {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "string.min": "Password must be at least 6 characters long",
      "any.required": "Current password is required",
    }),
})
.min(1);


const validateCreateCustomer = async (req, res, next) => {
  const { error } = createCustomerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  try {
    const existingCustomer = await CustomerAccount.findOne({
      where: { email: req.body.email },
    });
    if (existingCustomer) {
      return res
        .status(400)
        .json({ error: "Customer with this email already exists" });
    }
  } catch (err) {
    return res.status(500).json({ error: "Error checking existing customer" });
  }

  next();
};

const validateVerifyOTP = (req, res, next) => {
  const { error } = verifyOTPSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateUpdateCustomer = async (req, res, next) => {
  const { error } = updateCustomerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = {
  createCustomerSchema,
  verifyOTPSchema,
  updateCustomerSchema,
  validateCreateCustomer,
  validateVerifyOTP,
  validateUpdateCustomer,
};
