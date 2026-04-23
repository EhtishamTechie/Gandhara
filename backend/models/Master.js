// Save this as: backend/models/Master.js

const mongoose = require('mongoose');

const masterSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  specialty: { 
    type: String, 
    required: true,
    enum: [
      'Gandhara Art', 
      'Stone Carving', 
      'Calligraphy', 
      'Jewellery Making', 
      'Antique Restoration', 
      'Moulded Art', 
      'Garden Decor', 
      'Building Embellishing'
    ]
  },
  experience: { 
    type: Number, 
    required: true,
    min: 1,
    max: 80
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  image: { 
    type: String, 
    required: true 
  },
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Master', masterSchema);