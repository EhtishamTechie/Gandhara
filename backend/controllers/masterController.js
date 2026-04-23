const Master = require('../models/Master');
const fs = require('fs');

// Add new master
const addMaster = async (req, res) => {
  try {
    const { name, specialty, experience, description } = req.body;
    
    // Validation
    if (!name || !specialty || !experience || !description || !req.file) {
      return res.status(400).json({ 
        message: 'All fields (name, specialty, experience, description, image) are required' 
      });
    }

    // Validate experience is a number
    const experienceNum = parseInt(experience);
    if (isNaN(experienceNum) || experienceNum < 1 || experienceNum > 80) {
      return res.status(400).json({ 
        message: 'Experience must be a number between 1 and 80' 
      });
    }

    // Check if specialty is valid
    const validSpecialties = [
      'Gandhara Art', 'Stone Carving', 'Calligraphy', 'Jewellery Making', 
      'Antique Restoration', 'Moulded Art', 'Garden Decor', 'Building Embellishing'
    ];
    
    if (!validSpecialties.includes(specialty)) {
      return res.status(400).json({ 
        message: 'Invalid specialty. Please choose from the available options.' 
      });
    }

    const newMaster = new Master({
      name: name.trim(),
      specialty,
      experience: experienceNum,
      description: description.trim(),
      image: req.file.path,
    });

    const savedMaster = await newMaster.save();
    res.status(201).json(savedMaster);
  } catch (error) {
    console.error('Error adding master:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all masters
const getMasters = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Master.countDocuments();
    const masters = await Master.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      masters,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching masters:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get single master by ID
const getMasterById = async (req, res) => {
  try {
    const master = await Master.findById(req.params.id);
    
    if (!master) {
      return res.status(404).json({ message: 'Master not found' });
    }
    
    res.json(master);
  } catch (error) {
    console.error('Error fetching master:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update master
const updateMaster = async (req, res) => {
  try {
    const { name, specialty, experience, description } = req.body;
    const master = await Master.findById(req.params.id);
    
    if (!master) {
      return res.status(404).json({ message: 'Master not found' });
    }

    // Validate experience if provided
    if (experience) {
      const experienceNum = parseInt(experience);
      if (isNaN(experienceNum) || experienceNum < 1 || experienceNum > 80) {
        return res.status(400).json({ 
          message: 'Experience must be a number between 1 and 80' 
        });
      }
      master.experience = experienceNum;
    }

    // Validate specialty if provided
    if (specialty) {
      const validSpecialties = [
        'Gandhara Art', 'Stone Carving', 'Calligraphy', 'Jewellery Making', 
        'Antique Restoration', 'Moulded Art', 'Garden Decor', 'Building Embellishing'
      ];
      
      if (!validSpecialties.includes(specialty)) {
        return res.status(400).json({ 
          message: 'Invalid specialty. Please choose from the available options.' 
        });
      }
      master.specialty = specialty;
    }

    // Update fields
    master.name = name ? name.trim() : master.name;
    master.description = description ? description.trim() : master.description;

    // If a new image is uploaded, delete old one and replace it
    if (req.file) {
      if (master.image && fs.existsSync(master.image)) {
        fs.unlink(master.image, (err) => {
          if (err) console.error('Failed to delete old image:', err);
        });
      }
      master.image = req.file.path;
    }

    const updatedMaster = await master.save();
    res.json(updatedMaster);
  } catch (error) {
    console.error('Error updating master:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete master
const deleteMaster = async (req, res) => {
  try {
    const master = await Master.findByIdAndDelete(req.params.id);
    
    if (!master) {
      return res.status(404).json({ message: 'Master not found' });
    }

    // Delete associated image file
    if (master.image && fs.existsSync(master.image)) {
      fs.unlink(master.image, (err) => {
        if (err) console.error('Failed to delete image:', err);
      });
    }

    res.json({ message: 'Master deleted successfully' });
  } catch (error) {
    console.error('Error deleting master:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get masters by specialty
const getMastersBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.params;
    
    const validSpecialties = [
      'Gandhara Art', 'Stone Carving', 'Calligraphy', 'Jewellery Making', 
      'Antique Restoration', 'Moulded Art', 'Garden Decor', 'Building Embellishing'
    ];
    
    if (!validSpecialties.includes(specialty)) {
      return res.status(400).json({ 
        message: 'Invalid specialty. Please choose from the available options.' 
      });
    }

    const masters = await Master.find({ specialty }).sort({ createdAt: -1 });
    res.json(masters);
  } catch (error) {
    console.error('Error fetching masters by specialty:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addMaster,
  getMasters,
  getMasterById,
  updateMaster,
  deleteMaster,
  getMastersBySpecialty
};