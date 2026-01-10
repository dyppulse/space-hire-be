import { BadRequestError, NotFoundError, UnauthorizedError } from '../errors/index.js'
import Space from '../models/Space.js'
import Booking from '../models/Booking.js'
import { v2 as cloudinary } from 'cloudinary'

export const getAllSpaces = async (req, res) => {
  const {
    city,
    spaceType,
    activityType,
    minPrice,
    maxPrice,
    minCapacity,
    instantBooking,
    search,
    sort = 'rating',
    page = 1,
    limit = 12,
  } = req.query

  const query = { isActive: true }

  if (city) {
    query['location.city'] = new RegExp(city, 'i')
  }

  if (spaceType) {
    query.spaceType = spaceType
  }

  if (activityType) {
    query.activityTypes = activityType
  }

  if (minPrice || maxPrice) {
    query.pricePerHour = {}
    if (minPrice) query.pricePerHour.$gte = Number(minPrice)
    if (maxPrice) query.pricePerHour.$lte = Number(maxPrice)
  }

  if (minCapacity) {
    query.capacity = { $gte: Number(minCapacity) }
  }

  if (instantBooking === 'true') {
    query.instantBooking = true
  }

  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { 'location.address': new RegExp(search, 'i') },
    ]
  }

  const sortOptions = {
    rating: { 'rating.average': -1 },
    priceLow: { pricePerHour: 1 },
    priceHigh: { pricePerHour: -1 },
    newest: { createdAt: -1 },
  }

  const skip = (Number(page) - 1) * Number(limit)

  const spaces = await Space.find(query)
    .populate('host', 'name avatar')
    .sort(sortOptions[sort] || sortOptions.rating)
    .skip(skip)
    .limit(Number(limit))

  const total = await Space.countDocuments(query)

  res.status(200).json({
    success: true,
    spaces,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  })
}

export const getSpace = async (req, res) => {
  const { id } = req.params

  const space = await Space.findOne({ _id: id, isActive: true }).populate(
    'host',
    'name avatar email phone'
  )

  if (!space) {
    throw new NotFoundError(`No space found with id ${id}`)
  }

  res.status(200).json({
    success: true,
    space,
  })
}

export const createSpace = async (req, res) => {
  const userId = req.user._id

  if (req.user.role !== 'host' && req.user.role !== 'admin') {
    throw new UnauthorizedError('Only hosts can create spaces')
  }

  const images = []
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'spacehire/spaces',
      })
      images.push({
        url: result.secure_url,
        publicId: result.public_id,
      })
    }
  }

  if (images.length === 0) {
    throw new BadRequestError('At least one image is required')
  }

  const spaceData = {
    ...req.body,
    host: userId,
    images,
    pricePerHour: Number(req.body.pricePerHour),
    capacity: Number(req.body.capacity),
    amenities: Array.isArray(req.body.amenities)
      ? req.body.amenities
      : req.body.amenities?.split(',').map((a) => a.trim()) || [],
    activityTypes: Array.isArray(req.body.activityTypes)
      ? req.body.activityTypes
      : req.body.activityTypes?.split(',').map((a) => a.trim()) || [],
  }

  const space = await Space.create(spaceData)

  res.status(201).json({
    success: true,
    space,
  })
}

export const updateSpace = async (req, res) => {
  const { id } = req.params
  const userId = req.user._id

  const space = await Space.findById(id)

  if (!space) {
    throw new NotFoundError(`No space found with id ${id}`)
  }

  if (space.host.toString() !== userId.toString() && req.user.role !== 'admin') {
    throw new UnauthorizedError('Not authorized to update this space')
  }

  // Handle image uploads
  if (req.files && req.files.length > 0) {
    const newImages = []
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'spacehire/spaces',
      })
      newImages.push({
        url: result.secure_url,
        publicId: result.public_id,
      })
    }
    req.body.images = [...(space.images || []), ...newImages]
  }

  const updatedSpace = await Space.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    space: updatedSpace,
  })
}

export const deleteSpace = async (req, res) => {
  const { id } = req.params
  const userId = req.user._id

  const space = await Space.findById(id)

  if (!space) {
    throw new NotFoundError(`No space found with id ${id}`)
  }

  if (space.host.toString() !== userId.toString() && req.user.role !== 'admin') {
    throw new UnauthorizedError('Not authorized to delete this space')
  }

  // Soft delete
  space.isActive = false
  await space.save()

  res.status(200).json({
    success: true,
    message: 'Space deleted successfully',
  })
}

export const getFeaturedSpaces = async (req, res) => {
  const spaces = await Space.find({ isActive: true })
    .sort({ 'rating.average': -1, 'rating.count': -1 })
    .limit(6)
    .populate('host', 'name avatar')

  res.status(200).json({
    success: true,
    spaces,
  })
}

