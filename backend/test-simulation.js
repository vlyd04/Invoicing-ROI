const { calculateROI } = require('./simulate');

// Test the ROI calculation logic
const testData = {
  monthly_invoice_volume: 2000,
  num_ap_staff: 3,
  avg_hours_per_invoice: 0.17,
  hourly_wage: 30,
  error_rate_manual: 0.5,
  error_cost: 100,
  time_horizon_months: 36,
  one_time_implementation_cost: 50000
};

console.log('Testing ROI Calculation...');
console.log('Input:', testData);

const results = calculateROI(testData);
console.log('\nResults:', results);

console.log('\n=== Expected vs Actual ===');
console.log(`Monthly Savings: ${results.monthly_savings} (Expected: ~$8,000+)`);
console.log(`Payback Months: ${results.payback_months} (Expected: ~6.3)`);
console.log(`ROI Percentage: ${results.roi_percentage}% (Expected: >400%)`);
console.log(`Net Savings: ${results.net_savings} (Expected: >$200,000)`);

console.log('\n✅ ROI Calculation Logic Test Complete!');