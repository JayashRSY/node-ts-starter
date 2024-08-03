import { Request, Response, NextFunction } from 'express';
import UserModel from "../models/user.model.ts";

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role === "admin") {
        const allUsers = await UserModel.find({}, 'name email profilePicture role updatedAt createdAt').lean();
        res.status(200)
            .json({
                success: true,
                message: "Users fetched successfully",
                data: allUsers,
            })
    } else {
        res.status(402).json({
            success: false,
            message: "Unauthorized"
        })
    }
}
export const getUser = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({
            success: false,
            message: "User id is required"
        })
    }
    if (req.user?._id === id) {
        const user = await UserModel.findById(id).lean();
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }
        res.status(200)
            .json({
                success: true,
                message: "User fetched successfully",
                data: user,
            })
    } else {
        res.status(402).json({
            success: false,
            message: "Unauthorized"
        })
    }

}

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.body
    if (!id) {
        res.status(400).json({
            success: false,
            message: "User id is required"
        })
    }
    if (req.user?._id === id) {
        const user = await UserModel.findByIdAndDelete(id).lean();
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }
        res.status(200)
            .json({
                success: true,
                message: "User deleted successfully",
                data: user,
            })
    } else {
        res.status(402).json({
            success: false,
            message: "Unauthorized"
        })
    }
}
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, profilePicture, password } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email is required",
        });
    }

    if (!password) {
        return res.status(400).json({
            success: false,
            message: "Password is required",
        });
    }

    if (req.user?._id) {
        try {
            const user = await UserModel.findByIdAndUpdate(
                req.user._id,
                { name, email, profilePicture, password },
                { new: true }
            );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "No user found",
                });
            }

            return res.status(200).json({
                success: true,
                message: "User updated successfully",
                data: user,
            });
        } catch (error) {
            next(error); // Forward the error to the error handling middleware
        }
    } else {
        return res.status(402).json({
            success: false,
            message: "Unauthorized",
        });
    }
};
