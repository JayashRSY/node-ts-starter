import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import httpStatus from "http-status";
import { OAuth2Client } from "google-auth-library";
import UserModel from "../models/user.model.ts";
import cookieConfig from "../configs/cookie.config.ts";
import catchAsync from "../utils/catchAsync.ts";
import { generateAuthTokens } from "../services/token.service.ts";
import { generateResetToken, hashResetToken, sendResetEmail } from '../utils/passwordReset.ts';
import { config } from '../configs/config.ts';

export const register = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
    const { email, password } = req.body;
    // Check if the necessary fields are provided
    if (!email || !password) {
      res
        .status(httpStatus.BAD_REQUEST)
        .json({ success: false, message: "Email and password are required" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 12); // hashSync is synchronous
    const existingUser = await UserModel.findOne({ email }).lean();
    if (existingUser) {
      res
        .status(httpStatus.CONFLICT)
        .json({ success: false, message: "User already exists" });
      return;
    }
    const newUser = await UserModel.create({
      email,
      password: hashedPassword,
    });
    const tokens = await generateAuthTokens(newUser);

    res.status(httpStatus.CREATED).json({
      success: true,
      message: "Signed up successfully",
    });
    return
});

export const login = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;
  // Validate the request body
  if (!email || !password) {
    res
      .status(httpStatus.NOT_FOUND)
      .json({ success: false, message: "Email and password are required" });
    return;
  }
  const validUser = await UserModel.findOne({ email }).exec();
  if (!validUser) {
    res.status(httpStatus.NOT_FOUND).json({ success: false, message: "User not found" });
    return;
  }
  
  // Fix: Add await
  const validPassword = await bcrypt.compare(password, validUser.password);
  if (!validPassword) {
    res.status(httpStatus.UNAUTHORIZED).json({ success: false, message: "Invalid password" });
    return;
  }
  const tokens = await generateAuthTokens(validUser);

  res
    .cookie("refreshToken", tokens.refresh.token, cookieConfig as any)
    .status(httpStatus.OK)
    .json({
      success: true,
      message: "User logged in successfully",
      accessToken: tokens.access.token,
      data: validUser,
    });
});

export const gmailLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      res.status(httpStatus.BAD_REQUEST).json({ success: false, message: "ID Token is required" });
      return;
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email_verified) {
      res.status(httpStatus.UNAUTHORIZED).json({ success: false, message: "Email not verified" });
      return;
    }

    const { email, name: displayName, picture: photoURL } = payload;

    let user = await UserModel.findOne({ email });

    if (user) {
        const tokens = await generateAuthTokens(user);
      res
        .cookie("refreshToken", tokens.refresh.token, cookieConfig as any)
        .status(httpStatus.OK)
        .json({
          success: true,
          message: "User logged in successfully",
          accessToken: tokens.access.token,
          data: user,
        });
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(generatedPassword, 12);
      const newUser = new UserModel({
        name: displayName,
        email,
        password: hashedPassword,
        profilePicture: photoURL,
        role: "user",
      });
      const result = await newUser.save();

      const tokens = await generateAuthTokens(result);

      res
        .cookie("refreshToken", tokens.refresh.token, cookieConfig as any)
        .status(httpStatus.CREATED)
        .json({
          success: true,
          message: "User created successfully",
          accessToken: tokens.access.token,
          data: result,
        });
    }
  } catch (error) {
    next(error);
  }
};

export const refresh = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const {cookies} = req;

  if (!cookies?.refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const {refreshToken} = cookies;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET as string,
    async (err: any, decoded: any) => {
      if (err) {
        res.status(httpStatus.FORBIDDEN).json({ message: "Forbidden" });
        return;
      }

      if (typeof decoded !== "object" || !decoded) {
        res.status(httpStatus.FORBIDDEN).json({ message: "Forbidden" });
        return;
      }

      const { email } = decoded as { email: string };

      const validUser = await UserModel.findOne({ email }).exec();

      if (!validUser) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: "Unauthorized" });
        return;
      }

      const tokens = await generateAuthTokens(validUser);

      res
        .cookie("refreshToken", tokens.refresh.token, cookieConfig as any)
        .status(httpStatus.OK)
        .json({
          success: true,
          message: "User logged in successfully",
          accessToken: tokens.access.token,
          data: validUser,
        });
    }
  );
};
export const logout = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // const cookies = req.cookies;

  // if (!cookies?.refreshToken) {
  //     res.sendStatus(204); // No content
  //     return;
  // }
  res
    .clearCookie("refreshToken", {
      httpOnly: true,
      sameSite:
        process.env.NODE_ENV === "production"
          ? "None"
          : ("Lax" as "Strict" | "Lax" | "None"),
      secure: process.env.NODE_ENV === "production",
    } as any)
    .status(httpStatus.OK)
    .json({ success: true, message: "Signed out successfully" });
};

/**
 * Handle forgot password request
 * @route POST /auth/forgot-password
 */
export const forgotPassword = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email } = req.body;
  
  // Find user by email
  const user = await UserModel.findOne({ email });
  if (!user) {
    // For security reasons, don't reveal that the email doesn't exist
    res.status(httpStatus.OK).json({
      success: true,
      message: "If your email is registered, you will receive a password reset link"
    });
    return;
  }
  
  // Generate reset token
  const resetToken = generateResetToken();
  const hashedToken = hashResetToken(resetToken);
  
  // Save token to user document with expiry time (15 minutes)
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  await user.save();
  
  // Create reset URL
  const resetUrl = `${config.app.frontendUrl}/reset-password?token=${resetToken}`;
  
  // Send email with reset link
  try {
    await sendResetEmail(user.email, resetUrl);
    
    res.status(httpStatus.OK).json({
      success: true,
      message: "If your email is registered, you will receive a password reset link"
    });
  } catch (error) {
    // If email sending fails, clear the reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    next(error);
  }
});

/**
 * Handle password reset request
 * @route POST /auth/reset-password
 */
export const resetPassword = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { token, password } = req.body;
  
  // Hash the provided token to compare with stored hash
  const hashedToken = hashResetToken(token);
  
  // Find user with matching token and valid expiry
  const user = await UserModel.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() }
  });
  
  if (!user) {
    res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Invalid or expired password reset token"
    });
    return;
  }
  
  // Update password and clear reset token fields
  user.password = password; // Password will be hashed by pre-save hook
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  
  // Send confirmation response
  res.status(httpStatus.OK).json({
    success: true,
    message: "Password has been reset successfully"
  });
});
