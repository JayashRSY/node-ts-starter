import UserModel from "../models/user.model.ts";
import { generateAuthTokens } from "../utils/token.service.ts";
import bcrypt from "bcrypt";
import ApiError from "../utils/ApiError.ts";
import httpStatus from "http-status";

export const registerUser = async (email: string, password: string) => {
  const existingUser = await UserModel.findOne({ email }).lean();
  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, "User already exists");
  }
  
  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = await UserModel.create({
    email,
    password: hashedPassword,
  });
  
  return await generateAuthTokens(newUser);
};