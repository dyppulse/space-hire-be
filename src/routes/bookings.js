import express from 'express'
import { authenticate } from '../middleware/auth.js'
import {
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
} from '../controllers/bookingController.js'

const router = express.Router()

router.use(authenticate)

router.post('/', createBooking)
router.get('/', getBookings)
router.get('/:id', getBooking)
router.patch('/:id/status', updateBookingStatus)

export default router

