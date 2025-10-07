import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [formData, setFormData] = useState({
    scenario_name: '',
    monthly_invoice_volume: 2000,
    num_ap_staff: 3,
    avg_hours_per_invoice: 0.17,
    hourly_wage: 30,
    error_rate_manual: 0.5,
    error_cost: 100,
    time_horizon_months: 36,
    one_time_implementation_cost: 50000
  });

  const [results, setResults] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('');
  const [reportEmail, setReportEmail] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentScenarioId, setCurrentScenarioId] = useState(null);

  const showMessage = (msg, type = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || value
    }));
  };

  const runSimulation = useCallback(async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/simulate`, formData);
      if (response.data.success) {
        setResults(response.data.results);
      }
    } catch (error) {
      console.error('Simulation error:', error);
    }
  }, [formData]);

  useEffect(() => {
    loadScenarios();
  }, []);

  useEffect(() => {
    const allFieldsValid = Object.entries(formData).every(([key, value]) => {
      if (key === 'scenario_name') return true;
      return value !== '' && value >= 0;
    });
    
    if (allFieldsValid) {
      runSimulation();
    }
  }, [formData, runSimulation]);

  const saveScenario = async () => {
    if (!formData.scenario_name.trim()) {
      showMessage('Please enter a scenario name', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/scenarios`, formData);
      if (response.data.success) {
        setCurrentScenarioId(response.data.scenario.id);
        showMessage('Scenario saved successfully!', 'success');
        loadScenarios();
      }
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to save scenario', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadScenarios = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/scenarios`);
      if (response.data.success) {
        setScenarios(response.data.scenarios);
      }
    } catch (error) {
      console.error('Failed to load scenarios:', error);
    }
  };

  const loadScenario = async (scenarioId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/scenarios/${scenarioId}`);
      if (response.data.success) {
        const scenario = response.data.scenario;
        setFormData({
          scenario_name: scenario.scenario_name,
          monthly_invoice_volume: scenario.monthly_invoice_volume,
          num_ap_staff: scenario.num_ap_staff,
          avg_hours_per_invoice: scenario.avg_hours_per_invoice,
          hourly_wage: scenario.hourly_wage,
          error_rate_manual: scenario.error_rate_manual,
          error_cost: scenario.error_cost,
          time_horizon_months: scenario.time_horizon_months,
          one_time_implementation_cost: scenario.one_time_implementation_cost
        });
        setResults(scenario.results);
        setCurrentScenarioId(scenarioId);
        showMessage('Scenario loaded successfully!', 'success');
      }
    } catch (error) {
      showMessage('Failed to load scenario', 'error');
    }
  };

  const deleteScenario = async (scenarioId) => {
    if (!window.confirm('Are you sure you want to delete this scenario?')) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/scenarios/${scenarioId}`);
      if (response.data.success) {
        showMessage('Scenario deleted successfully!', 'success');
        loadScenarios();
        if (currentScenarioId === scenarioId) {
          setCurrentScenarioId(null);
        }
      }
    } catch (error) {
      showMessage('Failed to delete scenario', 'error');
    }
  };

  const generateReport = async () => {
    if (!reportEmail.trim()) {
      showMessage('Please enter your email address', 'error');
      return;
    }

    if (!currentScenarioId) {
      showMessage('Please save the scenario first', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/report/generate`, {
        email: reportEmail,
        scenario_id: currentScenarioId
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ROI_Report_${formData.scenario_name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setShowReportModal(false);
      setReportEmail('');
      showMessage('Report downloaded successfully!', 'success');
    } catch (error) {
      showMessage('Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  };

  const formatPercentage = (value) => {
    return typeof value === 'number' ? `${value.toFixed(2)}%` : value;
  };

  return (
    <div className="App">
      <header className="header">
        <h1>Invoice Processing ROI Calculator</h1>
        <p>Calculate your potential savings from automated invoice processing</p>
      </header>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <div className="container">
        <div className="input-section">
          <h2>Business Parameters</h2>
          
          <div className="scenario-management">
            <div className="scenario-controls">
              <input
                type="text"
                name="scenario_name"
                placeholder="Scenario Name (e.g., Q4_Pilot)"
                value={formData.scenario_name}
                onChange={handleInputChange}
                className="scenario-input"
              />
              <button onClick={saveScenario} disabled={loading} className="save-btn">
                {loading ? 'Saving...' : 'Save Scenario'}
              </button>
            </div>

            {scenarios.length > 0 && (
              <div className="scenario-list">
                <h3>Saved Scenarios</h3>
                <select 
                  value={selectedScenario} 
                  onChange={(e) => {
                    setSelectedScenario(e.target.value);
                    if (e.target.value) loadScenario(e.target.value);
                  }}
                  className="scenario-select"
                >
                  <option value="">Select a scenario...</option>
                  {scenarios.map(scenario => (
                    <option key={scenario._id} value={scenario._id}>
                      {scenario.scenario_name} - {new Date(scenario.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                
                {selectedScenario && (
                  <button 
                    onClick={() => deleteScenario(selectedScenario)} 
                    className="delete-btn"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Monthly Invoice Volume</label>
              <input
                type="number"
                name="monthly_invoice_volume"
                value={formData.monthly_invoice_volume}
                onChange={handleInputChange}
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Number of AP Staff</label>
              <input
                type="number"
                name="num_ap_staff"
                value={formData.num_ap_staff}
                onChange={handleInputChange}
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Average Hours per Invoice</label>
              <input
                type="number"
                name="avg_hours_per_invoice"
                value={formData.avg_hours_per_invoice}
                onChange={handleInputChange}
                step="0.01"
                min="0.01"
              />
            </div>

            <div className="form-group">
              <label>Hourly Wage ($)</label>
              <input
                type="number"
                name="hourly_wage"
                value={formData.hourly_wage}
                onChange={handleInputChange}
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Manual Error Rate (%)</label>
              <input
                type="number"
                name="error_rate_manual"
                value={formData.error_rate_manual}
                onChange={handleInputChange}
                step="0.1"
                min="0"
                max="100"
              />
            </div>

            <div className="form-group">
              <label>Error Correction Cost ($)</label>
              <input
                type="number"
                name="error_cost"
                value={formData.error_cost}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Time Horizon (months)</label>
              <input
                type="number"
                name="time_horizon_months"
                value={formData.time_horizon_months}
                onChange={handleInputChange}
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Implementation Cost ($)</label>
              <input
                type="number"
                name="one_time_implementation_cost"
                value={formData.one_time_implementation_cost}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>
        </div>

        {results && (
          <div className="results-section">
            <h2>ROI Analysis Results</h2>
            
            <div className="results-grid">
              <div className="result-card highlight">
                <h3>Monthly Savings</h3>
                <div className="value">{formatCurrency(results.monthly_savings)}</div>
              </div>

              <div className="result-card highlight">
                <h3>Payback Period</h3>
                <div className="value">{results.payback_months} months</div>
              </div>

              <div className="result-card highlight">
                <h3>Total ROI</h3>
                <div className="value">{formatPercentage(results.roi_percentage)}</div>
              </div>

              <div className="result-card highlight">
                <h3>Net Savings</h3>
                <div className="value">{formatCurrency(results.net_savings)}</div>
              </div>

              <div className="result-card">
                <h3>Manual Labor Cost</h3>
                <div className="value">{formatCurrency(results.labor_cost_manual)}</div>
                <small>per month</small>
              </div>

              <div className="result-card">
                <h3>Automation Cost</h3>
                <div className="value">{formatCurrency(results.auto_cost)}</div>
                <small>per month</small>
              </div>

              <div className="result-card">
                <h3>Error Savings</h3>
                <div className="value">{formatCurrency(results.error_savings)}</div>
                <small>per month</small>
              </div>

              <div className="result-card">
                <h3>Cumulative Savings</h3>
                <div className="value">{formatCurrency(results.cumulative_savings)}</div>
                <small>over {formData.time_horizon_months} months</small>
              </div>
            </div>

            <div className="report-section">
              <button 
                onClick={() => setShowReportModal(true)}
                className="report-btn"
                disabled={!currentScenarioId}
              >
                Generate PDF Report
              </button>
              {!currentScenarioId && (
                <div><small>Save scenario first to generate report</small></div>
              )}
            </div>
          </div>
        )}
      </div>

      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Generate PDF Report</h3>
            <p>Enter your email to receive the detailed ROI analysis report:</p>
            <input
              type="email"
              placeholder="your.email@company.com"
              value={reportEmail}
              onChange={(e) => setReportEmail(e.target.value)}
              className="email-input"
            />
            <div className="modal-buttons">
              <button onClick={() => setShowReportModal(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={generateReport} disabled={loading} className="generate-btn">
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
