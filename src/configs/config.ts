// config.js
import dotenv from "dotenv";

dotenv.config();

export interface AppConfig {
  port: string | number;
  nodeEnv: string;
  isProduction: boolean;
  apiVersion: string;
  frontendUrl: string;
  name: string;
}

export interface MongooseConfig {
  url: string;
  options: {
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
  };
}

export interface JwtConfig {
  secret: string;
  accessExpirationMinutes: number;
  refreshExpirationDays: number;
  resetPasswordExpirationMinutes: number;
}

export interface CookieConfig {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'None' | 'Lax' | 'Strict';
  maxAge: number;
}

export interface CorsOptions {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void;
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  maxAge: number;
  credentials: boolean;
  optionsSuccessStatus: number;
}

export interface EmailConfig {
  user?: string;
  smtpKey?: string;
  defaultFrom: string;
}

export interface AppFullConfig {
  app: AppConfig;
  mongoose: MongooseConfig;
  jwt: JwtConfig;
  cookie: CookieConfig;
  corsOptions: CorsOptions;
  email: EmailConfig;
}

export const allowedOrigins: string[] = process.env.ALLOWED_ORIGINS?.split(",") || [
  "http://localhost:3000",
  "http://localhost:4200",
  "http://localhost:5173",
];

export const config: AppFullConfig = {
  app: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || "development",
    isProduction: process.env.NODE_ENV === "production",
    apiVersion: process.env.API_VERSION || '1',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    name: process.env.APP_NAME || 'Node Express Server',
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
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: parseInt(process.env.COOKIE_MAX_AGE || "86400000"), // 24 hours in milliseconds
  },
  corsOptions: {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
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
  email: {
    user: process.env.BREVO_USER,
    smtpKey: process.env.BREVO_SMTP_KEY,
    defaultFrom: process.env.EMAIL_FROM || 'noreply@example.com',
  },
};
