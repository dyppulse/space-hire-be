import { BadRequestError, NotFoundError, UnauthorizedError } from '../errors/index.js'
import Booking from '../models/Booking.js'
import Space from '../models/Space.js'
import { isValidPhoneNumber } from 'libphonenumber-js'

export const createBooking = async (req, res) => {
  const { spaceId, startDate, endDate, startTime, endTime, guests, specialRequests, guestName, guestPhone, guestEmail } = req.body
  const userId = req.user?._id // User ID is optional for unauthenticated bookings

  // Validate required fields
  if (!spaceId || !startDate || !endDate || !guests) {
    throw new BadRequestError('Please provide all required booking information')
  }

  // Name is required for all bookings
  if (!guestName || !guestName.trim()) {
    throw new BadRequestError('Name is required for bookings')
  }

  // Phone is required for all bookings
  if (!guestPhone || !guestPhone.trim()) {
    throw new BadRequestError('Phone number is required for bookings')
  }

  // Validate phone number format (E.164 format with country code)
  if (!isValidPhoneNumber(guestPhone.trim())) {
    throw new BadRequestError('Please provide a valid phone number with country code (e.g., +256700000000)')
  }

  // If email is provided, validate format
  if (guestEmail && !guestEmail.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
    throw new BadRequestError('Please provide a valid email address')
  }

  const space = await Space.findById(spaceId)
  if (!space || !space.isActive) {
    throw new NotFoundError('Space not found')
  }

  // Check if it's a single day booking
  const isSingleDay = startDate === endDate

  // For single day bookings, times are required
  if (isSingleDay && (!startTime || !endTime)) {
    throw new BadRequestError('Start time and end time are required for single day bookings')
  }

  // Parse dates - for multi-day bookings, use start and end of day
  let start, end
  const now = new Date()

  if (isSingleDay) {
    // Single day: use provided times
    start = new Date(`${startDate}T${startTime}`)
    end = new Date(`${endDate}T${endTime}`)

    // Validate that start date/time is not in the past
    if (start < now) {
      throw new BadRequestError('Cannot book space for a past date. Please select a future date and time.')
    }

    // Validate that end date/time is not in the past
    if (end < now) {
      throw new BadRequestError('End date and time cannot be in the past')
    }

    if (start >= end) {
      throw new BadRequestError('End time must be after start time')
    }
  } else {
    // Multi-day: use start of first day (00:00:00 local time) and end of last day (23:59:59 local time)
    // Parse dates as local time to avoid timezone issues
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number)
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number)
    
    // Create dates at start and end of day in local timezone
    start = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0)
    end = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999)

    // Get today's date as YYYY-MM-DD string in local timezone for comparison
    const today = new Date()
    const todayYear = today.getFullYear()
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0')
    const todayDay = String(today.getDate()).padStart(2, '0')
    const todayStr = `${todayYear}-${todayMonth}-${todayDay}` // Format: YYYY-MM-DD in local timezone
    
    // Validate that start date is not in the past (compare date strings)
    // Allow bookings starting from today
    if (startDate < todayStr) {
      throw new BadRequestError('Cannot book space for a past date. Please select today or a future date.')
    }

    // Validate that end date is not in the past (compare date strings)
    // Allow bookings ending today
    if (endDate < todayStr) {
      throw new BadRequestError('End date cannot be in the past. Please select today or a future date.')
    }

    if (start >= end) {
      throw new BadRequestError('End date must be after start date')
    }
  }

  // Check for date overlap conflicts
  // A booking conflicts if: new start < existing end AND new end > existing start
  const conflictingBooking = await Booking.findOne({
    space: spaceId,
    status: { $in: ['pending', 'confirmed'] },
    $and: [
      { startDate: { $lte: end } },
      { endDate: { $gte: start } },
    ],
  })

  if (conflictingBooking) {
    throw new BadRequestError('Space is already booked for this time')
  }

  // Calculate price
  let hours
  if (isSingleDay) {
    hours = Math.ceil((end - start) / (1000 * 60 * 60))
  } else {
    // For multi-day bookings, calculate full days
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1 // +1 to include both start and end days
    hours = days * 24 // Full days = 24 hours per day
  }

  const subtotal = space.pricePerHour * hours
  const serviceFee = subtotal * 0.1 // 10% service fee
  const totalPrice = subtotal + serviceFee

  const booking = await Booking.create({
    guest: userId || null,
    guestName: guestName || null,
    guestPhone: guestPhone || null,
    guestEmail: guestEmail || null,
    space: spaceId,
    startDate: start,
    endDate: end,
    startTime: startTime || '',
    endTime: endTime || '',
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
  const { status, role, spaceId } = req.query
  const userId = req.user._id

  const query = {}

  // Admin can see all bookings OR filter by specific space
  if (req.user.role === 'admin') {
    if (spaceId) {
      query.space = spaceId
    }
    // If no spaceId, show all bookings (no filter on space)
  } else if (role === 'host' || req.user.role === 'host') {
    // Get spaces owned by user
    const userSpaces = await Space.find({ host: userId }).select('_id')
    const spaceIds = userSpaces.map((s) => s._id)
    query.space = { $in: spaceIds }
  } else {
    // Guest bookings
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

