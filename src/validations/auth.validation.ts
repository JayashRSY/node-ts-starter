import Joi from 'joi';

const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const registerValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required(),
  name: Joi.string(),
});

export { loginValidation, registerValidation };