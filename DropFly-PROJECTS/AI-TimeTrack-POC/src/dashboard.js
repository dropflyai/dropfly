/**
 * Simple Web Dashboard for POC Results
 * Displays accuracy metrics and detailed results
 */

const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static HTML dashboard
app.get('/', async (req, res) => {
  try {
    // Load test results if they exist
    const resultsPath = path.join(__dirname, '../tests/accuracy-report.json');
    let results = null;

    try {
      const data = await fs.readFile(resultsPath, 'utf-8');
      results = JSON.parse(data);
    } catch (error) {
      // Results don't exist yet
    }

    const html = generateDashboardHTML(results);
    res.send(html);
  } catch (error) {
    res.status(500).send(`Error loading dashboard: ${error.message}`);
  }
});

function generateDashboardHTML(results) {
  const hasResults = results !== null;
  const metrics = hasResults ? results.metrics : null;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI TimeTrack POC - Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      color: white;
      margin-bottom: 40px;
    }
    .header h1 {
      font-size: 3em;
      margin-bottom: 10px;
    }
    .header p {
      font-size: 1.2em;
      opacity: 0.9;
    }
    .card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    .card h2 {
      margin-bottom: 20px;
      color: #333;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .metric {
      background: #f7f9fc;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    .metric-label {
      font-size: 0.9em;
      color: #666;
      margin-bottom: 8px;
    }
    .metric-value {
      font-size: 2.5em;
      font-weight: bold;
      color: #333;
    }
    .metric-status {
      margin-top: 8px;
      font-size: 0.9em;
      font-weight: 600;
    }
    .status-pass { color: #10b981; }
    .status-close { color: #f59e0b; }
    .status-fail { color: #ef4444; }
    .verdict {
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
      font-size: 1.1em;
      font-weight: 600;
    }
    .verdict-success {
      background: #d1fae5;
      color: #065f46;
      border-left: 4px solid #10b981;
    }
    .verdict-close {
      background: #fef3c7;
      color: #92400e;
      border-left: 4px solid #f59e0b;
    }
    .verdict-fail {
      background: #fee2e2;
      color: #991b1b;
      border-left: 4px solid #ef4444;
    }
    .no-results {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }
    .no-results h3 {
      font-size: 1.8em;
      margin-bottom: 20px;
      color: #333;
    }
    .code {
      background: #1e293b;
      color: #e2e8f0;
      padding: 15px;
      border-radius: 6px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
      margin-top: 15px;
      overflow-x: auto;
    }
    .refresh-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 6px;
      font-size: 1em;
      cursor: pointer;
      margin-top: 20px;
    }
    .refresh-btn:hover {
      background: #5568d3;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    .details-table th,
    .details-table td {
      text-align: left;
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .details-table th {
      background: #f7f9fc;
      font-weight: 600;
      color: #333;
    }
    .details-table tr:hover {
      background: #f9fafb;
    }
    .accuracy-bar {
      height: 24px;
      background: #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
      margin-top: 8px;
    }
    .accuracy-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.8em;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🤖 AI TimeTrack POC</h1>
      <p>AI Time Categorization Accuracy Dashboard</p>
    </div>

    ${hasResults ? generateResultsHTML(results, metrics) : generateNoResultsHTML()}
  </div>

  <script>
    // Auto-refresh every 30 seconds
    setTimeout(() => location.reload(), 30000);
  </script>
</body>
</html>
  `;
}

function generateNoResultsHTML() {
  return `
    <div class="card">
      <div class="no-results">
        <h3>📊 No test results yet</h3>
        <p>Run the accuracy test to see results:</p>
        <div class="code">npm run test</div>
        <button class="refresh-btn" onclick="location.reload()">Refresh Dashboard</button>
      </div>
    </div>
  `;
}

function generateResultsHTML(results, metrics) {
  const verdictClass =
    metrics.overallAccuracy >= 90 ? 'verdict-success' :
    metrics.overallAccuracy >= 80 ? 'verdict-close' :
    'verdict-fail';

  const verdictText =
    metrics.overallAccuracy >= 90 ? '✅ SUCCESS! Ready for MVP development' :
    metrics.overallAccuracy >= 80 ? '⚠️ CLOSE - Needs refinement' :
    '❌ NEEDS WORK - Below target';

  return `
    <div class="card">
      <h2>🎯 Overall Performance</h2>

      <div class="metrics-grid">
        <div class="metric">
          <div class="metric-label">Overall Accuracy</div>
          <div class="metric-value">${metrics.overallAccuracy.toFixed(1)}%</div>
          <div class="accuracy-bar">
            <div class="accuracy-bar-fill" style="width: ${metrics.overallAccuracy}%">
              ${metrics.overallAccuracy.toFixed(0)}%
            </div>
          </div>
        </div>

        <div class="metric">
          <div class="metric-label">Client Detection</div>
          <div class="metric-value">${metrics.clientAccuracy.toFixed(1)}%</div>
          <div class="metric-status ${getStatusClass(metrics.clientAccuracy, 95)}">
            ${getStatusText(metrics.clientAccuracy, 95)}
          </div>
        </div>

        <div class="metric">
          <div class="metric-label">Matter Detection</div>
          <div class="metric-value">${metrics.matterAccuracy.toFixed(1)}%</div>
          <div class="metric-status ${getStatusClass(metrics.matterAccuracy, 85)}">
            ${getStatusText(metrics.matterAccuracy, 85)}
          </div>
        </div>

        <div class="metric">
          <div class="metric-label">Activity Type</div>
          <div class="metric-value">${metrics.activityTypeAccuracy.toFixed(1)}%</div>
          <div class="metric-status ${getStatusClass(metrics.activityTypeAccuracy, 80)}">
            ${getStatusText(metrics.activityTypeAccuracy, 80)}
          </div>
        </div>

        <div class="metric">
          <div class="metric-label">Avg Confidence</div>
          <div class="metric-value">${metrics.avgConfidence.toFixed(1)}%</div>
        </div>

        <div class="metric">
          <div class="metric-label">Processing Time</div>
          <div class="metric-value">${metrics.avgProcessingTime.toFixed(0)}<span style="font-size: 0.5em;">ms</span></div>
        </div>
      </div>

      <div class="verdict ${verdictClass}">
        ${verdictText}
      </div>
    </div>

    <div class="card">
      <h2>📋 Detailed Results</h2>
      <p style="color: #666; margin-bottom: 10px;">
        Test run: ${new Date(results.timestamp).toLocaleString()} |
        Total activities: ${results.evaluations.length}
      </p>

      <table class="details-table">
        <thead>
          <tr>
            <th>Activity</th>
            <th>Ground Truth</th>
            <th>Prediction</th>
            <th>Accuracy</th>
            <th>Confidence</th>
          </tr>
        </thead>
        <tbody>
          ${results.evaluations.map((e, i) => `
            <tr>
              <td>
                <strong>${e.activity.application}</strong><br>
                <small style="color: #666;">${e.activity.windowTitle}</small>
              </td>
              <td>
                ${e.groundTruth.client}<br>
                <small style="color: #666;">${e.groundTruth.matter}</small>
              </td>
              <td>
                ${e.prediction.client}<br>
                <small style="color: #666;">${e.prediction.matter}</small>
              </td>
              <td>
                <strong style="color: ${e.evaluation.overallAccuracy >= 0.9 ? '#10b981' : '#ef4444'}">
                  ${(e.evaluation.overallAccuracy * 100).toFixed(1)}%
                </strong>
              </td>
              <td>${(e.evaluation.confidence * 100).toFixed(1)}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="card">
      <button class="refresh-btn" onclick="location.reload()">Refresh Dashboard</button>
    </div>
  `;
}

function getStatusClass(value, threshold) {
  if (value >= threshold) return 'status-pass';
  if (value >= threshold - 10) return 'status-close';
  return 'status-fail';
}

function getStatusText(value, threshold) {
  if (value >= threshold) return '✅ PASS';
  if (value >= threshold - 10) return '⚠️ CLOSE';
  return '❌ FAIL';
}

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 Dashboard running at: http://localhost:3000');
  console.log('   Press Ctrl+C to stop\n');
});
