import express from 'express'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()

router.use(authenticate)
router.use(authorize('admin'))

// Admin routes can be added here
router.get('/dashboard', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin dashboard',
  })
})

export default router

