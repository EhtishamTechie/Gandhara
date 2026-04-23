const mongoose = require('mongoose');

const categoryOrderSchema = new mongoose.Schema({
  // Array of category names in display order (index 0 = shown first)
  categories: [{
    name: { type: String, required: true, trim: true },
    isVisible: { type: Boolean, default: true }
  }],
  // Single document pattern — only one config doc exists
  configKey: { type: String, default: 'main', unique: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('CategoryOrder', categoryOrderSchema);
