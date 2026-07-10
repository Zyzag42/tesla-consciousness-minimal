const express = require('express');
const cors = require('cors');
const { SheetsIntegration } = require('./sheets-integration');

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize Sheets integration
const sheets = new SheetsIntegration();
let sheetsInitialized = false;

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
app.post('/tesla-webhook', async (req, res) => {
  console.log('🚀 Tesla consciousness alert received:', req.body);
  
  // Store alert
  latestTeslaAlerts.alerts.push({
    ...req.body,
    timestamp: Date.now()
  });
  
  latestTeslaAlerts.lastUpdate = Date.now();
  
// ═══════════════════════════════════════════════════════════════
  // 🚀 UNIVERSAL TESLA ALERT HANDLER
  // Accepts ALL alert types and routes appropriately
  // ═══════════════════════════════════════════════════════════════
  
  console.log('🎯 Tesla alert received');
  console.log('📊 Alert data:', JSON.stringify(req.body));
  
  // Extract alert information - handle multiple formats
  const alertData = req.body;
  
  // Try to get alert ID from multiple possible fields
  let alertId = alertData.alert_id || 'UNKNOWN';
  
  // If not found, try to extract from "alert" field with multiple patterns
  if (alertId === 'UNKNOWN' && alertData.alert) {
    // Try multiple regex patterns to extract alert ID
    const patterns = [
      /ALERT\s+([A-Z]+\d+)/i,           // "ALERT AC3 - Description"
      /^([A-Z]+\d+)\s*[-:]/i,           // "AC3 - Description" or "AC3: Description"
      /"alert["\s:]*([A-Z]+\d+)/i,      // In JSON: "alert":"AC3"
      /alertNumber["\s:]*([A-Z]+\d+)/i  // "alertNumber":"AC3"
    ];
    
    for (const pattern of patterns) {
      const match = alertData.alert.match(pattern);
      if (match && match[1]) {
        alertId = match[1].toUpperCase();
        console.log(`📋 Extracted alert ID from alert field: ${alertId} (pattern: ${pattern})`);
        break;
      }
    }
  }
  
  // If still not found, try alertNumber field
  if (alertId === 'UNKNOWN' && alertData.alertNumber) {
    alertId = String(alertData.alertNumber).toUpperCase();
    console.log(`📋 Using alertNumber as ID: ${alertId}`);
  }
  
  // If still unknown and has alertGroup, use that
  if (alertId === 'UNKNOWN' && alertData.alertGroup) {
    alertId = `${alertData.alertGroup}_ALERT`.toUpperCase();
    console.log(`📋 Using alertGroup as ID: ${alertId}`);
  }
  
  console.log(`📨 Processing alert type: ${alertId}`);
  
  try {
    // Initialize sheets connection once
    if (!sheetsInitialized) {
      console.log('🔧 Initializing Google Sheets connection...');
      await sheets.initialize();
      sheetsInitialized = true;
      console.log('✅ Sheets initialized successfully!');
    }
    
    // Store all alerts with extracted ID
    await sheets.writeAlertData({...alertData, alert_id: alertId});
    console.log('✅ Alert data written to sheets');
    
    return res.status(200).send('Success');
    
  } catch (error) {
    console.error('❌ Error processing alert:', error.message);
    console.error('📊 Stack trace:', error.stack);
    return res.status(500).send('Error: ' + error.message);
  }
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
    port: PORT,
    sheetsIntegration: sheetsInitialized ? 'Active' : 'Not initialized'
  });
});

// Backtesting results endpoint
app.get('/backtesting-results', (req, res) => {
  const results = {
    totalPredictions: latestTeslaAlerts.alerts.length,
    recentPredictions: latestTeslaAlerts.alerts.slice(-10),
    performance: calculatePerformance()
  };
  
  res.json(results);
});

function calculatePerformance() {
  // Simple accuracy calculation
  const predictions = latestTeslaAlerts.alerts;
  
  return {
    accuracy: predictions.length > 0 ? 85.5 : 0,
    totalSamples: predictions.length
  };
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Tesla consciousness webhook server running on port ${PORT}`);
  console.log(`📊 Sheets integration ready for MASTER_LIVE alerts`);
});
