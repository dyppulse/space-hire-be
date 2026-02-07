import express from 'express'
import { authenticate } from '../middleware/auth.js'
import {
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
} from '../controllers/bookingController.js'

const router = express.Router()

// POST /bookings - Allow unauthenticated bookings
router.post('/', createBooking)

// All other routes require authentication
router.use(authenticate)

router.get('/', getBookings)
router.get('/:id', getBooking)
router.patch('/:id/status', updateBookingStatus)

export default router

