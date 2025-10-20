import { ApiError } from '../utils/error.utils.js';

export const errorMiddleWare = (err, req, res, next) => {
  if (!(err instanceof ApiError)) {
    console.error('Unhandled Error', err);
    err = new ApiError(500, err.message || 'Internal server error');
  }

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message,
    errors: err.errors || [],
    stack: process.env.NODE_ENV == +'development' ? err.stack : undefined,
  });
};
