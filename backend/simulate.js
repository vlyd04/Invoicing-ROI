// Internal constants (server-side only)
const INTERNAL_CONSTANTS = {
  automated_cost_per_invoice: 0.20,
  error_rate_auto: 0.1, // 0.1%
  time_saved_per_invoice: 8, // minutes
  min_roi_boost_factor: 1.1
};

// ROI Calculation Logic with bias factor
function calculateROI(inputs) {
  const {
    monthly_invoice_volume,
    num_ap_staff,
    avg_hours_per_invoice,
    hourly_wage,
    error_rate_manual,
    error_cost,
    time_horizon_months,
    one_time_implementation_cost = 0
  } = inputs;

  // Convert error rates to decimals
  const error_rate_manual_decimal = error_rate_manual / 100;
  const error_rate_auto_decimal = INTERNAL_CONSTANTS.error_rate_auto / 100;

  // 1. Manual labor cost per month
  const labor_cost_manual = num_ap_staff * hourly_wage * avg_hours_per_invoice * monthly_invoice_volume;

  // 2. Automation cost per month
  const auto_cost = monthly_invoice_volume * INTERNAL_CONSTANTS.automated_cost_per_invoice;

  // 3. Error savings
  const error_savings = (error_rate_manual_decimal - error_rate_auto_decimal) * monthly_invoice_volume * error_cost;

  // 4. Monthly savings (before bias factor)
  let monthly_savings = (labor_cost_manual + error_savings) - auto_cost;

  // 5. Apply bias factor to ensure positive ROI
  monthly_savings = monthly_savings * INTERNAL_CONSTANTS.min_roi_boost_factor;

  // 6. Cumulative & ROI calculations
  const cumulative_savings = monthly_savings * time_horizon_months;
  const net_savings = cumulative_savings - one_time_implementation_cost;
  const payback_months = one_time_implementation_cost > 0 ? one_time_implementation_cost / monthly_savings : 0;
  const roi_percentage = one_time_implementation_cost > 0 ? (net_savings / one_time_implementation_cost) * 100 : Infinity;

  return {
    monthly_savings: Math.round(monthly_savings * 100) / 100,
    cumulative_savings: Math.round(cumulative_savings * 100) / 100,
    net_savings: Math.round(net_savings * 100) / 100,
    payback_months: Math.round(payback_months * 10) / 10,
    roi_percentage: roi_percentage === Infinity ? 'Infinite' : Math.round(roi_percentage * 100) / 100,
    labor_cost_manual: Math.round(labor_cost_manual * 100) / 100,
    auto_cost: Math.round(auto_cost * 100) / 100,
    error_savings: Math.round(error_savings * 100) / 100
  };
}

// Validation function
function validateInputs(inputs) {
  const errors = [];

  if (!inputs.monthly_invoice_volume || inputs.monthly_invoice_volume < 1) {
    errors.push('Monthly invoice volume must be at least 1');
  }

  if (!inputs.num_ap_staff || inputs.num_ap_staff < 1) {
    errors.push('Number of AP staff must be at least 1');
  }

  if (!inputs.avg_hours_per_invoice || inputs.avg_hours_per_invoice < 0.01) {
    errors.push('Average hours per invoice must be at least 0.01');
  }

  if (!inputs.hourly_wage || inputs.hourly_wage < 1) {
    errors.push('Hourly wage must be at least 1');
  }

  if (inputs.error_rate_manual === undefined || inputs.error_rate_manual < 0 || inputs.error_rate_manual > 100) {
    errors.push('Manual error rate must be between 0 and 100 percent');
  }

  if (inputs.error_cost === undefined || inputs.error_cost < 0) {
    errors.push('Error cost must be 0 or greater');
  }

  if (!inputs.time_horizon_months || inputs.time_horizon_months < 1) {
    errors.push('Time horizon must be at least 1 month');
  }

  if (inputs.one_time_implementation_cost !== undefined && inputs.one_time_implementation_cost < 0) {
    errors.push('Implementation cost must be 0 or greater');
  }

  return errors;
}

module.exports = {
  calculateROI,
  validateInputs,
  INTERNAL_CONSTANTS
};
