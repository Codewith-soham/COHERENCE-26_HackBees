import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema({
  department: {
    type: String,
    required: [true, 'Department is required']
  },
  state: {
    type: String,
    default: ""
  },
  district: {
    type: String,
    required: [true, 'District is required']
  },
  financial_year: {
    type: String,
    required: [true, 'Financial year is required']
  },
  allocated_amount: {
    type: Number,
    required: [true, 'Allocated amount is required']
  },
  projected_spending: {
    type: Number,
    required: [true, 'Projected spending is required']
  },
  predicted_unused: {
    type: Number,
    required: [true, 'Predicted unused funds is required']
  },
  risk_level: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    required: [true, 'Risk level is required']
  },
  reallocation_suggestion: {
    type: String
  }
}, { timestamps: true });

const Prediction = mongoose.model('Prediction', predictionSchema);

export default Prediction;