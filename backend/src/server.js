const { createApp } = require('./app');
const { env } = require('./config/env');

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`NexPlay API running on port ${env.port}`);
});

const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down NexPlay API.`);
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
