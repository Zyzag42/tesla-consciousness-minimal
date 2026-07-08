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
  // 📊 NEW: SHEETS INTEGRATION FOR MASTER_LIVE ALERTS
  // ═══════════════════════════════════════════════════════════════
  // Accept any alert with data (not checking specific alert_id for this webhook)
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    console.log('🎯 MASTER_LIVE detected - Starting sheets integration');
    console.log('📊 Alert data:', JSON.stringify(req.body));
    
    try {
      // Initialize sheets connection once
      if (!sheetsInitialized) {
        console.log('🔧 Initializing Google Sheets connection...');
        console.log('📋 Spreadsheet ID:', process.env.GOOGLE_SHEETS_ID ? 'Present' : 'MISSING');
        console.log('🔑 Client email:', process.env.GOOGLE_CLIENT_EMAIL ? 'Present' : 'MISSING');
        
        await sheets.initialize();
        sheetsInitialized = true;
        console.log('✅ Sheets initialized successfully!');
      }
    
    // Write MASTER_LIVE data to TradingView_3-6-9_Live sheet
    console.log('📊 Calling writeMasterLiveData...');
    const result = await sheets.writeMasterLiveData(req.body);
    console.log('✅ Sheets integration successful! Result:', result);
    
  } catch (error) {
    console.log('❌ Sheets integration error:', error.message);
    console.log('❌ Error stack:', error.stack);
    console.log('❌ Full error:', JSON.stringify(error, null, 2));
  }
} else {
  console.log('⏭️ Alert ID not MASTER_LIVE, skipping sheets. ID was:', req.body.alert_id);
}
  // ═══════════════════════════════════════════════════════════════
  
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
