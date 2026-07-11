require("dotenv").config();

const allowedNodeEnvs = ["development", "test", "production"];

const readEnv = () => {
  const nodeEnv = process.env.NODE_ENV || "development";
  const port = Number(process.env.PORT || 5000);

  const errors = [];

  if (!allowedNodeEnvs.includes(nodeEnv)) {
    errors.push("NODE_ENV must be one of: development, test, production");
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    errors.push("PORT must be a valid TCP port");
  }

  if (nodeEnv === "production") {
    [
      "CORS_ORIGIN",
      "SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "JWT_SECRET",
      "LINE_CHANNEL_ID",
      "LINE_CHANNEL_SECRET",
      "LINE_CHANNEL_ACCESS_TOKEN",
    ].forEach((key) => {
      if (!process.env[key]) {
        errors.push(`${key} is required in production`);
      }
    });
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    errors.push("JWT_SECRET must be at least 32 characters");
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors.join("; ")}`);
  }

  return {
    nodeEnv,
    port,

    corsOrigin:
      process.env.CORS_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173",

    jwtSecret: process.env.JWT_SECRET || "development-only-nexplay-jwt-secret",

    // LINE
    lineChannelId: process.env.LINE_CHANNEL_ID || process.env.LINE_CLIENT_ID,

    lineChannelSecret: process.env.LINE_CHANNEL_SECRET,

    lineChannelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,

    // Supabase
    supabaseUrl: process.env.SUPABASE_URL,

    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,

    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
};

const env = readEnv();

module.exports = { env };
