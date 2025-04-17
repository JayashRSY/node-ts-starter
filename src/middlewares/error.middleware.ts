import logger from '../utils/logger.ts';
import { NextFunction, Request, Response } from "express";

class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  constructor(statusCode: number, message: string, isOperational = true, stack = '') {
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

const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log("🚀 ~ errorMiddleware ~ err:", err)
    let statusCode = (err as ApiError).statusCode || 500;
    let message = (err as ApiError).message || 'Internal Server Error';
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
  return
};

export default errorMiddleware;
export {ApiError};
