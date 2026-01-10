import express from 'express'
import { authenticate } from '../middleware/auth.js'
import {
  getUserProfile,
  updateProfile,
  getUserSpaces,
  getUserStats,
} from '../controllers/userController.js'

const router = express.Router()

router.get('/:id', getUserProfile)
router.get('/:id/spaces', getUserSpaces)
router.get('/me/stats', authenticate, getUserStats)
router.patch('/me', authenticate, updateProfile)

export default router

