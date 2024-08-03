import { Request, Response, NextFunction } from 'express';
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library';
import UserModel from "../models/user.model.ts";
import { createTokens } from '../utils/createTokens.ts';
import cookieConfig from '../configs/cookie.config.ts';

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;
        // Check if the necessary fields are provided
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Email, name, and password are required' });
            return;
        }
        const hashedPassword = bcryptjs.hashSync(password, 12); // hashSync is synchronous
        const existingUser = await UserModel.findOne({ email }).lean();
        if (existingUser) {
            res.status(409).json({ success: false, message: 'User already exists' });
            return;
        }
        const newUser = new UserModel({
            email,
            password: hashedPassword,
            role: 'user',
        });
        await newUser.save();
        res.status(201).json({
            success: true,
            message: 'Signed up successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const signin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;
        // Validate the request body
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Email and password are required' });
            return;
        }
        const validUser = await UserModel.findOne({ email }).exec();
        if (!validUser) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) {
            res.status(401).json({ success: false, message: 'Invalid password' });
            return;
        }
        const { accessToken, refreshToken } = createTokens(validUser)

        res.cookie('refreshToken', refreshToken, cookieConfig as any)
            .status(200)
            .json({
                success: true,
                message: 'User logged in successfully',
                accessToken,
                data: validUser
            });
    } catch (error) {
        next(error);
    }
};


export const google = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            res.status(400).json({ success: false, message: 'ID Token is required' });
            return;
        }

        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload?.email_verified) {
            res.status(401).json({ success: false, message: 'Email not verified' });
            return;
        }

        const { email, name: displayName, picture: photoURL } = payload;

        let user = await UserModel.findOne({ email });

        if (user) {
            const { accessToken, refreshToken } = createTokens(user)

            res.cookie('accessToken', refreshToken, cookieConfig as any)
                .status(200)
                .json({
                    success: true,
                    message: "User logged in successfully",
                    accessToken,
                    data: user
                });
        } else {
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = bcryptjs.hashSync(generatedPassword, 12);
            const newUser = new UserModel({
                name: displayName,
                email,
                password: hashedPassword,
                profilePicture: photoURL,
                role: 'user',
            });
            const result = await newUser.save();

            const { accessToken, refreshToken } = createTokens(result)

            res.cookie('accessToken', refreshToken, cookieConfig as any)
                .status(201)
                .json({
                    success: true,
                    message: "User created successfully",
                    accessToken,
                    data: result
                });
        }
    } catch (error) {
        next(error);
    }
}


export const refresh = (req: Request, res: Response, next: NextFunction): void => {
    const cookies = req.cookies;

    if (!cookies?.refreshToken) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const refreshToken = cookies.refreshToken;

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string,
        async (err: any, decoded: any) => {
            if (err) {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }

            if (typeof decoded !== 'object' || !decoded) {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }

            const { email } = decoded as { email: string };

            const validUser = await UserModel.findOne({ email }).exec();

            if (!validUser) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const { accessToken, refreshToken } = createTokens(validUser)

            res.cookie('refreshToken', refreshToken, cookieConfig as any)
                .status(200)
                .json({
                    success: true,
                    message: 'User logged in successfully',
                    accessToken,
                    data: validUser
                });
        }
    );
};
export const signout = (req: Request, res: Response, next: NextFunction): void => {
    // const cookies = req.cookies;

    // if (!cookies?.refreshToken) {
    //     res.sendStatus(204); // No content
    //     return;
    // }
    res.clearCookie('refreshToken',
        {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' as 'Strict' | 'Lax' | 'None',
            secure: process.env.NODE_ENV === 'production',
        } as any)
        .status(200)
        .json({ success: true, message: 'Signed out successfully' });
};
