// Middleware for handling 404 Not Found errors
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); 
};

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  // Set the status code, defaulting to 500 if the response status is still 200
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode; 
  res.status(statusCode);
  res.json({
    message: err.message,
    // Only show the stack trace in development mode for security
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };