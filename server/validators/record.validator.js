const Joi = require("joi");
const { RECORD_TYPES } = require("../models/financialRecord.model");

const baseFields = {
  type: Joi.string()
    .valid(...RECORD_TYPES)
    .required(),
  amount: Joi.number().positive().required(),
  category: Joi.string().trim().min(1).max(80).required(),
  date: Joi.date().required(),
  description: Joi.string().allow("").max(2000).optional(),
  receiptUrl: Joi.string().uri().allow(null).optional(),
  userId: Joi.string().hex().length(24).optional(),
};

const createSchema = Joi.object(baseFields);

const updateSchema = Joi.object({
  type: Joi.string().valid(...RECORD_TYPES).optional(),
  amount: Joi.number().positive().optional(),
  category: Joi.string().trim().min(1).max(80).optional(),
  date: Joi.date().optional(),
  description: Joi.string().allow("").max(2000).optional(),
  receiptUrl: Joi.string().uri().allow(null).optional(),
}).min(1);

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  type: Joi.string().valid(...RECORD_TYPES).optional(),
  category: Joi.string().trim().optional(),
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().optional(),
  userId: Joi.string().hex().length(24).optional(),
});

const joiOpts = { abortEarly: false, stripUnknown: true, convert: true };

function validateCreate(body) {
  return createSchema.validate(body, joiOpts);
}

function validateUpdate(body) {
  return updateSchema.validate(body, joiOpts);
}

function validateListQuery(query) {
  return listQuerySchema.validate(query, joiOpts);
}

module.exports = {
  validateCreate,
  validateUpdate,
  validateListQuery,
};
