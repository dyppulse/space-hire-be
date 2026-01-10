import { BadRequestError, NotFoundError, UnauthorizedError } from '../errors/index.js'
import Booking from '../models/Booking.js'
import Space from '../models/Space.js'

export const createBooking = async (req, res) => {
  const { spaceId, startDate, endDate, startTime, endTime, guests, specialRequests } = req.body
  const userId = req.user._id

  if (!spaceId || !startDate || !endDate || !startTime || !endTime || !guests) {
    throw new BadRequestError('Please provide all required booking information')
  }

  const space = await Space.findById(spaceId)
  if (!space || !space.isActive) {
    throw new NotFoundError('Space not found')
  }

  // Check for conflicts
  const start = new Date(`${startDate}T${startTime}`)
  const end = new Date(`${endDate}T${endTime}`)

  if (start >= end) {
    throw new BadRequestError('End time must be after start time')
  }

  const conflictingBooking = await Booking.findOne({
    space: spaceId,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      {
        startDate: { $lte: end },
        endDate: { $gte: start },
      },
    ],
  })

  if (conflictingBooking) {
    throw new BadRequestError('Space is already booked for this time')
  }

  // Calculate price
  const hours = Math.ceil((end - start) / (1000 * 60 * 60))
  const subtotal = space.pricePerHour * hours
  const serviceFee = subtotal * 0.1 // 10% service fee
  const totalPrice = subtotal + serviceFee

  const booking = await Booking.create({
    guest: userId,
    space: spaceId,
    startDate: start,
    endDate: end,
    startTime,
    endTime,
    guests: Number(guests),
    totalPrice,
    serviceFee,
    specialRequests,
    status: space.instantBooking ? 'confirmed' : 'pending',
  })

  const populatedBooking = await Booking.findById(booking._id)
    .populate('space', 'name images location pricePerHour')
    .populate('guest', 'name email')

  res.status(201).json({
    success: true,
    booking: populatedBooking,
  })
}

export const getBookings = async (req, res) => {
  const { status, role } = req.query
  const userId = req.user._id

  const query = {}

  if (role === 'host') {
    // Get spaces owned by user
    const userSpaces = await Space.find({ host: userId }).select('_id')
    const spaceIds = userSpaces.map((s) => s._id)
    query.space = { $in: spaceIds }
  } else {
    query.guest = userId
  }

  if (status) {
    query.status = status
  }

  const bookings = await Booking.find(query)
    .populate('space', 'name images location')
    .populate('guest', 'name email')
    .sort({ createdAt: -1 })

  res.status(200).json({
    success: true,
    bookings,
  })
}

export const getBooking = async (req, res) => {
  const { id } = req.params
  const userId = req.user._id

  const booking = await Booking.findById(id)
    .populate('space')
    .populate('guest', 'name email phone')
    .populate('space.host', 'name email phone')

  if (!booking) {
    throw new NotFoundError('Booking not found')
  }

  // Check authorization
  const isGuest = booking.guest._id.toString() === userId.toString()
  const space = await Space.findById(booking.space._id)
  const isHost = space.host.toString() === userId.toString()

  if (!isGuest && !isHost && req.user.role !== 'admin') {
    throw new UnauthorizedError('Not authorized to view this booking')
  }

  res.status(200).json({
    success: true,
    booking,
  })
}

export const updateBookingStatus = async (req, res) => {
  const { id } = req.params
  const { status, cancellationReason } = req.body
  const userId = req.user._id

  const booking = await Booking.findById(id).populate('space')

  if (!booking) {
    throw new NotFoundError('Booking not found')
  }

  const space = await Space.findById(booking.space._id)
  const isHost = space.host.toString() === userId.toString()

  if (!isHost && req.user.role !== 'admin') {
    throw new UnauthorizedError('Not authorized to update this booking')
  }

  if (!['confirmed', 'declined', 'cancelled'].includes(status)) {
    throw new BadRequestError('Invalid status')
  }

  booking.status = status
  if (status === 'cancelled' && cancellationReason) {
    booking.cancellationReason = cancellationReason
    booking.cancelledAt = new Date()
  }

  await booking.save()

  res.status(200).json({
    success: true,
    booking,
  })
}

