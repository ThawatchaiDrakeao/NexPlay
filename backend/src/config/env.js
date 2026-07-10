require('dotenv').config();

const allowedNodeEnvs = ['development', 'test', 'production'];

const readEnv = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = Number(process.env.PORT || 5000);

  const errors = [];

  if (!allowedNodeEnvs.includes(nodeEnv)) {
    errors.push('NODE_ENV must be one of: development, test, production');
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    errors.push('PORT must be a valid TCP port');
  }

  if (nodeEnv === 'production') {
    ['CORS_ORIGIN', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'].forEach((key) => {
      if (!process.env[key]) {
        errors.push(`${key} is required in production`);
      }
    });
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors.join('; ')}`);
  }

  return {
    nodeEnv,
    port,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  };
};

const env = readEnv();

module.exports = { env };
