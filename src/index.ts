import express from 'express';
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from 'cors';
import morgan from "morgan";
import helmet from "helmet";
import dotenv from 'dotenv';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import { config } from './configs/config.ts';
import connectDB from './utils/mongo.ts';
import authRoutes from './routes/auth.route.ts'
import userRoutes from './routes/user.route.ts'
import cardRoutes from './routes/card.route.ts'
import errorMiddleware from './middlewares/error.middleware.ts';
import loginLimiter from './middlewares/limiter.middleware.ts';

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
app.use(cors(config.corsOptions as CorsOptions))
app.use(cookieParser());
// set security HTTP headers
app.use(helmet());
// sanitize request data
app.use(mongoSanitize());
// gzip compression
app.use(compression());
// Serve static files from the 'public' directory
app.use(morgan('combined'));
  
// API Versioning
const apiVersion = `/api/v${config.app.apiVersion}`;

// limit repeated failed requests to auth endpoints
if (process.env.ENV === 'production') {
    app.use('/api/auth', loginLimiter);
}

// Routes
app.use(`${apiVersion}/health`, async (req, res, next) => {
    res.status(200).send({ message: "Server is up and running" });
});
app.use(`${apiVersion}/auth`, authRoutes);
app.use(`${apiVersion}/user`, userRoutes);
app.use(`${apiVersion}/card`, cardRoutes);

// Error Handling Middleware
app.use(errorMiddleware)

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
}); 
