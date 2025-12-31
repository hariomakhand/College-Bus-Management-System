const Joi = require("joi");

const driverSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(40)
    .required()
    .messages({
      "string.empty": "Driver name is required",
      "string.min": "Name must be at least 3 characters long"
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Enter a valid email address",
      "any.required": "Email is required"
    }),

  password: Joi.string()
    .min(6)
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters long",
      "any.required": "Password is required"
    }),

  licenseNumber: Joi.string()
    .alphanum()
    .min(5)
    .max(20)
    .optional()
    .allow('', null)
    .messages({
      "string.empty": "License number is required",
    }),

  phoneNumber: Joi.string()
    .pattern(/^[6-9]\d{9}$/) // Indian phone number
    .optional()
    .allow('', null)
    .messages({
      "string.pattern.base": "Phone must start with 6–9 and be 10 digits",
    }),

  dateOfBirth: Joi.date()
    .optional()
    .allow('')
    .messages({
      "date.base": "Date of birth must be a valid date",
    }),

  address: Joi.string()
    .min(5)
    .max(100)
    .optional()
    .allow("")
    .messages({
      "string.min": "Address must be at least 5 characters long",
    }),

  emergencyContact: Joi.string()
    .optional()
    .allow('')
    .messages({
      "string.empty": "Emergency contact is required",
    }),

  experience: Joi.number()
    .min(0)
    .max(50)
    .optional()
    .messages({
      "number.base": "Experience must be a valid number",
    }),
});

const validateDriver = (req, res, next) => {
  const { error } = driverSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  next();
};

module.exports = validateDriver;
