import Joi from 'joi';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const createUserValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email',
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
  }),
  password: Joi.string().regex(passwordRegex).required().messages({
    'string.pattern.base': 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character',
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
  name: Joi.string().required(),
  role: Joi.string().valid('user', 'admin').default('user').messages({
    'any.only': 'Role must be either user or admin',
  }),
});

const updateUserValidation = Joi.object({
  email: Joi.string().email().messages({ 'string.email': 'Email must be a valid email' }),
  password: Joi.string().regex(passwordRegex).messages({
    'string.pattern.base': 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character',
  }),
  name: Joi.string(),
  role: Joi.string().valid('user', 'admin').messages({
    'any.only': 'Role must be either user or admin',
  }),
});

const getUserValidation = Joi.object({
  id: Joi.string().required(),
});

const deleteUserValidation = Joi.object({
  id: Joi.string().required(),
});

export { createUserValidation, updateUserValidation, getUserValidation, deleteUserValidation };