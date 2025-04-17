// config.js
import dotenv from "dotenv";

dotenv.config();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
  "http://localhost:3000",
  "http://localhost:4200",
  "http://localhost:5173",
];

export const config = {
  app: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || "development",
    isProduction: process.env.NODE_ENV === "production",
    apiVersion: process.env.API_VERSION || '1'
  },
  mongoose: {
    url: process.env.MONGODB_URL || "mongodb://localhost:27017/your-database",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    accessExpirationMinutes: parseInt(
      process.env.JWT_ACCESS_EXPIRATION_MINUTES || "30"
    ),
    refreshExpirationDays: parseInt(
      process.env.JWT_REFRESH_EXPIRATION_DAYS || "10"
    ),
    resetPasswordExpirationMinutes: parseInt(
      process.env.JWT_RESET_PASSWORD_EXPIRATION_MINUTES || "15"
    ),
  },
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "production",
    sameSite: "strict",
    maxAge: parseInt(process.env.COOKIE_MAX_AGE || "86400000"), // 24 hours in milliseconds
  },
  corsOptions: {
    origin: function (origin: any, callback: any) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 600, // Cache preflight requests for 10 minutes
    credentials: true,
    optionsSuccessStatus: 200,
  },
};
