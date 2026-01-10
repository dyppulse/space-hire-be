import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking is required'],
      unique: true,
    },
    space: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Space',
      required: [true, 'Space is required'],
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Guest is required'],
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Host is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
    },
    comment: {
      type: String,
      trim: true,
    },
    categories: {
      cleanliness: { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      value: { type: Number, min: 1, max: 5 },
      location: { type: Number, min: 1, max: 5 },
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

// Update space rating when review is created/updated
reviewSchema.post('save', async function () {
  const Review = mongoose.model('Review')
  const Space = mongoose.model('Space')

  const reviews = await Review.find({ space: this.space })
  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length

  await Space.findByIdAndUpdate(this.space, {
    'rating.average': Math.round(averageRating * 10) / 10,
    'rating.count': reviews.length,
  })
})

reviewSchema.index({ space: 1 })
reviewSchema.index({ guest: 1 })

export default mongoose.model('Review', reviewSchema)

