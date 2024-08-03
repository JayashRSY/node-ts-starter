import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../utils/error'; // Adjust the path as needed
import { UserPayload } from '../types/custom';


export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies.accessToken
        || (typeof req.headers.authorization === 'string' ? req.headers.authorization.split(' ')[1] : undefined)
        || (typeof req.headers.Authorization === 'string' ? req.headers.Authorization.split(' ')[1] : undefined)

    if (!token) {
        return next(errorHandler(401, 'Unauthorized: No valid token provided'));
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err: any, decoded: any) => {
        if (err) return res.status(403).json({ message: 'Forbidden' })
        // Ensure the decoded token is of the expected type
        if (decoded) {
            req.user = decoded as UserPayload;
        }

        next();
    });
};
