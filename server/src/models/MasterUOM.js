const mongoose = require('mongoose');

const uomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  symbol: { type: String, required: true, unique: true, trim: true },
  type: { type: String }, // e.g., Weight, Volume, Length
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const UOM = mongoose.model('UOM', uomSchema);

module.exports = { UOM };
