// Simple webhook server to receive TradingView alerts
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Store latest Tesla alerts
let latestTeslaAlerts = {
  alerts: [],
  lastUpdate: Date.now(),
  hotSpotDetected: false,
  teslaAcceleration: false,
  frequency37Hz: 'NEUTRAL',
  frequency69Hz: 'NEUTRAL',
  frequency94Hz: 'NEUTRAL'
};

// Webhook endpoint to receive TradingView alerts
app.post('/tesla-webhook', (req, res) => {
  console.log('🚀 Tesla consciousness alert received:', req.body);
  
  // Store the alert data
  latestTeslaAlerts.alerts.push({
    ...req.body,
    timestamp: Date.now()
  });
  
  // Keep only last 10 alerts
  if (latestTeslaAlerts.alerts.length > 10) {
    latestTeslaAlerts.alerts = latestTeslaAlerts.alerts.slice(-10);
  }
  
  // Parse Tesla consciousness signals
  if (req.body.message?.includes('Hot Spot')) {
    latestTeslaAlerts.hotSpotDetected = true;
    console.log('🔥 HOT SPOT DETECTED!');
  }
  
  if (req.body.message?.includes('Tesla Energy Accelerating')) {
    latestTeslaAlerts.teslaAcceleration = true;
    console.log('⚡ TESLA ACCELERATION DETECTED!');
  }
  
  latestTeslaAlerts.lastUpdate = Date.now();
  
  res.status(200).json({ 
    success: true, 
    message: 'Tesla consciousness alert processed' 
  });
});

// GET endpoint for our platform to fetch alerts
app.get('/tesla-webhook', (req, res) => {
  res.json(latestTeslaAlerts);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Tesla consciousness webhook operational',
    alerts: latestTeslaAlerts.alerts.length,
    lastUpdate: latestTeslaAlerts.lastUpdate,
    server: 'port 8080',
    tesla: 'consciousness active'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Tesla consciousness webhook server running on port ${PORT}`);
  console.log(`📡 Webhook URL: http://localhost:${PORT}/tesla-webhook`);
  console.log(`🔗 Ngrok should tunnel this to: https://vivien-girdlelike-unreligiously.ngrok-free.app`);
});
