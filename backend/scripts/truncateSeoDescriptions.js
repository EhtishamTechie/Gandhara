/**
 * Truncate seoDescription fields longer than 160 chars to 157 + '...'
 */

const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

function truncate(text, max) {
  if (!text) return text;
  text = typeof text === 'string' ? text : String(text);
  return text.length > max ? text.substring(0, max - 3) + '...' : text;
}

async function main() {
  try {
    console.log('✂️  Truncate seoDescription script starting...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // find products where seoDescription exists and length > 160
    const cursor = Product.find({ seoDescription: { $exists: true, $ne: null } }).cursor();
    let total = 0, updated = 0, skipped = 0, errors = 0;

    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      total++;
      const desc = doc.seoDescription;
      if (!desc) { skipped++; continue; }
      const str = typeof desc === 'string' ? desc : String(desc);
      if (str.length > 160) {
        doc.seoDescription = truncate(str, 160);
        try {
          await doc.save();
          updated++;
        } catch (err) {
          errors++;
          if (errors < 10) console.log('  Error saving', doc._id, err.message);
        }
      } else {
        skipped++;
      }
      if (total % 200 === 0) console.log(`Processed ${total} docs — updated ${updated}, errors ${errors}`);
    }

    console.log('\n📊 Summary');
    console.log(`  Scanned: ${total}`);
    console.log(`  Updated: ${updated}`);
    console.log(`  Skipped (ok length): ${skipped}`);
    console.log(`  Errors: ${errors}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Fatal:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

main();
