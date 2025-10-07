const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  scenario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scenario',
    required: true
  },
  report_downloaded: {
    type: Boolean,
    default: false
  },
  report_downloaded_at: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lead', leadSchema);
