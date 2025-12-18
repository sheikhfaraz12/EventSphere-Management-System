import Expo from '../models/expo.mjs';

// Create Expo
export const createExpo = async (req, res) => {
  try {
    const expo = await Expo.create({
      ...req.body,
      createdBy: req.user.id
    });
    res.status(201).json({ success: true, data: expo });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get All Expos
export const getExpos = async (req, res) => {
  try {
    const expos = await Expo.find().populate('createdBy', 'name email');
    res.json({ success: true, data: expos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Single Expo
export const getExpoById = async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.id);
    if (!expo) return res.status(404).json({ success: false, error: 'Expo not found' });
    res.json({ success: true, data: expo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update Expo
export const updateExpo = async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.id);
    if (!expo) return res.status(404).json({ success: false, error: 'Expo not found' });
    
    // Check ownership
    if (expo.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    
    const updatedExpo = await Expo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ success: true, data: updatedExpo });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete Expo
export const deleteExpo = async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.id);
    if (!expo) return res.status(404).json({ success: false, error: 'Expo not found' });
    
    if (expo.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    
    await expo.deleteOne();
    res.json({ success: true, message: 'Expo deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add Booth to Expo
export const addBooth = async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.id);
    if (!expo) return res.status(404).json({ success: false, error: 'Expo not found' });
    
    if (expo.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    
    expo.booths.push(req.body);
    await expo.save();
    res.json({ success: true, data: expo });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update Booth
export const updateBooth = async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.id);
    if (!expo) return res.status(404).json({ success: false, error: 'Expo not found' });
    
    if (expo.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    
    const booth = expo.booths.id(req.params.boothId);
    if (!booth) return res.status(404).json({ success: false, error: 'Booth not found' });
    
    booth.set(req.body);
    await expo.save();
    res.json({ success: true, data: expo });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete Booth
export const deleteBooth = async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.id);
    if (!expo) return res.status(404).json({ success: false, error: 'Expo not found' });
    
    if (expo.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    
    expo.booths.id(req.params.boothId).deleteOne();
    await expo.save();
    res.json({ success: true, data: expo });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get User's Expos
export const getMyExpos = async (req, res) => {
  try {
    const expos = await Expo.find({ createdBy: req.user.id });
    res.json({ success: true, data: expos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};