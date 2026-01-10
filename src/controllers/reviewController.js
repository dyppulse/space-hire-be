import { BadRequestError, NotFoundError } from '../errors/index.js'
import Review from '../models/Review.js'
import Booking from '../models/Booking.js'

export const createReview = async (req, res) => {
  const { bookingId, rating, comment, categories } = req.body
  const userId = req.user._id

  if (!bookingId || !rating) {
    throw new BadRequestError('Please provide booking ID and rating')
  }

  const booking = await Booking.findById(bookingId)
    .populate('space')
    .populate('guest')

  if (!booking) {
    throw new NotFoundError('Booking not found')
  }

  if (booking.guest._id.toString() !== userId.toString()) {
    throw new BadRequestError('Only the guest can leave a review')
  }

  if (booking.status !== 'completed') {
    throw new BadRequestError('Can only review completed bookings')
  }

  // Check if review already exists
  const existingReview = await Review.findOne({ booking: bookingId })
  if (existingReview) {
    throw new BadRequestError('Review already exists for this booking')
  }

  const review = await Review.create({
    booking: bookingId,
    space: booking.space._id,
    guest: userId,
    host: booking.space.host,
    rating: Number(rating),
    comment,
    categories,
  })

  const populatedReview = await Review.findById(review._id)
    .populate('guest', 'name avatar')
    .populate('space', 'name')

  res.status(201).json({
    success: true,
    review: populatedReview,
  })
}

export const getSpaceReviews = async (req, res) => {
  const { spaceId } = req.params

  const reviews = await Review.find({ space: spaceId })
    .populate('guest', 'name avatar')
    .sort({ createdAt: -1 })

  res.status(200).json({
    success: true,
    reviews,
  })
}

