const Joi = require("joi");

const busSchema = Joi.object({
  busNumber: Joi.string()
    .min(2)
    .max(20)
    .required()
    .messages({
      "string.empty": "Bus Number is required",
      "string.min": "Bus Number must be at least 2 characters",
      "string.max": "Bus Number should not be longer than 20 characters"
    }),

  capacity: Joi.number()
    .integer()
    .min(10)
    .max(80)
    .required()
    .messages({
      "number.base": "Capacity must be a number",
      "number.min": "Capacity must be at least 10",
      "number.max": "Capacity must not exceed 80",
      "any.required": "Capacity is required"
    }),

  model: Joi.string()
    .required()
    .max(50)
    .messages({
      "string.empty": "Model is required",
      "string.max": "Model name should not exceed 50 characters"
    }),

  registrationNumber: Joi.string()
    .required()
    .max(20)
    .messages({
      "string.empty": "Registration Number is required",
      "string.max": "Registration Number should not exceed 20 characters"
    }),

  manufacturingYear: Joi.number()
    .integer()
    .min(2000)
    .max(new Date().getFullYear())
    .optional()
    .messages({
      "number.min": "Manufacturing Year must not be older than 2000",
      "number.max": `Manufacturing Year cannot be above ${new Date().getFullYear()}`
    }),

  status: Joi.string()
    .valid('active', 'maintenance', 'inactive')
    .optional()
    .messages({
      "any.only": "Status must be active, maintenance, or inactive"
    })
});

function validateBus(req, res, next) {
  const { error } = busSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: "error",
      message: error.details[0].message,
    });
  }

  next();
}

module.exports = validateBus;
