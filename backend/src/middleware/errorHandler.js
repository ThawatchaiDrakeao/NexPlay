const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      message: 'Resource not found'
    }
  });
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: {
      message: statusCode >= 500 ? 'Internal server error' : err.message
    }
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
