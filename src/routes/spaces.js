import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { upload } from '../middleware/multer.js'
import {
  getAllSpaces,
  getSpace,
  createSpace,
  updateSpace,
  deleteSpace,
  getFeaturedSpaces,
} from '../controllers/spaceController.js'

const router = express.Router()

router.get('/featured', getFeaturedSpaces)
router.get('/', getAllSpaces)
router.get('/:id', getSpace)
router.post('/', authenticate, upload.array('images', 10), createSpace)
router.patch('/:id', authenticate, upload.array('images', 10), updateSpace)
router.delete('/:id', authenticate, deleteSpace)

export default router

