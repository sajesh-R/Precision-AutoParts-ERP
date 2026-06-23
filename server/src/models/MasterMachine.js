const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true },
  
  specifications: [{
    key: String,
    value: String
  }],
  
  capacity: {
    value: Number,
    uom: { type: mongoose.Schema.Types.ObjectId, ref: 'UOM' }
  },
  
  hourlyCost: { type: Number, default: 0 },
  
  maintenanceSchedule: [{
    taskName: String,
    frequencyDays: Number,
    lastPerformed: Date,
    nextDue: Date
  }],
  
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Machine = mongoose.model('Machine', machineSchema);

module.exports = { Machine };
