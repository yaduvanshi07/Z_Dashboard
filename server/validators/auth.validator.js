const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().trim().min(1).max(120).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const joiOpts = { abortEarly: false, stripUnknown: true, convert: true };

function validateRegister(body) {
  return registerSchema.validate(body, joiOpts);
}

function validateLogin(body) {
  return loginSchema.validate(body, joiOpts);
}

module.exports = { validateRegister, validateLogin };
