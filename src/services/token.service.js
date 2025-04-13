import jwt from "jsonwebtoken";
import moment from "moment";
import httpStatus from "http-status";
import { config } from "../configs/config.js";
import { tokenTypes } from "../utils/constants.js";
import Token from "../models/token.model.js";
import ApiError from "../utils/ApiError.js";

const generateToken = async (userId, expires, type, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

const generateAuthTokens = async (user) => {
  const accessToken = await generateAccessToken(user.id);
  const refreshToken = await generateRefreshToken(user.id);
  return {
    access: {
      token: accessToken,
      expires: moment()
        .add(config.jwt.accessExpirationMinutes, "minutes")
        .toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: moment().add(config.jwt.refreshExpirationDays, "days").toDate(),
    },
  };
};

const generateAccessToken = async (userId) => {
  const expires = moment().add(config.jwt.accessExpirationMinutes, "minutes");
  return await generateToken(userId, expires, tokenTypes.ACCESS);
};

const generateRefreshToken = async (userId) => {
  const expires = moment().add(config.jwt.refreshExpirationDays, "days");
  const refreshToken = await generateToken(userId, expires, tokenTypes.REFRESH);
  await saveToken(refreshToken, userId, expires, tokenTypes.REFRESH);
  return refreshToken;
};

const generateResetPasswordToken = async (user) => {
  const expires = moment().add(
    config.jwt.resetPasswordExpirationMinutes,
    "minutes"
  );
  const resetPasswordToken = await generateToken(
    user.id,
    expires,
    tokenTypes.RESET_PASSWORD
  );
  await saveToken(
    resetPasswordToken,
    user.id,
    expires,
    tokenTypes.RESET_PASSWORD
  );
  return resetPasswordToken;
};

const saveToken = async (token, userId, expires, type, blacklisted = false) => {
  try {
    return await Token.create({
      token,
      userId,
      expires: expires.toDate(),
      type,
      blacklisted,
    });
  } catch (error) {
    console.log("🚀 ~ saveToken ~ error:", error)
    throw new Error("Could not save the token");
  }
};
export default {
  generateAccessToken,
  generateRefreshToken,
  generateResetPasswordToken,
  saveToken,
  generateAuthTokens,
};
