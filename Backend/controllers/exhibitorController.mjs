import Exhibitor from '../models/exhibitor.mjs';

// GET all exhibitors
export const getAllExhibitors = async (req, res) => {
  try {
    const exhibitors = await Exhibitor.find();
    res.json(exhibitors);
  } catch (error) {
    console.error('Exhibitors error:', error);
    res.status(500).json({ error: 'Failed to fetch exhibitors' });
  }
};

// GET single exhibitor
export const getExhibitorById = async (req, res) => {
  try {
    const { id } = req.params;

    const exhibitor = await Exhibitor.findById(id);
    if (!exhibitor) {
      return res.status(404).json({ error: 'Exhibitor not found' });
    }

    res.json(exhibitor);
  } catch (error) {
    console.error('Exhibitor error:', error);
    res.status(500).json({ error: 'Failed to fetch exhibitor' });
  }
};

// CREATE new exhibitor
export const createExhibitor = async (req, res) => {
  try {
    const {
      name,
      email,
      company,
      phone,
      category,
      status,
      boothNumber,
      expoId
    } = req.body;

    if (!name || !email || !company || !expoId) {
      return res
        .status(400)
        .json({ error: 'Name, email, company, and expoId are required' });
    }

    const newExhibitor = new Exhibitor({
      name,
      email,
      company,
      phone,
      category,
      status: status || 'pending',
      boothNumber,
      expoId
    });

    await newExhibitor.save();

    res.status(201).json(newExhibitor);
  } catch (error) {
    console.error('Create exhibitor error:', error);
    res.status(500).json({ error: 'Failed to create exhibitor' });
  }
};

// UPDATE exhibitor
export const updateExhibitor = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedExhibitor = await Exhibitor.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updatedExhibitor) {
      return res.status(404).json({ error: 'Exhibitor not found' });
    }

    res.json(updatedExhibitor);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update exhibitor' });
  }
};
