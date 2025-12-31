const Joi = require("joi");

const routeSchema = Joi.object({
  routeName: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.empty": "Route name is required",
      "string.min": "Route name must be at least 3 characters",
    }),

  routeNumber: Joi.string()
    .pattern(/^[A-Za-z0-9-]{2,10}$/)
    .optional()
    .messages({
      "string.pattern.base": "Route number must be 2–10 characters (A-Z, 0-9, -)",
    }),

  startPoint: Joi.string()
    .required()
    .messages({
      "string.empty": "Start point is required",
    }),

  endPoint: Joi.string()
    .required()
    .messages({
      "string.empty": "End point is required",
    }),

  distance: Joi.number()
    .min(0.1)
    .required()
    .messages({
      "number.base": "Distance must be a number",
      "number.min": "Distance must be at least 0.1 km",
    }),

  estimatedTime: Joi.number()
    .min(1)
    .required()
    .messages({
      "number.base": "Estimated time must be a number",
      "number.min": "Estimated time must be at least 1 minute",
    }),

  stops: Joi.string()
    .allow("", null)
    .messages({
      "string.base": "Stops must be a string",
    }),

  description: Joi.string()
    .allow("", null)
    .messages({
      "string.base": "Description must be a string",
    }),

  status: Joi.string()
    .valid("active", "inactive", "maintenance")
    .optional()
    .messages({
      "any.only": "Status must be active, inactive, or maintenance",
    }),

});

const RouteValidation = (req, res, next) => {
  const { error } = routeSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map(detail => detail.message).join(', '),
      details: error.details
    });
  }

  next();
};

module.exports = RouteValidation;
