const Message = require('../models/Message');
const User = require('../models/User');

const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({ userId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ lastMessageAt: -1, createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

const getCameraRoll = async (req, res) => {
  try {
    const { userId } = req.params;
    const cameraRoll = await Message.find({ 
      userId, 
      type: 'image',
      isAutoCapture: true 
    }).sort({ timestamp: -1 });
    res.json(cameraRoll);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching camera roll', error: error.message });
  }
};

const uploadImage = async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('Files:', req.files ? Object.keys(req.files) : 'NO FILES');
    
    if (!req.files || !req.files.image) {
      console.log('❌ No image in request');
      return res.status(400).json({ message: 'No image provided' });
    }

    const cloudinary = require('cloudinary').v2;
    const image = req.files.image;
    
    console.log('📸 Image details:', {
      name: image.name,
      size: image.size,
      mimetype: image.mimetype
    });

    // Convert buffer to base64
    const base64Data = image.data.toString('base64');
    const dataURI = `data:${image.mimetype};base64,${base64Data}`;

    console.log('Uploading to Cloudinary...');
    
    // Upload to Cloudinary using simple method
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'msger/chat',
      resource_type: 'auto'
    });

    console.log('✅ Upload successful:', result.secure_url);
    
    res.json({
      message: 'Image uploaded successfully',
      url: result.secure_url
    });
  } catch (error) {
    console.error('❌ Upload error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ 
      message: 'Error uploading image', 
      error: error.message
    });
  }
};

module.exports = { getMessages, getAllUsers, getCameraRoll, uploadImage };
