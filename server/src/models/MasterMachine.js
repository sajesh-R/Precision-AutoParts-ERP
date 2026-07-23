const mongoose = require('mongoose');
const auditPlugin = require('./plugins/auditPlugin');

const machineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true },
  plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  workCenterId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkCenter' },
  hourlyCost: { type: Number, default: 0, min: 0 },
  capacity: { type: Number, default: 0 },
  uomId: { type: mongoose.Schema.Types.ObjectId, ref: 'UOM' }, // For capacity
  manufacturer: { type: String },
  serialNumber: { type: String },
  purchaseDate: { type: Date },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });
machineSchema.plugin(auditPlugin);

const Machine = mongoose.model('Machine', machineSchema);

module.exports = { Machine };
