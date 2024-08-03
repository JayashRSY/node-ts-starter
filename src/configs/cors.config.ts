const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:4200',
    'http://localhost:5173'
]

import { CorsOptions } from 'cors';

const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        const allowedOrigin = origin as string;
        if (allowedOrigins.includes(allowedOrigin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
};

export default corsOptions;