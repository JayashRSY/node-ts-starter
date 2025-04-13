import express from 'express';
import cookieParser from "cookie-parser";
import cors from 'cors';
import morgan from "morgan";
import helmet from "helmet";
import dotenv from 'dotenv';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import httpStatus from 'http-status';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './utils/mongo.js';
import { config } from './configs/config.js'
import errorHandler from './middlewares/error.middleware.js';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';

dotenv.config({ path: './.env' });
const { PORT } = process.env;

const app = express();

connectDB();

// parse json request body
app.use(express.json());
// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));
// enable cors
app.use(cors(config.corsOptions));
app.use(cookieParser());
// set security HTTP headers
app.use(helmet());
// sanitize request data
app.use(mongoSanitize());
// gzip compression
app.use(compression());
// Serve static files from the 'public' directory
app.use(morgan('combined'));

// Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
  });
  app.use(limiter);
  
// API Versioning
const apiVersion = `/api/v${config.app.apiVersion}`;

// Routes
app.use(`${apiVersion}/health`, async (req, res, next) => {
    res.status(200).send({ message: "Server is up and running" });
});

app.use(`${apiVersion}/auth`, authRoutes);
app.use(`${apiVersion}/user`, userRoutes);

// Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
}); 