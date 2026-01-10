import mongoose from 'mongoose'

const spaceSchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Host is required'],
    },
    name: {
      type: String,
      required: [true, 'Space name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    location: {
      address: {
        type: String,
        required: [true, 'Address is required'],
      },
      city: {
        type: String,
        required: [true, 'City is required'],
      },
      district: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Price per hour is required'],
      min: [0, 'Price must be positive'],
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    amenities: [
      {
        type: String,
      },
    ],
    spaceType: {
      type: String,
      enum: [
        'indoor',
        'outdoor',
        'rooftop',
        'warehouse',
        'studio',
        'office',
        'restaurant',
        'event-hall',
        'other',
      ],
      required: true,
    },
    activityTypes: [
      {
        type: String,
        enum: [
          'meeting',
          'photo-shoot',
          'film-production',
          'party',
          'workshop',
          'conference',
          'wedding',
          'other',
        ],
      },
    ],
    rules: [String],
    availability: {
      monday: { available: Boolean, hours: [String] },
      tuesday: { available: Boolean, hours: [String] },
      wednesday: { available: Boolean, hours: [String] },
      thursday: { available: Boolean, hours: [String] },
      friday: { available: Boolean, hours: [String] },
      saturday: { available: Boolean, hours: [String] },
      sunday: { available: Boolean, hours: [String] },
    },
    minimumBookingHours: {
      type: Number,
      default: 1,
      min: 1,
    },
    instantBooking: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  }
)

// Indexes for search optimization
spaceSchema.index({ 'location.city': 1, isActive: 1 })
spaceSchema.index({ spaceType: 1, isActive: 1 })
spaceSchema.index({ pricePerHour: 1 })
spaceSchema.index({ rating: -1 })

export default mongoose.model('Space', spaceSchema)

