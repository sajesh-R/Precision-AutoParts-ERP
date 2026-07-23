const mongoose = require('mongoose');
const auditPlugin = require('./plugins/auditPlugin');

const currencySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true }, // e.g., USD, INR
  symbol: { type: String, required: true }, // e.g., $, ₹
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });
currencySchema.plugin(auditPlugin);

const Currency = mongoose.model('Currency', currencySchema);

module.exports = { Currency };
