import { readFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import { v2 as cloudinary } from 'cloudinary'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv-safe'
import express from 'express'
import mongoose from 'mongoose'
import swaggerUi from 'swagger-ui-express'

import { errorHandler } from './src/middleware/errorHandler.js'
import adminRoutes from './src/routes/admin.js'
import authRoutes from './src/routes/auth.js'
import bookingRoutes from './src/routes/bookings.js'
import messageRoutes from './src/routes/messages.js'
import reviewRoutes from './src/routes/reviews.js'
import spaceRoutes from './src/routes/spaces.js'
import userRoutes from './src/routes/users.js'
import logger from './src/utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({
  example: '.env.example',
  allowEmptyValues: false,
})

// Initialize express app
const app = express()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_APP_URL,
].filter(Boolean)

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true)
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      if (process.env.NODE_ENV !== 'production') {
        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
          return callback(null, true)
        }
      }
      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Swagger documentation
try {
  const swaggerOutput = JSON.parse(
    await readFile(join(__dirname, 'swagger-output.json'), 'utf-8')
  )
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOutput))
} catch (error) {
  logger.warn('Swagger documentation not found, skipping...')
}

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/spaces', spaceRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/users', userRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/admin', adminRoutes)

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use(errorHandler)

// Connect to MongoDB and start server
const PORT = process.env.PORT || 4000

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.success('Connected to MongoDB')
    app.listen(PORT, () => {
      logger.success(`Server running on port ${PORT}`)
      logger.info('API Documentation available at /api-docs')
    })
  })
  .catch((error) => {
    logger.error('MongoDB connection error', { error: error.message })
    process.exit(1)
  })

export default app

