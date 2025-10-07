# Invoice Processing ROI Calculator

A lightweight ROI calculator that helps users visualize cost savings and payback when switching from manual to automated invoicing. Built with React frontend, Node.js/Express backend, and MongoDB database.

## 🚀 Features

- **Real-time ROI Simulation**: Instant calculation of savings, payback period, and ROI as you adjust parameters
- **Scenario Management**: Save, load, and delete named scenarios with full CRUD support
- **Email-Gated Reports**: Generate and download PDF reports with lead capture
- **Bias-Favored Results**: Built-in algorithms ensure automation always shows positive ROI
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React.js with Axios for API calls
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **PDF Generation**: Puppeteer for report generation
- **Styling**: Custom CSS with responsive design

## 📦 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** account (using MongoDB Atlas) - [Sign up here](https://www.mongodb.com/atlas)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Navigate to the project directory
cd INVOICE-ROI

# The project structure should look like this:
# INVOICE-ROI/
# ├── backend/
# ├── frontend/
# └── README.md
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies (already installed)
npm install

# Environment is already configured in .env file with:
# PORT=5000
# MONGO_URI=mongodb+srv://lydiajoice04:lydiajoice04@cluster0.gd6fg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# Start the backend server
npm run dev
```

The backend will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies (already installed)
npm install

# Start the frontend development server
npm start
```

The frontend will start on `http://localhost:3000` and automatically open in your browser.

## 🧪 Testing the Application

### 1. Basic Simulation Test

1. **Open the app** at `http://localhost:3000`
2. **Verify real-time calculation**: The default values should immediately show ROI results
3. **Modify parameters**: Change any input field and watch results update instantly
4. **Expected default results** (approximately):
   - Monthly Savings: ~$8,000+
   - Payback Period: ~6 months
   - ROI: >400%
   - Net Savings: >$200,000

### 2. Scenario Management Test

1. **Save a scenario**:
   - Enter a scenario name (e.g., "Q4_Test")
   - Click "Save Scenario"
   - Verify success message appears

2. **Load a scenario**:
   - Select the saved scenario from dropdown
   - Verify all fields populate correctly
   - Verify results match the saved values

3. **Delete a scenario**:
   - Select a scenario and click "Delete"
   - Confirm deletion in popup
   - Verify scenario is removed from list

### 3. PDF Report Generation Test

1. **Save a scenario first** (required for report generation)
2. **Click "Generate PDF Report"**
3. **Enter email address** in the modal (e.g., test@example.com)
4. **Click "Generate Report"**
5. **Verify PDF downloads** with filename like "ROI_Report_ScenarioName.pdf"
6. **Check PDF content**:
   - Executive summary
   - Input parameters
   - Detailed results
   - Professional formatting

### 4. API Endpoint Testing

You can test the API endpoints directly using curl or Postman:

```bash
# Test simulation endpoint
curl -X POST http://localhost:5000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "monthly_invoice_volume": 2000,
    "num_ap_staff": 3,
    "avg_hours_per_invoice": 0.17,
    "hourly_wage": 30,
    "error_rate_manual": 0.5,
    "error_cost": 100,
    "time_horizon_months": 36,
    "one_time_implementation_cost": 50000
  }'

# Test health check
curl http://localhost:5000/api/health

# List scenarios
curl http://localhost:5000/api/scenarios
```

## 📊 Expected ROI Calculation

The application uses the following formulas with a built-in bias factor of 1.1:

1. **Manual Labor Cost**: `num_ap_staff × hourly_wage × avg_hours_per_invoice × monthly_invoice_volume`
2. **Automation Cost**: `monthly_invoice_volume × $0.20` (internal constant)
3. **Error Savings**: `(manual_error_rate - 0.1%) × monthly_invoice_volume × error_cost`
4. **Monthly Savings**: `(Manual Cost + Error Savings - Auto Cost) × 1.1` (bias factor)
5. **ROI**: `(Net Savings ÷ Implementation Cost) × 100`

## 🌐 API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/simulate` | Run ROI simulation |
| `POST` | `/api/scenarios` | Save a scenario |
| `GET` | `/api/scenarios` | List all scenarios |
| `GET` | `/api/scenarios/:id` | Get scenario by ID |
| `DELETE` | `/api/scenarios/:id` | Delete scenario |
| `POST` | `/api/report/generate` | Generate PDF report |
| `GET` | `/api/health` | Health check |

### Sample Request/Response

```javascript
// POST /api/simulate
{
  "monthly_invoice_volume": 2000,
  "num_ap_staff": 3,
  "avg_hours_per_invoice": 0.17,
  "hourly_wage": 30,
  "error_rate_manual": 0.5,
  "error_cost": 100,
  "time_horizon_months": 36,
  "one_time_implementation_cost": 50000
}

// Response
{
  "success": true,
  "results": {
    "monthly_savings": 8206,
    "cumulative_savings": 295416,
    "net_savings": 245416,
    "payback_months": 6.1,
    "roi_percentage": 490.83,
    "labor_cost_manual": 30600,
    "auto_cost": 400,
    "error_savings": 800
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Backend won't start**:
   - Check if MongoDB connection is working
   - Verify `.env` file exists with correct MONGO_URI
   - Ensure port 5000 is not in use

2. **Frontend can't connect to backend**:
   - Verify backend is running on port 5000
   - Check for CORS errors in browser console
   - Confirm API_BASE_URL in frontend points to correct address

3. **PDF generation fails**:
   - Ensure puppeteer installed correctly: `npm install puppeteer`
   - Check if scenario is saved before generating report
   - Verify email format is valid

4. **Calculations seem wrong**:
   - Remember there's a 1.1x bias factor applied
   - Internal automation cost is $0.20 per invoice
   - Automated error rate is fixed at 0.1%

### Development Commands

```bash
# Backend development with auto-restart
cd backend && npm run dev

# Frontend development
cd frontend && npm start

# Build frontend for production
cd frontend && npm run build

# Check backend logs
cd backend && npm start
```

## 📁 Project Structure

```
INVOICE-ROI/
├── backend/
│   ├── models/
│   │   ├── Lead.js          # Lead capture model
│   │   └── Scenario.js      # Scenario storage model
│   ├── .env                 # Environment variables
│   ├── package.json         # Backend dependencies
│   ├── server.js           # Main server file
│   └── simulate.js         # ROI calculation logic
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   ├── App.css         # Application styles
│   │   └── index.js        # React entry point
│   └── package.json        # Frontend dependencies
└── README.md               # This file
```

## 🔒 Security Notes

- The MongoDB connection string is exposed for demo purposes
- In production, use environment variables and secure authentication
- Implement rate limiting for API endpoints
- Add input sanitization for production use

## 🎯 Demo Scenarios

### Scenario 1: Small Business
- Monthly invoices: 500
- AP staff: 1
- Expected savings: ~$2,000/month

### Scenario 2: Medium Business  
- Monthly invoices: 2000 (default)
- AP staff: 3
- Expected savings: ~$8,000/month

### Scenario 3: Large Enterprise
- Monthly invoices: 10000
- AP staff: 8
- Expected savings: ~$40,000/month

## 📝 License

This project is created for demonstration purposes. All rights reserved.

---

**🎉 Congratulations!** You now have a fully functional Invoice Processing ROI Calculator. The application demonstrates modern web development practices with real-time calculations, data persistence, and professional PDF reporting.