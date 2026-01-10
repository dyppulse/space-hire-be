import jwt from 'jsonwebtoken'
import { BadRequestError, UnauthenticatedError } from '../errors/index.js'
import User from '../models/User.js'

const createJWT = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  })
}

export const register = async (req, res) => {
  const { name, email, password, phone, role } = req.body

  if (!name || !email || !password) {
    throw new BadRequestError('Please provide name, email, and password')
  }

  const userAlreadyExists = await User.findOne({ email })
  if (userAlreadyExists) {
    throw new BadRequestError('Email already exists')
  }

  const user = await User.create({ name, email, password, phone, role: role || 'guest' })
  const token = createJWT(user._id)

  res.status(201).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
    token,
  })
}

export const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new BadRequestError('Please provide email and password')
  }

  const user = await User.findOne({ email }).select('+password')
  if (!user) {
    throw new UnauthenticatedError('Invalid credentials')
  }

  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid credentials')
  }

  const token = createJWT(user._id)

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
    token,
  })
}

export const getCurrentUser = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  })
}

