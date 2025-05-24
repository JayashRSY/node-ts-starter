import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import httpStatus from "http-status";
import { OAuth2Client } from "google-auth-library";
import UserModel from "../models/user.model.ts";
import catchAsync from "../utils/catchAsync.ts";
import { generateAuthTokens } from "../services/token.service.ts";
import { generateResetToken, hashResetToken } from '../utils/passwordReset.ts';
import { config } from '../configs/config.ts';
import { sendSimpleEmail } from '../utils/email.ts';

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
    const existingUser = await UserModel.findOne({ email }).lean();
    if (existingUser) {
      res
        .status(httpStatus.CONFLICT)
        .json({ success: false, message: "User already exists" });
      return;
    }
    const newUser = await UserModel.create({
      email,
      password: password,
    });
    const tokens = await generateAuthTokens(newUser);

    res.status(httpStatus.CREATED).json({
      success: true,
      message: "Registered successfully",
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
  
  // Use the model method instead of direct bcrypt.compare
  const validPassword = await validUser.isPasswordMatch(password);
  if (!validPassword) {
    res.status(httpStatus.UNAUTHORIZED).json({ success: false, message: "Invalid password" });
    return;
  }
  const tokens = await generateAuthTokens(validUser);

  res
    .cookie("refreshToken", tokens.refresh.token, config.cookie as any)
    .status(httpStatus.OK)
    .json({
      success: true,
      message: "User logged in successfully",
      accessToken: tokens.access.token,
      user: validUser,
    });
});

export const google = async (
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
        .cookie("refreshToken", tokens.refresh.token, config.cookie as any)
        .status(httpStatus.OK)
        .json({
          success: true,
          message: "User logged in successfully",
          accessToken: tokens.access.token,
          user,
        });
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const newUser = new UserModel({
        name: displayName,
        email,
        password: generatedPassword,
        profilePicture: photoURL,
        role: "user",
      });
      const result = await newUser.save();

      const tokens = await generateAuthTokens(result);

      res
        .cookie("refreshToken", tokens.refresh.token, config.cookie as any)
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
        .cookie("refreshToken", tokens.refresh.token, config.cookie as any)
        .status(httpStatus.OK)
        .json({
          success: true,
          message: "Refresh token updated successfully",
          accessToken: tokens.access.token,
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
    .json({ success: true, message: "Logged out successfully" });
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
  
  // Create HTML content for email
  const htmlContent = `
    <h1>Password Reset</h1>
    <p>You requested a password reset. Click the button below to reset your password:</p>
    <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>If you didn't request this, please ignore this email.</p>
    <p>This link will expire in 15 minutes.</p>
  `;
  
  // Send email with reset link
  try {
    await sendSimpleEmail(user.email, 'Reset Your Password', htmlContent);
    
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
