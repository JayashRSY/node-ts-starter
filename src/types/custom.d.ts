// custom.d.ts
import 'express';

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
        }
    }
}

export interface UserPayload {
    _id: string;
    email: string;
    name: string;
    role: string;
}
