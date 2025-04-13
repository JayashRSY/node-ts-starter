import logger from '../utils/logger.js';

class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

const errorMiddleware = (err, req, res, next) => {
    console.log("🚀 ~ errorMiddleware ~ err:", err)
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    if(!(err instanceof ApiError)){
        statusCode = 500
        message = "Internal Server Error";
    }
  logger.error({
    message: 'Error occurred',
    error: err,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
  });

  res.status(statusCode).json({
    error: {
      message: message,
    },
  });
};

export default errorMiddleware;
export {ApiError};
