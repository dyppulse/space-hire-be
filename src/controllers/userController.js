import { BadRequestError, NotFoundError } from '../errors/index.js'
import User from '../models/User.js'
import Space from '../models/Space.js'
import Booking from '../models/Booking.js'

export const getUserProfile = async (req, res) => {
  const { id } = req.params

  const user = await User.findById(id).select('-password')

  if (!user) {
    throw new NotFoundError('User not found')
  }

  res.status(200).json({
    success: true,
    user,
  })
}

export const updateProfile = async (req, res) => {
  const userId = req.user._id
  const { name, phone, avatar } = req.body

  const user = await User.findByIdAndUpdate(
    userId,
    { name, phone, avatar },
    { new: true, runValidators: true }
  ).select('-password')

  res.status(200).json({
    success: true,
    user,
  })
}

export const getUserSpaces = async (req, res) => {
  const { id } = req.params

  const spaces = await Space.find({ host: id, isActive: true })
    .sort({ createdAt: -1 })

  res.status(200).json({
    success: true,
    spaces,
  })
}

export const getUserStats = async (req, res) => {
  const userId = req.user._id

  const spacesCount = await Space.countDocuments({ host: userId, isActive: true })
  const bookingsCount = await Booking.countDocuments({ guest: userId })
  const completedBookings = await Booking.countDocuments({
    guest: userId,
    status: 'completed',
  })

  res.status(200).json({
    success: true,
    stats: {
      spacesCount,
      bookingsCount,
      completedBookings,
    },
  })
}

