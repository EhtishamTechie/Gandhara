/*
 * Validate all products and report validation errors with field-level messages.
 */

const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const cursor = Product.find({}).cursor();
    let total = 0, errors = 0;
    const errorList = [];

    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      total++;
      try {
        await doc.validate();
      } catch (e) {
        errors++;
        const messages = [];
        if (e.errors) {
          for (const [path, errObj] of Object.entries(e.errors)) {
            messages.push(`${path}: ${errObj.message}`);
          }
        } else {
          messages.push(e.message);
        }
        if (errorList.length < 200) errorList.push({ id: doc._id, messages });
      }
      if (total % 200 === 0) console.log(`Scanned ${total} docs, found ${errors} errors so far`);
    }

    console.log('\nValidation summary');
    console.log(`Total scanned: ${total}`);
    console.log(`Total errors: ${errors}`);
    if (errorList.length) {
      console.log('\nSample errors:');
      errorList.forEach(e => {
        console.log(`- ${e.id}`);
        e.messages.forEach(m => console.log(`    ${m}`));
      });
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Fatal:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

main();
