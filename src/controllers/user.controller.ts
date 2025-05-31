import { Request, Response, NextFunction } from 'express';
import UserModel from "../models/user.model.ts";
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.ts';

export const getUsers = catchAsync(async (req: Request, res: Response) => {
  if (req?.user?.role !== "admin") {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Unauthorized"
    });
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  const allUsers = await UserModel.find({}, 'name email profilePicture role updatedAt createdAt')
    .skip(skip)
    .limit(limit)
    .lean();
    
  const total = await UserModel.countDocuments({});
  
  return res.status(httpStatus.OK).json({
    success: true,
    message: "Users fetched successfully",
    data: {
      users: allUsers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    },
  });
});

export const getUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "User id is required"
    });
  }

  if (req.user?.sub !== id) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Unauthorized"
    });
  }

  const user = await UserModel.findById(id).lean();
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: 'User not found'
    });
  }

  return res.status(httpStatus.OK).json({
    success: true,
    message: "User fetched successfully",
    data: user,
  });
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.body;

  if (!id) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "User id is required"
    });
  }

  if (req.user?.sub !== id) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Unauthorized"
    });
  }

  const user = await UserModel.findByIdAndDelete(id).lean();
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: 'User not found'
    });
  }

  return res.status(httpStatus.OK).json({
    success: true,
    message: "User deleted successfully",
    data: user,
  });
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { name, email, profilePicture, password } = req.body;

  if (!email || !password) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Email and password are required",
    });
  }

  if (!req.user?.sub) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const user = await UserModel.findByIdAndUpdate(
    req.user.sub,
    { name, email, profilePicture, password },
    { new: true }
  ).lean();

  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "User not found",
    });
  }

  return res.status(httpStatus.OK).json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
});
