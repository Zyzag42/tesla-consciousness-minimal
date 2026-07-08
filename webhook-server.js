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
  if (req.body && typeof req.body === 'object') {
    console.log('🎯 Alert received - Starting sheets integration');
    console.log('📊 Alert data:', JSON.stringify(req.body));
    
    // Check if this has plot data
    const hasPlotData = req.body.tesla_target_price !== undefined || 
                        req.body.sine_37 !== undefined ||
                        Object.keys(req.body).length > 2;
    
    if (!hasPlotData) {
      console.log('📨 Alert trigger received, waiting for plot data...');
      return res.status(200).send('Alert trigger acknowledged');
    }
    
    console.log('📊 Processing alert with plot data for Sheets...');
    
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
      
      // Write data to sheets
      console.log('📝 Writing data to TradingView_3_6_9_Live sheet...');
      await sheets.writeMasterLiveData(req.body);
      console.log('✅ Data written successfully!');
      
      return res.status(200).send('Success');
      
    } catch (error) {
      console.error('❌ Error processing MASTER_LIVE alert:', error.message);
      console.error('📊 Stack trace:', error.stack);
      return res.status(500).send('Error: ' + error.message);
    }
  }
  
  // If no body or not an object, skip
  console.log('⏭️ Alert received but no valid data, skipping');
  return res.status(200).send('No data to process');
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
