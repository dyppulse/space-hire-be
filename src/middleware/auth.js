import jwt from 'jsonwebtoken'
import { UnauthenticatedError, UnauthorizedError } from '../errors/index.js'
import User from '../models/User.js'

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('Authentication invalid')
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.userId).select('-password')

    if (!user) {
      throw new UnauthenticatedError('User not found')
    }

    req.user = user
    next()
  } catch (error) {
    throw new UnauthenticatedError('Authentication invalid')
  }
}

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError('Not authorized to access this route')
    }
    next()
  }
}

