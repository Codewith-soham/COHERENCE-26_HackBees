import mongoose from 'mongoose';

const anomalySchema = new mongoose.Schema({
  budget_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget',
    required: [true, 'Budget ID is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required']
  },
  state: {
    type: String,
    required: [true, 'State is required']
  },
  district: {
    type: String,
    required: [true, 'District is required']
  },
  anomaly_detected: {
    type: Boolean,
    default: false
  },
  anomaly_score: {
    type: Number,
    default: 0
  },
  explanation: {
    type: String,
    default: ''
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW'
  }
}, {
  timestamps: true
});

const Anomaly = mongoose.model('Anomaly', anomalySchema);

export default Anomaly;