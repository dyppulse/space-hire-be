import logger from '../utils/logger.js'

// Using standard HTTP status codes instead of http-status-codes package
const StatusCodes = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
}

export const errorHandler = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || 'Something went wrong, please try again later',
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    customError.message = Object.values(err.errors)
      .map((item) => item.message)
      .join(', ')
    customError.statusCode = StatusCodes.BAD_REQUEST
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    customError.message = `Duplicate value entered for ${Object.keys(err.keyValue)} field, please choose another value`
    customError.statusCode = StatusCodes.BAD_REQUEST
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    customError.message = `No item found with id: ${err.value}`
    customError.statusCode = StatusCodes.NOT_FOUND
  }

  logger.error(err.message, {
    error: err,
    url: req.originalUrl,
    method: req.method,
  })

  return res.status(customError.statusCode).json({
    success: false,
    message: customError.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

