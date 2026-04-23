const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createTeamAdmins() {
  try {
    await mongoose.connect('mongodb://localhost:27017/gandhara');
    console.log(' Connected to gandhara database');

    // Use your existing Admin model
    const Admin = require('./models/Admin');

    // Your team admin accounts
    const teamAdmins = [
      {
        email: 'admin@gandharaofficial.org',
        password: 'Admin@2025!',
        name: 'Main Admin',
        role: 'super-admin'
      },
      {
        email: 'ehtisham@gandharaofficial.org',
        password: 'Ehtisham@2025!',
        name: 'Ehtisham',
        role: 'admin'
      },
      {
        email: 'asif@gandharaofficial.org',
        password: 'Asif@2025!',
        name: 'Asif',
        role: 'admin'
      },
      {
        email: 'mudassir@gandharaofficial.org',
        password: 'Mudassir@2025!',
        name: 'Mudassir',
        role: 'admin'
      },
      {
        email: 'taha@gandharaofficial.org',
        password: 'Taha@2025!',
        name: 'Taha',
        role: 'admin'
      },
      {
        email: 'adnan@gandharaofficial.org',
        password: 'Adnan@2025!',
        name: 'Adnan',
        role: 'admin'
      },
      {
        email: 'owais@gandharaofficial.org',
        password: 'Owais@2025!',
        name: 'Owais',
        role: 'admin'
      },
      {
        email: 'usaid@gandharaofficial.org',
        password: 'Usaid@2025!',
        name: 'Usaid',
        role: 'admin'
      },
      {
        email: 'ibrahim@gandharaofficial.org',
        password: 'Ibrahim@2025!',
        name: 'Ibrahim',
        role: 'admin'
      },
      {
        email: 'hamza@gandharaofficial.org',
        password: 'Hamza@2025!',
        name: 'Hamza',
        role: 'admin'
      },
      {
        email: 'talal@gandharaofficial.org',
        password: 'Talal@2025!',
        name: 'Talal',
        role: 'admin'
      }
    ];

    console.log(' Creating Team Admin Accounts...\n');

    for (const adminData of teamAdmins) {
      try {
        // Create admin (password will be auto-hashed by your model)
        const admin = new Admin(adminData);
        await admin.save();

        console.log(` ${adminData.name}: ${adminData.email}`);
        console.log(`    Password: ${adminData.password}`);
        console.log(`    Role: ${adminData.role}`);
        console.log('   ');

      } catch (error) {
        console.error(` Error creating ${adminData.email}:`, error.message);
      }
    }

    // Show summary
    const totalAdmins = await Admin.countDocuments();
    console.log(`\n SUMMARY: ${totalAdmins} total admin accounts for your team`);

  } catch (error) {
    console.error(' Error:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

createTeamAdmins();