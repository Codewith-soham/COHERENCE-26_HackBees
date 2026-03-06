import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
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
  month: {
    type: String,
    required: [true, 'Month is required']
  },
  financial_year: {
    type: String,
    required: [true, 'Financial year is required']
  },
  allocated_amount: {
    type: Number,
    required: [true, 'Allocated amount is required']
  },
  spent_amount: {
    type: Number,
    required: [true, 'Spent amount is required']
  },
  utilization_percentage: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

budgetSchema.pre('save', function() {
  if (this.allocated_amount > 0) {
    this.utilization_percentage = (this.spent_amount / this.allocated_amount) * 100;
  }
});

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;