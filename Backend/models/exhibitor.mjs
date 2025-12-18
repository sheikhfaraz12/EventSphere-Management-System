import mongoose from 'mongoose';

const exhibitorSchema = new mongoose.Schema({
  name: String,
  email: String,
  company: String,
  phone: String,
  category: String,
  status: { type: String, default: 'pending' },
  boothNumber: String,
  expoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expo' },
});

export default mongoose.model('Exhibitor', exhibitorSchema);