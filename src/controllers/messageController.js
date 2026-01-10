import { BadRequestError, NotFoundError, UnauthorizedError } from '../errors/index.js'
import Message from '../models/Message.js'
import Booking from '../models/Booking.js'

export const sendMessage = async (req, res) => {
  const { bookingId, recipientId, content } = req.body
  const userId = req.user._id

  if (!recipientId || !content) {
    throw new BadRequestError('Please provide recipient and message content')
  }

  // Verify booking exists and user is part of it
  if (bookingId) {
    const booking = await Booking.findById(bookingId)
      .populate('space')
      .populate('guest')

    if (!booking) {
      throw new NotFoundError('Booking not found')
    }

    const isGuest = booking.guest._id.toString() === userId.toString()
    const isHost = booking.space.host.toString() === userId.toString()

    if (!isGuest && !isHost) {
      throw new UnauthorizedError('Not authorized to send message for this booking')
    }
  }

  const message = await Message.create({
    booking: bookingId || null,
    sender: userId,
    recipient: recipientId,
    content,
  })

  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'name avatar')
    .populate('recipient', 'name avatar')

  res.status(201).json({
    success: true,
    message: populatedMessage,
  })
}

export const getMessages = async (req, res) => {
  const { bookingId, userId: otherUserId } = req.query
  const currentUserId = req.user._id

  const query = {
    $or: [
      { sender: currentUserId },
      { recipient: currentUserId },
    ],
  }

  if (bookingId) {
    query.booking = bookingId
  }

  if (otherUserId) {
    query.$and = [
      {
        $or: [
          { sender: currentUserId, recipient: otherUserId },
          { sender: otherUserId, recipient: currentUserId },
        ],
      },
    ]
  }

  const messages = await Message.find(query)
    .populate('sender', 'name avatar')
    .populate('recipient', 'name avatar')
    .sort({ createdAt: 1 })

  res.status(200).json({
    success: true,
    messages,
  })
}

export const markAsRead = async (req, res) => {
  const { id } = req.params
  const userId = req.user._id

  const message = await Message.findById(id)

  if (!message) {
    throw new NotFoundError('Message not found')
  }

  if (message.recipient.toString() !== userId.toString()) {
    throw new UnauthorizedError('Not authorized to mark this message as read')
  }

  message.isRead = true
  message.readAt = new Date()
  await message.save()

  res.status(200).json({
    success: true,
    message,
  })
}

