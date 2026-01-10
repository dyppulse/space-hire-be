import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
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

messageSchema.index({ sender: 1, recipient: 1 })
messageSchema.index({ booking: 1 })
messageSchema.index({ createdAt: -1 })

export default mongoose.model('Message', messageSchema)

