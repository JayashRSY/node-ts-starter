import jwt from "jsonwebtoken";
import { config } from "../configs/config.ts";
import ApiError from "../utils/ApiError.ts";
import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { UserPayload } from "../types/custom";

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized"));
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as jwt.JwtPayload;
    req.user = decoded as UserPayload;
    next();
  } catch (err) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized"));
  }
};

const authorize = (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new ApiError(401, "Unauthorized"));
  }

  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, "Forbidden"));
  }

  next();
};

export { authenticate, authorize };
