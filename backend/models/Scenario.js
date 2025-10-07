const mongoose = require('mongoose');

const scenarioSchema = new mongoose.Schema({
  scenario_name: {
    type: String,
    required: true,
    unique: true
  },
  monthly_invoice_volume: {
    type: Number,
    required: true,
    min: 1
  },
  num_ap_staff: {
    type: Number,
    required: true,
    min: 1
  },
  avg_hours_per_invoice: {
    type: Number,
    required: true,
    min: 0.01
  },
  hourly_wage: {
    type: Number,
    required: true,
    min: 1
  },
  error_rate_manual: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  error_cost: {
    type: Number,
    required: true,
    min: 0
  },
  time_horizon_months: {
    type: Number,
    required: true,
    min: 1
  },
  one_time_implementation_cost: {
    type: Number,
    default: 0,
    min: 0
  },
  // Store calculated results
  results: {
    monthly_savings: Number,
    cumulative_savings: Number,
    net_savings: Number,
    payback_months: Number,
    roi_percentage: Number,
    labor_cost_manual: Number,
    auto_cost: Number,
    error_savings: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Scenario', scenarioSchema);
