import Joi from 'joi';
import ApiError from '../utils/ApiError.ts';
import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

// Add a custom validator for MongoDB ObjectId
const customJoi = Joi.extend((joi) => {
  return {
    type: 'objectId',
    base: joi.string(),
    messages: {
      'objectId.invalid': '"{{#label}}" is not a valid MongoDB ObjectId',
    },
    validate(value, helpers) {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return { value, errors: helpers.error('objectId.invalid') };
      }
      return { value };
    },
  };
});

const validate = (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => {
  const validSchema = schema;
  const object = { ...req.body, ...req.params, ...req.query };
  const { error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);
  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }
  return next();
};
export default validate;