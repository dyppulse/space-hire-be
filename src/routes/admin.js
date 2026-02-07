import express from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import {
  createHost,
  getAllUsers,
  getUserById,
  getUserSpaces,
  getDashboardStats,
} from '../controllers/adminController.js'

const router = express.Router()

// All admin routes require authentication and admin role
router.use(authenticate)
router.use(authorize('admin'))

// Admin dashboard
router.get('/dashboard', getDashboardStats)

// User management routes
router.post('/users', createHost) // Create new host
router.get('/users', getAllUsers) // Get all users with filtering
router.get('/users/:userId', getUserById) // Get user by ID
router.get('/users/:userId/spaces', getUserSpaces) // Get spaces for a specific host

export default router

