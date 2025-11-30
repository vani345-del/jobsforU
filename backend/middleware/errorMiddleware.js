// middleware/errorMiddleware.js
// Handler for 404 Not Found errors
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pass the error to the main error handler
};

// General error handler middleware
const errorHandler = (err, req, res, next) => {
  // Sometimes Express sets the status to 200 even if there's an error, so we fix it.
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  res.json({
    message: err.message,
    // Stack trace is only shown in development for security
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });

};

export { notFound, errorHandler };
