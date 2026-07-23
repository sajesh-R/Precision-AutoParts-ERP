const mongoose = require('mongoose');
const auditPlugin = require('./plugins/auditPlugin');

const paymentTermsSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true }, // e.g., NET30, Advance
  days: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });
paymentTermsSchema.plugin(auditPlugin);

const PaymentTerms = mongoose.model('PaymentTerms', paymentTermsSchema);

module.exports = { PaymentTerms };
