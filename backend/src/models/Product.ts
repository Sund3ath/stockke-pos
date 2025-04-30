import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  // ... other fields ...
  adminUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // ... other fields ...
});

export const Product = mongoose.model('Product', productSchema); 