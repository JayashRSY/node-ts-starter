import { Request, Response, NextFunction } from 'express';

/**
 * Catches asynchronous errors in route handlers and passes them to the next error-handling middleware.
 * Allows controller to return any value (e.g. `res.json(...)`)
 */
const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch((err) => {
      console.error("🔥 catchAsync error:", err);
      next(err);
    });
  };
};

export default catchAsync;
