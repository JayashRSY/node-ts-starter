import jwt from "jsonwebtoken";
import moment from "moment";
import httpStatus from "http-status";
import { config } from "../configs/config.ts";
import { tokenTypes } from "../utils/constants.ts";
import Token from "../models/token.model.ts";

export const generateToken = async (
  userId: string,
  expires: moment.Moment,
  type: string,
  secret: string = config.jwt.secret
): Promise<string> => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

export const generateAuthTokens = async (user: any) => {
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

export const generateAccessToken = async (userId: any) => {
  const expires = moment().add(config.jwt.accessExpirationMinutes, "minutes");
  return await generateToken(userId, expires, tokenTypes.ACCESS);
};

export const generateRefreshToken = async (userId: any) => {
  const expires = moment().add(config.jwt.refreshExpirationDays, "days");
  const refreshToken = await generateToken(userId, expires, tokenTypes.REFRESH);
  await saveToken(refreshToken, userId, expires, tokenTypes.REFRESH);
  return refreshToken;
};

export const generateResetPasswordToken = async (user: any) => {
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

export const saveToken = async (
  token: string,
  userId: string,
  expires: moment.Moment,
  type: string,
  blacklisted: boolean = false
) => {
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
