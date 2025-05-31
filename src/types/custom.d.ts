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
    sub: string;
    role: string;
    iat: number;
    exp: number;
    jti: string;
    type: string;
}
