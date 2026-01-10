import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { createReview, getSpaceReviews } from '../controllers/reviewController.js'

const router = express.Router()

router.get('/space/:spaceId', getSpaceReviews)
router.post('/', authenticate, createReview)

export default router

