import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { sendMessage, getMessages, markAsRead } from '../controllers/messageController.js'

const router = express.Router()

router.use(authenticate)

router.post('/', sendMessage)
router.get('/', getMessages)
router.patch('/:id/read', markAsRead)

export default router

