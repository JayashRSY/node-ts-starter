import Joi from 'joi';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';

const validate = (schema) => (req, res, next) => {
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