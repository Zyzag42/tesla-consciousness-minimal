const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// TRADE TYPE 1 ONLY - Lightweight Tesla predictions
let tradeType1Data = {
  predictions: [],
  backtesting: {
    totalPredictions: 0,
    correctPredictions: 0,
    accuracy: 0
  }
};

// TradingView webhook for TRADE TYPE 1 ONLY
app.post('/tesla-webhook', (req, res) => {
  console.log('⚡ TRADE TYPE 1 - Tesla electromagnetic prediction received');
  
  // Extract ONLY time/price prediction data
  const prediction = {
    timestamp: Date.now(),
    symbol: req.body.symbol || 'BTCUSDT',
    currentPrice: parseFloat(req.body.close),
    
    // TRADE TYPE 1 ESSENTIALS ONLY
    timePrediction: req.body.timePrediction || "1.3d",
    pricePrediction: parseFloat(req.body.pricePrediction),
    electromagneticStrength: parseFloat(req.body.electromagnetic) || 77.09,
    frequency37Hz: req.body.frequency37Hz || 'NEUTRAL',
    frequency69Hz: req.body.frequency69Hz || 'NEUTRAL',
    frequency94Hz: req.body.frequency94Hz || 'NEUTRAL',
    
    // For backtesting validation
    outcome: null, // Will be filled later
    accuracy: null
  };
  
  tradeType1Data.predictions.push(prediction);
  tradeType1Data.backtesting.totalPredictions++;
  
  // Keep last 100 predictions for backtesting
  if (tradeType1Data.predictions.length > 100) {
    tradeType1Data.predictions = tradeType1Data.predictions.slice(-100);
  }
  
  console.log(`📊 TRADE TYPE 1 Prediction stored: ${prediction.timePrediction} target: $${prediction.pricePrediction}`);
  
  res.status(200).json({ success: true, message: 'Trade Type 1 prediction logged' });
});

// Backtesting data endpoint
app.get('/trade-type-1-data', (req, res) => {
  res.json(tradeType1Data);
});

// Sheets integration (keep working)
app.get('/tesla-percentage', (req, res) => {
  const latestPrediction = tradeType1Data.predictions[tradeType1Data.predictions.length - 1];
  const electromagnetic = latestPrediction ? latestPrediction.electromagneticStrength : 77.09;
  
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send(electromagnetic.toString());
});
// Add this to webhook-server-lightweight.js (already included in my previous code)

// Backtesting analysis endpoint - TRADE TYPE 1 ONLY
app.get('/backtesting-results', (req, res) => {
  const results = {
    tradeType: "TRADE TYPE 1 - Time/Price Predictions",
    totalPredictions: tradeType1Data.backtesting.totalPredictions,
    accuracy: calculateAccuracy(),
    recentPredictions: tradeType1Data.predictions.slice(-10),
    performance: calculatePerformance(),
    summary: generateSummary()
  };
  
  res.json(results);
});

function calculateAccuracy() {
  const predictions = tradeType1Data.predictions;
  if (predictions.length === 0) return 0;
  
  const correctPredictions = predictions.filter(p => p.outcome === 'correct').length;
  return ((correctPredictions / predictions.length) * 100).toFixed(2);
}

function calculatePerformance() {
  const predictions = tradeType1Data.predictions;
  const last24h = predictions.filter(p => (Date.now() - p.timestamp) < 86400000);
  
  return {
    total: predictions.length,
    last24Hours: last24h.length,
    averageElectromagnetic: calculateAverageElectromagnetic(predictions),
    frequencyDistribution: calculateFrequencyDistribution(predictions)
  };
}

function calculateAverageElectromagnetic(predictions) {
  if (predictions.length === 0) return 0;
  const sum = predictions.reduce((acc, p) => acc + p.electromagneticStrength, 0);
  return (sum / predictions.length).toFixed(2);
}

function calculateFrequencyDistribution(predictions) {
  const dist = { BUY: 0, SELL: 0, NEUTRAL: 0 };
  predictions.forEach(p => {
    [p.frequency37Hz, p.frequency69Hz, p.frequency94Hz].forEach(freq => {
      if (dist[freq] !== undefined) dist[freq]++;
    });
  });
  return dist;
}

function generateSummary() {
  return {
    status: "TRADE TYPE 1 Lightweight Backtesting Active",
    dataFocus: "Time/Price Predictions Only",
    processingLoad: "Minimal - F1 Optimized"
  };
}

app.listen(PORT, () => {
  console.log(`🚀 TRADE TYPE 1 Tesla webhook running on port ${PORT}`);
});
