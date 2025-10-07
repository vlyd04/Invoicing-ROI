require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const path = require('path');

const Scenario = require('./models/Scenario');
const Lead = require('./models/Lead');
const { calculateROI, validateInputs } = require('./simulate');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.log('MongoDB connection error:', err.message);
  console.log('Starting server without database connection for demonstration...');
});

// API Endpoints

// POST /simulate - Run simulation and return JSON results
app.post('/api/simulate', async (req, res) => {
  try {
    const inputs = req.body;
    
    // Validate inputs
    const validationErrors = validateInputs(inputs);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: validationErrors
      });
    }

    // Calculate ROI
    const results = calculateROI(inputs);

    res.json({
      success: true,
      inputs,
      results
    });
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during simulation'
    });
  }
});

// POST /scenarios - Save a scenario
app.post('/api/scenarios', async (req, res) => {
  try {
    const inputs = req.body;
    
    // Validate inputs
    const validationErrors = validateInputs(inputs);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: validationErrors
      });
    }

    // Calculate results
    const results = calculateROI(inputs);

    // Check if scenario name already exists
    const existingScenario = await Scenario.findOne({ scenario_name: inputs.scenario_name });
    if (existingScenario) {
      return res.status(400).json({
        success: false,
        error: 'Scenario name already exists'
      });
    }

    // Create new scenario
    const scenario = new Scenario({
      ...inputs,
      results
    });

    await scenario.save();

    res.status(201).json({
      success: true,
      scenario: {
        id: scenario._id,
        ...inputs,
        results
      }
    });
  } catch (error) {
    console.error('Save scenario error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save scenario'
    });
  }
});

// GET /scenarios - List all scenarios
app.get('/api/scenarios', async (req, res) => {
  try {
    const scenarios = await Scenario.find().select('-__v').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      scenarios
    });
  } catch (error) {
    console.error('List scenarios error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scenarios'
    });
  }
});

// GET /scenarios/:id - Retrieve scenario details
app.get('/api/scenarios/:id', async (req, res) => {
  try {
    const scenario = await Scenario.findById(req.params.id).select('-__v');
    
    if (!scenario) {
      return res.status(404).json({
        success: false,
        error: 'Scenario not found'
      });
    }

    res.json({
      success: true,
      scenario
    });
  } catch (error) {
    console.error('Get scenario error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scenario'
    });
  }
});

// DELETE /scenarios/:id - Delete a scenario
app.delete('/api/scenarios/:id', async (req, res) => {
  try {
    const scenario = await Scenario.findByIdAndDelete(req.params.id);
    
    if (!scenario) {
      return res.status(404).json({
        success: false,
        error: 'Scenario not found'
      });
    }

    res.json({
      success: true,
      message: 'Scenario deleted successfully'
    });
  } catch (error) {
    console.error('Delete scenario error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete scenario'
    });
  }
});

// POST /report/generate - Generate a PDF report (email required)
app.post('/api/report/generate', async (req, res) => {
  try {
    const { email, scenario_id } = req.body;

    if (!email || !scenario_id) {
      return res.status(400).json({
        success: false,
        error: 'Email and scenario_id are required'
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Find scenario
    const scenario = await Scenario.findById(scenario_id);
    if (!scenario) {
      return res.status(404).json({
        success: false,
        error: 'Scenario not found'
      });
    }

    // Save lead
    const lead = new Lead({
      email,
      scenario_id,
      report_downloaded: true,
      report_downloaded_at: new Date()
    });
    await lead.save();

    // Generate PDF report
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Create HTML content for the report
    const htmlContent = generateReportHTML(scenario);
    await page.setContent(htmlContent);
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    await browser.close();

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ROI_Report_${scenario.scenario_name}.pdf"`);
    
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate report'
    });
  }
});

// Function to generate HTML content for PDF report
function generateReportHTML(scenario) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value) => {
    return typeof value === 'number' ? `${value.toFixed(2)}%` : value;
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>ROI Analysis Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #007bff;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #007bff;
          margin: 0;
        }
        .section {
          margin-bottom: 30px;
        }
        .section h2 {
          color: #007bff;
          border-bottom: 1px solid #ddd;
          padding-bottom: 10px;
        }
        .input-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .input-item {
          padding: 10px;
          background: #f8f9fa;
          border-radius: 5px;
        }
        .input-item strong {
          color: #007bff;
        }
        .results-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .result-card {
          background: #e3f2fd;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          border-left: 4px solid #007bff;
        }
        .result-card h3 {
          margin: 0 0 10px 0;
          color: #007bff;
        }
        .result-card .value {
          font-size: 24px;
          font-weight: bold;
          color: #2e7d32;
        }
        .summary {
          background: #f0f8ff;
          padding: 20px;
          border-radius: 8px;
          border: 2px solid #007bff;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Invoice Processing ROI Analysis</h1>
        <h2>Scenario: ${scenario.scenario_name}</h2>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
      </div>

      <div class="section">
        <h2>Input Parameters</h2>
        <div class="input-grid">
          <div class="input-item">
            <strong>Monthly Invoice Volume:</strong><br>
            ${scenario.monthly_invoice_volume.toLocaleString()} invoices
          </div>
          <div class="input-item">
            <strong>AP Staff Count:</strong><br>
            ${scenario.num_ap_staff} employees
          </div>
          <div class="input-item">
            <strong>Hours per Invoice:</strong><br>
            ${scenario.avg_hours_per_invoice} hours
          </div>
          <div class="input-item">
            <strong>Hourly Wage:</strong><br>
            ${formatCurrency(scenario.hourly_wage)}
          </div>
          <div class="input-item">
            <strong>Manual Error Rate:</strong><br>
            ${scenario.error_rate_manual}%
          </div>
          <div class="input-item">
            <strong>Error Correction Cost:</strong><br>
            ${formatCurrency(scenario.error_cost)}
          </div>
          <div class="input-item">
            <strong>Time Horizon:</strong><br>
            ${scenario.time_horizon_months} months
          </div>
          <div class="input-item">
            <strong>Implementation Cost:</strong><br>
            ${formatCurrency(scenario.one_time_implementation_cost)}
          </div>
        </div>
      </div>

      <div class="section">
        <h2>ROI Analysis Results</h2>
        <div class="results-grid">
          <div class="result-card">
            <h3>Monthly Savings</h3>
            <div class="value">${formatCurrency(scenario.results.monthly_savings)}</div>
          </div>
          <div class="result-card">
            <h3>Payback Period</h3>
            <div class="value">${scenario.results.payback_months} months</div>
          </div>
          <div class="result-card">
            <h3>Total ROI</h3>
            <div class="value">${formatPercentage(scenario.results.roi_percentage)}</div>
          </div>
          <div class="result-card">
            <h3>Net Savings</h3>
            <div class="value">${formatCurrency(scenario.results.net_savings)}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Cost Breakdown</h2>
        <div class="input-grid">
          <div class="input-item">
            <strong>Current Manual Labor Cost:</strong><br>
            ${formatCurrency(scenario.results.labor_cost_manual)} per month
          </div>
          <div class="input-item">
            <strong>Automation Cost:</strong><br>
            ${formatCurrency(scenario.results.auto_cost)} per month
          </div>
          <div class="input-item">
            <strong>Error Reduction Savings:</strong><br>
            ${formatCurrency(scenario.results.error_savings)} per month
          </div>
          <div class="input-item">
            <strong>Cumulative Savings:</strong><br>
            ${formatCurrency(scenario.results.cumulative_savings)} over ${scenario.time_horizon_months} months
          </div>
        </div>
      </div>

      <div class="section">
        <div class="summary">
          <h2>Executive Summary</h2>
          <p>
            Based on your business parameters, switching to automated invoice processing will generate 
            <strong>${formatCurrency(scenario.results.monthly_savings)}</strong> in monthly savings. 
            With an implementation cost of <strong>${formatCurrency(scenario.one_time_implementation_cost)}</strong>, 
            you'll achieve payback in <strong>${scenario.results.payback_months} months</strong> and realize a 
            <strong>${formatPercentage(scenario.results.roi_percentage)}</strong> return on investment over 
            ${scenario.time_horizon_months} months.
          </p>
          <p>
            Total net savings over the analysis period: <strong>${formatCurrency(scenario.results.net_savings)}</strong>
          </p>
        </div>
      </div>

      <div class="footer">
        <p>This report was generated automatically by the Invoice Processing ROI Calculator</p>
      </div>
    </body>
    </html>
  `;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
