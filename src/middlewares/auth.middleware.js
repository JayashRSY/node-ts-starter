import jwt from "jsonwebtoken";
import { config } from "../configs/config.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Unauthorized"));
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized"));
  }
};

const authorize = (roles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Unauthorized"));
  }

  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, "Forbidden"));
  }

  next();
};

export { authenticate, authorize };
