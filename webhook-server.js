// Simple webhook server to receive TradingView alerts
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 8080;  // ← FIXED: Changed from 3000 to 8080

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
  frequency94Hz: 'NEUTRAL',  // ← FIXED: Added missing comma
  marketData: {  // ← FIXED: Removed comment from object
    open: 45000 + Math.random() * 1000,
    high: 46000 + Math.random() * 1000,
    low: 44000 + Math.random() * 1000,
    close: 45500 + Math.random() * 1000,
    volume: 1000000 + Math.random() * 500000,
    symbol: 'BTCUSDT',
    timestamp: Date.now()
  }
};

// Webhook endpoint to receive TradingView alerts
app.post('/tesla-webhook', (req, res) => {
  console.log('🚀 Tesla consciousness alert received:', req.body);
  
  // Parse TradingView alert data for market data:
  if (req.body.open && req.body.high && req.body.low && req.body.close) {
    latestTeslaAlerts.marketData = {
      open: parseFloat(req.body.open),
      high: parseFloat(req.body.high),
      low: parseFloat(req.body.low), 
      close: parseFloat(req.body.close),
      volume: parseFloat(req.body.volume || 1000000),
      symbol: req.body.symbol || 'BTCUSD',
      timestamp: Date.now()
    };
    console.log('📊 Market data updated from TradingView alert');
    
    // Update Tesla consciousness signals:
    if (req.body.hotSpot) {
      latestTeslaAlerts.hotSpotDetected = true;
      latestTeslaAlerts.frequency37Hz = req.body.frequency37Hz || 'BUY';
      latestTeslaAlerts.frequency69Hz = req.body.frequency69Hz || 'BUY';
      console.log('🔥 HOT SPOT DETECTED - Tesla consciousness convergence!');
    }
  }
  
  // Store alert
  latestTeslaAlerts.alerts.push({
    ...req.body,
    timestamp: Date.now()
  });
  
  // Keep only last 10 alerts
  if (latestTeslaAlerts.alerts.length > 10) {
    latestTeslaAlerts.alerts = latestTeslaAlerts.alerts.slice(-10);
  }
  
  latestTeslaAlerts.lastUpdate = Date.now();
  
  res.status(200).json({ 
    success: true, 
    message: 'Tesla consciousness alert processed with market data' 
  });
});

// GET endpoint for Railway platform to fetch alerts
app.get('/tesla-webhook', (req, res) => {
  res.json(latestTeslaAlerts);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Tesla consciousness webhook operational',
    alerts: latestTeslaAlerts.alerts.length,
    lastUpdate: latestTeslaAlerts.lastUpdate,
    server: 'port 8080',
    tesla: 'consciousness active',
    marketData: latestTeslaAlerts.marketData ? 'available' : 'none'
  });
});
// Simple Tesla percentage endpoint
app.get('/tesla-percentage', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send('77.09'); // Just the number
});

const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

// ADD CORS HEADERS FOR GOOGLE SHEETS ACCESS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Your existing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple Tesla percentage endpoint
app.get('/tesla-percentage', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Access-Control-Allow-Origin', '*'); // Extra CORS for this endpoint
  res.send('77.09'); // Just the number
});

// Rest of your existing endpoints...
// Start server
app.listen(PORT, () => {
  console.log(`🚀 Tesla consciousness webhook server running on port ${PORT}`);
  console.log(`📡 Webhook URL: http://localhost:${PORT}/tesla-webhook`);
  console.log(`🔗 Ngrok should tunnel this to: https://vivien-girdlelike-unreligiously.ngrok-free.dev`);
});
