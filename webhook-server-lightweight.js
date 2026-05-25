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

app.get('/backtesting-results', (req, res) => {
  const results = {
    tradeType: "TRADE TYPE 1 - Time/Price Predictions",
    totalPredictions: tradeType1Data.backtesting.totalPredictions,
    accuracy: calculateAccuracy(),
    recentPredictions: tradeType1Data.predictions.slice(-10).map(pred => ({
      // Original data
      timestamp: pred.timestamp,
      
      // HUMAN-READABLE TIME FORMATTING
      alertTime: formatTimestamp(pred.timestamp),
      utcTime: new Date(pred.timestamp).toISOString(),
      localTime: new Date(pred.timestamp).toLocaleString('en-GB', {timeZone: 'UTC'}),
      
      // Enhanced prediction data
      symbol: pred.symbol,
      currentPrice: `$${pred.currentPrice.toFixed(2)}`,
      timePrediction: pred.timePrediction,
      pricePrediction: `$${pred.pricePrediction.toFixed(2)}`,
      
      // TARGET PREDICTION TIME
      targetTimestamp: pred.timestamp + (1.3 * 24 * 60 * 60 * 1000), // +1.3 days
      targetTime: formatTimestamp(pred.timestamp + (1.3 * 24 * 60 * 60 * 1000)),
      
      electromagneticStrength: `${pred.electromagneticStrength}%`,
      frequency37Hz: pred.frequency37Hz,
      frequency69Hz: pred.frequency69Hz,
      frequency94Hz: pred.frequency94Hz,
      
      // BULLISH WEIGHT CALCULATION
      bullishSignals: calculateBullishWeight(pred),
      marketBias: determineMarketBias(pred),
      
      outcome: pred.outcome,
      accuracy: pred.accuracy
    })),
    performance: calculatePerformance(),
    summary: generateEnhancedSummary()
  };
  
  res.json(results);
});

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return {
    date: date.toDateString(),
    time: date.toTimeString().split(' ')[0], // HH:MM:SS
    utc: date.toISOString(),
    readable: date.toLocaleString('en-GB', {
      timeZone: 'UTC',
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  };
}

function calculateBullishWeight(prediction) {
  const signals = [prediction.frequency37Hz, prediction.frequency69Hz, prediction.frequency94Hz];
  const buyCount = signals.filter(s => s === 'BUY').length;
  const sellCount = signals.filter(s => s === 'SELL').length;
  
  return {
    buySignals: buyCount,
    sellSignals: sellCount,
    totalSignals: signals.length,
    bullishWeight: `${((buyCount / signals.length) * 100).toFixed(1)}%`,
    bias: buyCount > sellCount ? 'BULLISH' : buyCount < sellCount ? 'BEARISH' : 'NEUTRAL'
  };
}

function determineMarketBias(prediction) {
  const bullishWeight = calculateBullishWeight(prediction);
  const electromagneticStrength = prediction.electromagneticStrength;
  
  return {
    frequencyBias: bullishWeight.bias,
    electromagneticConfidence: `${electromagneticStrength}%`,
    overallBias: bullishWeight.buySignals >= 2 ? 'BULLISH MOMENTUM' : 'BEARISH MOMENTUM',
    confidence: electromagneticStrength > 75 ? 'HIGH' : electromagneticStrength > 50 ? 'MEDIUM' : 'LOW'
  };
}

app.listen(PORT, () => {
  console.log(`🚀 TRADE TYPE 1 Tesla webhook running on port ${PORT}`);
});
