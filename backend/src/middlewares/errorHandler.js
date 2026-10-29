export function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.url}:`, err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

