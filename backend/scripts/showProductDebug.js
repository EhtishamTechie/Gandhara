const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const id = process.argv[2];
if (!id) {
  console.error('Usage: node showProductDebug.js <productId>');
  process.exit(1);
}

(async function(){
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const doc = await Product.findById(id).lean();
    if (!doc) {
      console.log('Product not found:', id);
      await mongoose.disconnect();
      process.exit(0);
    }
    console.log('=== Product Raw JSON ===');
    console.log(JSON.stringify(doc, null, 2));

    console.log('\n=== Field Types ===');
    const fields = ['title','description','seoDescription','keywords','categories','image','price','focusKeyword','imageAlt','shortDescription'];
    fields.forEach(f => {
      const v = doc[f];
      console.log(f + ':', typeof v, Array.isArray(v) ? '(array)' : '', (v && v.length) ? `length=${v.length}` : '');
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    await mongoose.disconnect();
    process.exit(1);
  }
})();
