const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    console.log('Validation error:', error.details[0].message); // Debug log
    return res.status(400).json({ error: { message: error.details[0].message, code: 400 } });
  }
  next();
};

// Schemas


const signupSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const cardSchema = Joi.object({
  title: Joi.string().required(),
  boardId: Joi.string().required(),
  position: Joi.number().required(),
});

const listSchema = Joi.object({
  title: Joi.string().required(),
  boardId: Joi.string().required(),
  position: Joi.number().required(),
});

const commentSchema = Joi.object({
  text: Joi.string().required(),
  cardId: Joi.string().required(),
});

const validateBoard = (req, res, next) => {
  const { error } = boardValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: { message: error.details[0].message, code: 400 } });
  }
  next();
};

module.exports = { validate, signupSchema, cardSchema, listSchema, commentSchema, validateBoard };