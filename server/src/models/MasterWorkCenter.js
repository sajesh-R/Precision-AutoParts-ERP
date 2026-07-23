const mongoose = require('mongoose');
const auditPlugin = require('./plugins/auditPlugin');

const workCenterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true },
  description: { type: String },
  plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  machines: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Machine' }],
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });
workCenterSchema.plugin(auditPlugin);

const WorkCenter = mongoose.model('WorkCenter', workCenterSchema);

module.exports = { WorkCenter };
