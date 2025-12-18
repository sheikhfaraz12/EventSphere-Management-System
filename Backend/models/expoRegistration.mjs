import mongoose from 'mongoose';

const expoRegistrationSchema = new mongoose.Schema(
  {
    expoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expo',
      required: true,
    },

    exhibitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exhibitor',
      required: true,
    },

    companyDetails: {
      companyName: { type: String, required: true },
      companyEmail: { type: String, required: true },
      phone: String,
      address: String,
      website: String,
    },

    productsServices: {
      type: String,
      required: true,
    },

    documents: [
      {
        name: String,     // e.g. "Company Profile"
        fileUrl: String,  // later: Cloudinary / S3
      },
    ],

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model('ExpoRegistration', expoRegistrationSchema);
