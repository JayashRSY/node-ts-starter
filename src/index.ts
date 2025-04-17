import express, { Request, Response, NextFunction } from 'express';
import cookieParser from "cookie-parser";
import cors from 'cors';
import morgan from "morgan";
import helmet from "helmet";
import dotenv from 'dotenv';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import httpStatus from 'http-status';
import path from 'path';
import { fileURLToPath } from 'url';
import corsOptions from './configs/cors.config.ts';
import { config } from './configs/config.ts';
import connectDB from './utils/mongo.ts';
// import { logger } from './middlewares/logger.ts';
import errorHandler from './middlewares/errorHandler.ts';
import authRoutes from './routes/auth.route.ts'
import userRoutes from './routes/user.route.ts'
import rateLimit from 'express-rate-limit';

dotenv.config({ path: './.env' });
const { PORT } = process.env;

const app = express();

connectDB()
// app.use(logger)

// parse json request body
app.use(express.json());
// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));
// enable cors
app.use(cors(corsOptions))
app.use(cookieParser());
// set security HTTP headers
app.use(helmet());
// sanitize request data
app.use(mongoSanitize());
// gzip compression
app.use(compression());
// Serve static files from the 'public' directory
app.use(morgan('combined'));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
  });
  app.use(limiter);
  
// API Versioning
const apiVersion = `/api/v${config.app.apiVersion}`;

// jwt authentication

// limit repeated failed requests to auth endpoints
// if (process.env.ENV === 'production') {
//     app.use('/api/auth', authLimiter);
// }

// Routes
app.use(`${apiVersion}/health`, async (req, res, next) => {
    res.status(200).send({ message: "Server is up and running" });
});
app.use(`${apiVersion}/auth`, authRoutes);
app.use(`${apiVersion}/user`, userRoutes);

// Error Handling Middleware
// app.use((err: any, req: Request, res: Response, next: NextFunction) => {
//     const statusCode = err.statusCode || 500;
//     const message = err.message || 'Internal Server Error';
//     return res.status(statusCode).json({
//         success: false,
//         message,
//         statusCode
//     });
// });
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
}); 
