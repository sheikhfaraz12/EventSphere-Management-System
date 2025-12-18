import mongoose from 'mongoose';

const boothSchema = new mongoose.Schema({
  number: String,
  size: {
    type: String,
    enum: ['Standard', 'Large', 'Premium', 'Custom'],
    default: 'Standard'
  },
  price: Number,
  status: {
    type: String,
    enum: ['available', 'reserved', 'occupied', 'maintenance'],
    default: 'available'
  },
  exhibitor: String
}, { _id: true });

const expoSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  location: String,
  theme: String,
  organizer: {
    name: String,
    email: String,
    phone: String
  },
  contactEmail: String,
  contactPhone: String,
  website: String,
  registrationDeadline: Date,
  boothCount: Number,
  booths: [boothSchema],
  status: {
    type: String,
    enum: ['draft', 'published', 'completed'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Expo = mongoose.model('Expo', expoSchema);
export default Expo;