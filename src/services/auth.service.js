// services/auth.service.js

import httpStatus from "http-status";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../configs/config.js";
import ApiError from "../utils/ApiError.js";
import userService from "./user.service.js";
import tokenService from "./token.service.js";

/**
 * Login user with email and password
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
  }

  return user;
};

/**
 * Logout user by deleting refresh token
 */
const logout = async (refreshToken) => {
  const tokenDoc = await tokenService.findToken(refreshToken, "refresh");
  if (!tokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, "Refresh token not found");
  }

  await tokenDoc.deleteOne();
};

/**
 * Refresh auth tokens
 */
const refreshAuth = async (refreshToken) => {
  try {
    const payload = jwt.verify(refreshToken, config.jwt.secret);
    const tokenDoc = await tokenService.findToken(refreshToken, "refresh");
    if (!tokenDoc) {
      throw new Error();
    }

    const user = await userService.getUserById(payload.sub);
    if (!user) {
      throw new Error();
    }

    await tokenDoc.deleteOne(); // Invalidate old token
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
  }
};

export default {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
};
