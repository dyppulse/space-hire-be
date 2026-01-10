import mongoose from 'mongoose'
import dotenv from 'dotenv-safe'
import User from '../models/User.js'

dotenv.config()

const adminUsers = [
  {
    name: 'Admin User',
    email: 'admin@spacehire.com',
    password: 'admin123',
    phone: '+256700000001',
    role: 'admin',
    isVerified: true,
  },
  {
    name: 'Super Admin',
    email: 'superadmin@spacehire.com',
    password: 'admin123',
    phone: '+256700000002',
    role: 'admin',
    isVerified: true,
  },
  {
    name: 'System Administrator',
    email: 'system@spacehire.com',
    password: 'admin123',
    phone: '+256700000003',
    role: 'admin',
    isVerified: true,
  },
]

const seedAdmins = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Create admin users
    const createdAdmins = []
    for (const adminData of adminUsers) {
      // Check if admin already exists
      const existingAdmin = await User.findOne({ email: adminData.email })
      
      if (existingAdmin) {
        console.log(`Admin ${adminData.email} already exists, skipping...`)
        continue
      }

      const admin = await User.create(adminData)
      createdAdmins.push(admin)
      console.log(`✅ Created admin: ${admin.name} (${admin.email})`)
    }

    if (createdAdmins.length === 0) {
      console.log('\n⚠️  All admin users already exist in the database.')
    } else {
      console.log(`\n✅ Successfully seeded ${createdAdmins.length} admin user(s)!`)
      console.log('\nAdmin credentials:')
      adminUsers.forEach((admin) => {
        console.log(`  Email: ${admin.email}`)
        console.log(`  Password: ${admin.password}`)
        console.log('  ---')
      })
    }

    process.exit(0)
  } catch (error) {
    console.error('Error seeding admin users:', error)
    process.exit(1)
  }
}

seedAdmins()

