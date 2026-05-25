const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware - CORS first
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store latest Tesla alerts
let latestTeslaAlerts = {
  alerts: [],
  lastUpdate: Date.now(),
  hotSpotDetected: false,
  teslaAcceleration: false,
  frequency37Hz: 'NEUTRAL',
  frequency69Hz: 'NEUTRAL',
  frequency94Hz: 'NEUTRAL',
  marketData: {
    open: 45000 + Math.random() * 1000,
    high: 46000 + Math.random() * 1000,
    low: 44000 + Math.random() * 1000,
    close: 45500 + Math.random() * 1000,
    volume: 1000000 + Math.random() * 500000,
    symbol: 'BTCUSDT',
    timestamp: Date.now()
  }
};

// Tesla consciousness webhook endpoint
app.post('/tesla-webhook', (req, res) => {
  console.log('🚀 Tesla consciousness alert received:', req.body);
  
  // Store alert
  latestTeslaAlerts.alerts.push({
    ...req.body,
    timestamp: Date.now()
  });
  
  latestTeslaAlerts.lastUpdate = Date.now();
  
  res.status(200).json({ 
    success: true, 
    message: 'Tesla consciousness alert processed' 
  });
});

// Get Tesla alerts
app.get('/tesla-webhook', (req, res) => {
  res.json(latestTeslaAlerts);
});

// Simple Tesla percentage endpoint for Sheets
app.get('/tesla-percentage', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send('77.09');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Tesla consciousness webhook operational',
    alerts: latestTeslaAlerts.alerts.length,
    lastUpdate: latestTeslaAlerts.lastUpdate,
    port: PORT
  });
});
// Add to webhook-server.js
app.get('/backtesting-results', (req, res) => {
  const results = {
    totalPredictions: tradeType1Data.backtesting.totalPredictions,
    accuracy: tradeType1Data.backtesting.accuracy,
    recentPredictions: tradeType1Data.predictions.slice(-10),
    performance: calculatePerformance()
  };
  
  res.json(results);
});

function calculatePerformance() {
  // Simple accuracy calculation for TRADE TYPE 1
  let correct = 0;
  const predictions = tradeType1Data.predictions;
  
  predictions.forEach(pred => {
    if (pred.outcome === 'correct') correct++;
  });
  
  return {
    accuracy: predictions.length > 0 ? (correct / predictions.length) * 100 : 0,
    totalSamples: predictions.length
  };
}
// Start server
app.listen(PORT, () => {
  console.log(`🚀 Tesla consciousness webhook server running on port ${PORT}`);
});
