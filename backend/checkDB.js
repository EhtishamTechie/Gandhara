const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    
    // Check products
    const Product = require('./models/Product');
    const productCount = await Product.countDocuments();
    console.log(`📦 Products in database: ${productCount}`);
    
    if (productCount > 0) {
      const sampleProducts = await Product.find().limit(3);
      console.log('\n📋 Sample products:');
      sampleProducts.forEach(p => {
        console.log(`  - ${p.title} (${p._id})`);
      });
    }
    
    // Check visit places
    const VisitPlace = require('./models/VisitPlace');
    const placeCount = await VisitPlace.countDocuments();
    console.log(`\n🏛️  Visit places in database: ${placeCount}`);
    
    // Check masters
    const Master = require('./models/Master');
    const masterCount = await Master.countDocuments();
    console.log(`👨‍🎨 Masters in database: ${masterCount}`);
    
    // Check admins
    const Admin = require('./models/Admin');
    const adminCount = await Admin.countDocuments();
    console.log(`\n🔐 Admins in database: ${adminCount}`);
    
    if (adminCount > 0) {
      const admins = await Admin.find().select('email name role isActive');
      console.log('\n📋 Admin users:');
      admins.forEach(a => {
        console.log(`  - ${a.name} (${a.email}) - Role: ${a.role} - Active: ${a.isActive}`);
      });
    } else {
      console.log('\n⚠️  No admin users found! You need to create an initial admin account.');
    }
    
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
