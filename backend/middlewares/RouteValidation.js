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

  startPointLat: Joi.number().optional().allow(null),
  startPointLng: Joi.number().optional().allow(null),
  endPointLat: Joi.number().optional().allow(null),
  endPointLng: Joi.number().optional().allow(null),

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

  stops: Joi.alternatives()
    .try(
      Joi.string().allow("", null),
      Joi.array()
    )
    .optional()
    .messages({
      "alternatives.types": "Stops must be a string or array",
    }),

  description: Joi.string()
    .allow("", null)
    .optional()
    .messages({
      "string.base": "Description must be a string",
    }),

  status: Joi.string()
    .valid("active", "inactive", "maintenance")
    .optional()
    .messages({
      "any.only": "Status must be active, inactive, or maintenance",
    }),

  departureTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .allow("", null)
    .messages({
      "string.pattern.base": "Departure time must be in HH:MM format",
    }),

  arrivalTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .allow("", null)
    .messages({
      "string.pattern.base": "Arrival time must be in HH:MM format",
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
