// Using standard HTTP status codes instead of http-status-codes package
const StatusCodes = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
}

export class CustomAPIError extends Error {
  constructor(message) {
    super(message)
    this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
  }
}

export class BadRequestError extends CustomAPIError {
  constructor(message) {
    super(message)
    this.statusCode = StatusCodes.BAD_REQUEST
  }
}

export class NotFoundError extends CustomAPIError {
  constructor(message) {
    super(message)
    this.statusCode = StatusCodes.NOT_FOUND
  }
}

export class UnauthenticatedError extends CustomAPIError {
  constructor(message) {
    super(message)
    this.statusCode = StatusCodes.UNAUTHORIZED
  }
}

export class UnauthorizedError extends CustomAPIError {
  constructor(message) {
    super(message)
    this.statusCode = StatusCodes.FORBIDDEN
  }
}

