import { BadRequestError, NotFoundError } from '../errors/index.js'
import User from '../models/User.js'
import Space from '../models/Space.js'

// Create a new host user (admin only)
export const createHost = async (req, res) => {
  const { name, email, password, phone } = req.body

  if (!name || !email || !password) {
    throw new BadRequestError('Please provide name, email, and password')
  }

  // Check if user already exists
  const userAlreadyExists = await User.findOne({ email: email.toLowerCase() })
  if (userAlreadyExists) {
    throw new BadRequestError('Email already exists')
  }

  // Create host user (role is always 'host' for this endpoint)
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phone: phone || '',
    role: 'host',
  })

  res.status(201).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
  })
}

// Get all users with optional filtering
export const getAllUsers = async (req, res) => {
  const { role, search, page = 1, limit = 50 } = req.query

  const query = {}

  if (role) {
    query.role = role
  }

  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ]
  }

  const skip = (Number(page) - 1) * Number(limit)

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))

  const total = await User.countDocuments(query)

  // Get space count for each host
  const usersWithSpaceCount = await Promise.all(
    users.map(async (user) => {
      const spaceCount = user.role === 'host' ? await Space.countDocuments({ host: user._id, isActive: true }) : 0
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        spaceCount,
        createdAt: user.createdAt,
      }
    })
  )

  res.status(200).json({
    success: true,
    users: usersWithSpaceCount,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  })
}

// Get user by ID
export const getUserById = async (req, res) => {
  const { userId } = req.params

  const user = await User.findById(userId).select('-password')

  if (!user) {
    throw new NotFoundError('User not found')
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      createdAt: user.createdAt,
      isVerified: user.isVerified,
    },
  })
}

// Get spaces for a specific user (host)
export const getUserSpaces = async (req, res) => {
  const { userId } = req.params

  const user = await User.findById(userId)

  if (!user) {
    throw new NotFoundError('User not found')
  }

  if (user.role !== 'host') {
    throw new BadRequestError('User is not a host')
  }

  const spaces = await Space.find({ host: userId, isActive: true })
    .populate('host', 'name email avatar')
    .sort({ createdAt: -1 })

  res.status(200).json({
    success: true,
    spaces,
    host: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
}

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get counts for all users by role (without pagination)
    const totalUsers = await User.countDocuments({})
    const totalAdmins = await User.countDocuments({ role: 'admin' })
    const totalHosts = await User.countDocuments({ role: 'host' })
    const totalSpaces = await Space.countDocuments({ isActive: true })

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalAdmins,
        totalHosts,
        totalSpaces,
      },
    })
  } catch (error) {
    throw new BadRequestError('Failed to fetch dashboard statistics')
  }
}
