import mongoose from 'mongoose'
import dotenv from 'dotenv-safe'
import Space from '../models/Space.js'
import User from '../models/User.js'

dotenv.config()

const sampleSpaces = [
  {
    name: 'Modern Conference Center - Kampala',
    description: 'A spacious and modern conference center perfect for business meetings, workshops, and corporate events. Features state-of-the-art AV equipment, high-speed WiFi, and professional catering services.',
    images: [
      { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', publicId: 'sample1' },
      { url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800', publicId: 'sample2' },
    ],
    location: {
      address: 'Plot 15, Nakasero Road',
      city: 'Kampala',
      district: 'Nakasero',
      coordinates: { lat: 0.3136, lng: 32.5811 },
    },
    pricePerHour: 150000,
    capacity: 100,
    amenities: ['WiFi', 'Projector', 'Sound System', 'Air Conditioning', 'Parking', 'Catering'],
    spaceType: 'indoor',
    activityTypes: ['meeting', 'conference', 'workshop'],
    rules: ['No smoking', 'No loud music after 10 PM', 'Respect the space'],
    availability: {
      monday: { available: true, hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
      tuesday: { available: true, hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
      wednesday: { available: true, hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
      thursday: { available: true, hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
      friday: { available: true, hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
      saturday: { available: true, hours: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'] },
      sunday: { available: false, hours: [] },
    },
    minimumBookingHours: 2,
    instantBooking: true,
    rating: { average: 4.8, count: 24 },
  },
  {
    name: 'Rooftop Event Space - Kololo',
    description: 'Beautiful rooftop venue with stunning city views. Perfect for parties, celebrations, and social gatherings. Features outdoor bar area, sound system, and lighting.',
    images: [
      { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800', publicId: 'sample3' },
      { url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800', publicId: 'sample4' },
    ],
    location: {
      address: 'Acacia Avenue, Kololo',
      city: 'Kampala',
      district: 'Kololo',
      coordinates: { lat: 0.3314, lng: 32.5822 },
    },
    pricePerHour: 200000,
    capacity: 150,
    amenities: ['Outdoor Space', 'Bar', 'Sound System', 'Lighting', 'Restrooms', 'Parking'],
    spaceType: 'rooftop',
    activityTypes: ['party', 'wedding'],
    rules: ['No smoking indoors', 'Music must end by midnight', 'Clean up after event'],
    availability: {
      monday: { available: false, hours: [] },
      tuesday: { available: false, hours: [] },
      wednesday: { available: true, hours: ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00'] },
      thursday: { available: true, hours: ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00'] },
      friday: { available: true, hours: ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00'] },
      saturday: { available: true, hours: ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'] },
      sunday: { available: true, hours: ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'] },
    },
    minimumBookingHours: 3,
    instantBooking: false,
    rating: { average: 4.6, count: 18 },
  },
  {
    name: 'Professional Photo Studio - Ntinda',
    description: 'Fully equipped photography studio with professional lighting, backdrops, and equipment. Perfect for portrait sessions, product photography, and creative projects.',
    images: [
      { url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', publicId: 'sample5' },
      { url: 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=800', publicId: 'sample6' },
    ],
    location: {
      address: 'Ntinda Shopping Center, 2nd Floor',
      city: 'Kampala',
      district: 'Ntinda',
      coordinates: { lat: 0.3606, lng: 32.6256 },
    },
    pricePerHour: 80000,
    capacity: 10,
    amenities: ['Professional Lighting', 'Backdrops', 'Changing Room', 'WiFi', 'Equipment Available', 'Parking'],
    spaceType: 'studio',
    activityTypes: ['photo-shoot', 'film-production'],
    rules: ['Handle equipment with care', 'No food or drinks in studio', 'Return equipment to original position'],
    availability: {
      monday: { available: true, hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
      tuesday: { available: true, hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
      wednesday: { available: true, hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
      thursday: { available: true, hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
      friday: { available: true, hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
      saturday: { available: true, hours: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'] },
      sunday: { available: false, hours: [] },
    },
    minimumBookingHours: 1,
    instantBooking: true,
    rating: { average: 4.9, count: 32 },
  },
  {
    name: 'Cozy Workshop Space - Makindye',
    description: 'Intimate workshop space ideal for small classes, training sessions, and creative workshops. Features whiteboards, projector, and comfortable seating.',
    images: [
      { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', publicId: 'sample7' },
      { url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800', publicId: 'sample8' },
    ],
    location: {
      address: 'Makindye Road, Near Roundabout',
      city: 'Kampala',
      district: 'Makindye',
      coordinates: { lat: 0.2806, lng: 32.5811 },
    },
    pricePerHour: 60000,
    capacity: 30,
    amenities: ['Whiteboard', 'Projector', 'WiFi', 'Air Conditioning', 'Tea/Coffee', 'Parking'],
    spaceType: 'indoor',
    activityTypes: ['workshop', 'meeting', 'conference'],
    rules: ['Keep noise levels reasonable', 'Clean up after use', 'No smoking'],
    availability: {
      monday: { available: true, hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
      tuesday: { available: true, hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
      wednesday: { available: true, hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
      thursday: { available: true, hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
      friday: { available: true, hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
      saturday: { available: true, hours: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'] },
      sunday: { available: false, hours: [] },
    },
    minimumBookingHours: 2,
    instantBooking: true,
    rating: { average: 4.7, count: 15 },
  },
  {
    name: 'Elegant Event Hall - Entebbe',
    description: 'Grand event hall perfect for weddings, corporate galas, and large celebrations. Features elegant décor, professional sound system, and spacious dance floor.',
    images: [
      { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800', publicId: 'sample9' },
      { url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800', publicId: 'sample10' },
    ],
    location: {
      address: 'Entebbe Road, Near Airport',
      city: 'Entebbe',
      district: 'Entebbe',
      coordinates: { lat: 0.0422, lng: 32.4435 },
    },
    pricePerHour: 300000,
    capacity: 300,
    amenities: ['Sound System', 'Lighting', 'Stage', 'Dance Floor', 'Catering Kitchen', 'Parking', 'Restrooms'],
    spaceType: 'event-hall',
    activityTypes: ['wedding', 'party', 'conference'],
    rules: ['No smoking', 'Music ends at 1 AM', 'Security deposit required', 'Catering available'],
    availability: {
      monday: { available: false, hours: [] },
      tuesday: { available: false, hours: [] },
      wednesday: { available: true, hours: ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'] },
      thursday: { available: true, hours: ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'] },
      friday: { available: true, hours: ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'] },
      saturday: { available: true, hours: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'] },
      sunday: { available: true, hours: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'] },
    },
    minimumBookingHours: 4,
    instantBooking: false,
    rating: { average: 4.5, count: 42 },
  },
  {
    name: 'Creative Co-working Space - Bugolobi',
    description: 'Modern co-working space with private meeting rooms, hot desks, and event space. Perfect for startups, freelancers, and small businesses.',
    images: [
      { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', publicId: 'sample11' },
      { url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800', publicId: 'sample12' },
    ],
    location: {
      address: 'Bugolobi Industrial Area',
      city: 'Kampala',
      district: 'Bugolobi',
      coordinates: { lat: 0.3106, lng: 32.6256 },
    },
    pricePerHour: 100000,
    capacity: 50,
    amenities: ['WiFi', 'Meeting Rooms', 'Kitchen', 'Printing', 'Parking', 'Air Conditioning', 'Coffee'],
    spaceType: 'office',
    activityTypes: ['meeting', 'workshop', 'conference'],
    rules: ['Respect other users', 'Keep noise levels low', 'Clean up workspace'],
    availability: {
      monday: { available: true, hours: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'] },
      tuesday: { available: true, hours: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'] },
      wednesday: { available: true, hours: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'] },
      thursday: { available: true, hours: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'] },
      friday: { available: true, hours: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'] },
      saturday: { available: true, hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'] },
      sunday: { available: false, hours: [] },
    },
    minimumBookingHours: 1,
    instantBooking: true,
    rating: { average: 4.8, count: 28 },
  },
  {
    name: 'Outdoor Garden Venue - Muyenga',
    description: 'Beautiful outdoor garden space perfect for outdoor events, garden parties, and celebrations. Features lush greenery, covered areas, and natural ambiance.',
    images: [
      { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800', publicId: 'sample13' },
      { url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800', publicId: 'sample14' },
    ],
    location: {
      address: 'Muyenga Hill, Kampala',
      city: 'Kampala',
      district: 'Muyenga',
      coordinates: { lat: 0.2806, lng: 32.6256 },
    },
    pricePerHour: 180000,
    capacity: 200,
    amenities: ['Outdoor Space', 'Covered Area', 'Sound System', 'Restrooms', 'Parking', 'Garden'],
    spaceType: 'outdoor',
    activityTypes: ['party', 'wedding'],
    rules: ['Respect the garden', 'No open fires', 'Clean up after event', 'Music ends at 11 PM'],
    availability: {
      monday: { available: false, hours: [] },
      tuesday: { available: false, hours: [] },
      wednesday: { available: true, hours: ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'] },
      thursday: { available: true, hours: ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'] },
      friday: { available: true, hours: ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'] },
      saturday: { available: true, hours: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'] },
      sunday: { available: true, hours: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'] },
    },
    minimumBookingHours: 3,
    instantBooking: false,
    rating: { average: 4.7, count: 19 },
  },
  {
    name: 'Film Production Studio - Nakawa',
    description: 'Professional film and video production studio with green screen, professional lighting, and sound equipment. Ideal for video shoots, interviews, and content creation.',
    images: [
      { url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', publicId: 'sample15' },
      { url: 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=800', publicId: 'sample16' },
    ],
    location: {
      address: 'Nakawa Industrial Area',
      city: 'Kampala',
      district: 'Nakawa',
      coordinates: { lat: 0.3606, lng: 32.6256 },
    },
    pricePerHour: 120000,
    capacity: 20,
    amenities: ['Green Screen', 'Professional Lighting', 'Sound Equipment', 'Editing Room', 'WiFi', 'Parking'],
    spaceType: 'studio',
    activityTypes: ['film-production', 'photo-shoot'],
    rules: ['Handle equipment carefully', 'No food in studio', 'Book editing room separately'],
    availability: {
      monday: { available: true, hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'] },
      tuesday: { available: true, hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'] },
      wednesday: { available: true, hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'] },
      thursday: { available: true, hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'] },
      friday: { available: true, hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'] },
      saturday: { available: true, hours: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
      sunday: { available: false, hours: [] },
    },
    minimumBookingHours: 2,
    instantBooking: true,
    rating: { average: 4.9, count: 26 },
  },
]

const seedSpaces = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Find or create a host user
    let host = await User.findOne({ role: 'host' })
    
    if (!host) {
      // Create a default host user if none exists
      host = new User({
        name: 'Sample Host',
        email: 'host@spacehire.com',
        password: 'password123', // This will be hashed by the pre-save hook
        role: 'host',
        phone: '+256700000000',
      })
      await host.save()
      console.log('Created default host user')
    }

    // Clear existing spaces (optional - comment out if you want to keep existing)
    // await Space.deleteMany({})
    // console.log('Cleared existing spaces')

    // Create sample spaces
    const spaces = []
    for (const spaceData of sampleSpaces) {
      const space = await Space.create({
        ...spaceData,
        host: host._id,
      })
      spaces.push(space)
      console.log(`Created space: ${space.name}`)
    }

    console.log(`\n✅ Successfully seeded ${spaces.length} sample spaces!`)
    console.log(`Host: ${host.name} (${host.email})`)
    
    process.exit(0)
  } catch (error) {
    console.error('Error seeding spaces:', error)
    process.exit(1)
  }
}

seedSpaces()

