import ExpoRegistration from '../models/expoRegistration.mjs';

// REGISTER for an expo
export const registerForExpo = async (req, res) => {
  try {
    const {
      expoId,
      exhibitorId,
      companyDetails,
      productsServices,
      documents,
    } = req.body;

    if (!expoId || !exhibitorId || !companyDetails || !productsServices) {
      return res.status(400).json({
        error: 'Required fields are missing',
      });
    }

    const registration = new ExpoRegistration({
      expoId,
      exhibitorId,
      companyDetails,
      productsServices,
      documents,
    });

    await registration.save();

    res.status(201).json(registration);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register for expo' });
  }
};

// GET registrations by expo
export const getRegistrationsByExpo = async (req, res) => {
  try {
    const { expoId } = req.params;

    const registrations = await ExpoRegistration.find({ expoId })
      .populate('exhibitorId')
      .populate('expoId');

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
};

// UPDATE registration status (Admin)
export const updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await ExpoRegistration.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
};
