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
  try {
    const results = {
      tradeType: "TRADE TYPE 1 - Time/Price Predictions",
      totalPredictions: tradeType1Data.backtesting.totalPredictions,
      accuracy: calculateAccuracy(),
      recentPredictions: tradeType1Data.predictions.slice(-10).map(pred => ({
        timestamp: pred.timestamp,
        alertTime: formatTimestamp(pred.timestamp),
        symbol: pred.symbol,
        currentPrice: `$${pred.currentPrice.toFixed(2)}`,
        timePrediction: pred.timePrediction,
        pricePrediction: `$${pred.pricePrediction.toFixed(2)}`,
        targetTimestamp: pred.timestamp + (1.3 * 24 * 60 * 60 * 1000),
        targetTime: formatTimestamp(pred.timestamp + (1.3 * 24 * 60 * 60 * 1000)),
        electromagneticStrength: `${pred.electromagneticStrength}%`,
        frequency37Hz: pred.frequency37Hz,
        frequency69Hz: pred.frequency69Hz,
        frequency94Hz: pred.frequency94Hz,
        bullishSignals: calculateBullishWeight(pred),
        outcome: pred.outcome,
        accuracy: pred.accuracy
      })),
      performance: calculatePerformance(),
      summary: generateEnhancedSummary()
    };
    
    res.json(results);
  } catch (error) {
    console.error('❌ Backtesting results error:', error.message);
    res.status(500).json({ error: "Backtesting error", message: error.message });
  }
});

// HELPER FUNCTIONS - NO DUPLICATES
function calculateAccuracy() {
  const predictions = tradeType1Data.predictions;
  if (predictions.length === 0) return "0.00";
  
  const correctPredictions = predictions.filter(p => p.outcome === 'correct').length;
  return ((correctPredictions / predictions.length) * 100).toFixed(2);
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString('en-GB', {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function calculateBullishWeight(prediction) {
  const signals = [prediction.frequency37Hz, prediction.frequency69Hz, prediction.frequency94Hz];
  const buyCount = signals.filter(s => s === 'BUY').length;
  const sellCount = signals.filter(s => s === 'SELL').length;
  
  return {
    buySignals: buyCount,
    sellSignals: sellCount,
    bullishWeight: `${((buyCount / signals.length) * 100).toFixed(1)}%`,
    bias: buyCount > sellCount ? 'BULLISH' : buyCount < sellCount ? 'BEARISH' : 'NEUTRAL'
  };
}

function calculateAverageElectromagnetic() {
  const predictions = tradeType1Data.predictions;
  if (predictions.length === 0) return "0.00";
  
  const sum = predictions.reduce((acc, p) => acc + p.electromagneticStrength, 0);
  return (sum / predictions.length).toFixed(2);
}

function calculateFrequencyDistribution() {
  const predictions = tradeType1Data.predictions;
  const dist = { BUY: 0, SELL: 0, NEUTRAL: 0 };
  
  predictions.forEach(p => {
    [p.frequency37Hz, p.frequency69Hz, p.frequency94Hz].forEach(freq => {
      if (dist[freq] !== undefined) dist[freq]++;
    });
  });
  
  return dist;
}

function calculatePerformance() {
  const predictions = tradeType1Data.predictions;
  const last24h = predictions.filter(p => (Date.now() - p.timestamp) < 86400000);
  
  return {
    total: predictions.length,
    last24Hours: last24h.length,
    averageElectromagnetic: calculateAverageElectromagnetic(),
    frequencyDistribution: calculateFrequencyDistribution(),
    latestPrice: predictions.length > 0 ? predictions[predictions.length - 1].currentPrice : 0,
    priceRange: calculatePriceRange(predictions),
    predictionTimeRange: calculateTimeRange(predictions)
  };
}

function calculatePriceRange(predictions) {
  if (predictions.length === 0) return { min: 0, max: 0, range: 0 };
  
  const prices = predictions.map(p => p.currentPrice);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  
  return {
    min: min.toFixed(2),
    max: max.toFixed(2),
    range: (max - min).toFixed(2)
  };
}

function calculateTimeRange(predictions) {
  if (predictions.length === 0) return { first: null, last: null, span: "0 minutes" };
  
  const timestamps = predictions.map(p => p.timestamp);
  const first = Math.min(...timestamps);
  const last = Math.max(...timestamps);
  const spanMinutes = Math.round((last - first) / (1000 * 60));
  
  return {
    first: formatTimestamp(first),
    last: formatTimestamp(last),
    span: `${spanMinutes} minutes`
  };
}

function generateEnhancedSummary() {
  return {
    status: "TRADE TYPE 1 Lightweight Backtesting Active",
    dataFocus: "Time/Price Predictions Only",
    processingLoad: "Minimal - F1 Optimized",
    systemHealth: "Operational",
    lastUpdate: formatTimestamp(Date.now())
  };
}

// ADD THIS AFTER YOUR EXISTING ENDPOINTS
// (After /backtesting-results, before helper functions)

app.get('/sheets-predictions', (req, res) => {
  try {
    // Format data specifically for Sheets import
    const sheetsData = tradeType1Data.predictions.map(pred => ({
      timestamp: pred.timestamp,
      alertTime: formatTimestamp(pred.timestamp),
      symbol: pred.symbol,
      currentPrice: pred.currentPrice,
      timePrediction: pred.timePrediction,
      pricePrediction: pred.pricePrediction,
      targetTimestamp: pred.timestamp + (1.3 * 24 * 60 * 60 * 1000),
      targetTime: formatTimestamp(pred.timestamp + (1.3 * 24 * 60 * 60 * 1000)),
      electromagneticStrength: pred.electromagneticStrength,
      frequency37Hz: pred.frequency37Hz,
      frequency69Hz: pred.frequency69Hz,
      frequency94Hz: pred.frequency94Hz,
      buySignals: calculateBullishWeight(pred).buySignals,
      sellSignals: calculateBullishWeight(pred).sellSignals,
      bullishWeight: parseFloat(calculateBullishWeight(pred).bullishWeight.replace('%', '')),
      marketBias: calculateBullishWeight(pred).bias,
      outcome: pred.outcome,
      accuracy: pred.accuracy
    }));
    
    // Set headers for Sheets compatibility
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(sheetsData);
    
  } catch (error) {
    console.error('❌ Sheets predictions error:', error.message);
    res.status(200).json([]); // Return empty array on error
  }
});

// Enhanced webhook for direct Sheets population
app.post('/sheets-webhook', (req, res) => {
  // Process TV alert
  const alertData = req.body;
  
  // Calculate Tesla Energy variables
  const teslaData = {
    timestamp: Date.now(),
    alertTime: formatTimestamp(Date.now()),
    ...alertData,
    
    // Enhanced Tesla calculations
    hotSpotStatus: calculateHotSpotFromAlert(alertData),
    convergence: calculateConvergenceFromAlert(alertData),
    sacredGeometry: calculateSacredGeometryFromAlert(alertData),
    fieldResonance: calculateFieldResonanceFromAlert(alertData)
  };
  
  // Store for Sheets access
  sheetsData.push(teslaData);
  
  res.json({success: true});
});

// Add Tesla Energy calculations to webhook response
const enhancedTeslaData = {
  // Existing data...
  
  // NEW CALCULATIONS
  crossType: calculate37_69_94CrossType(),
  threewaveBias: calculateThreeWaveBias(), 
  convergenceDivergence: calculateConvergenceDivergence(),
  angularMomentum: calculateAngularMomentum(),
  fieldHarmony: calculateFieldHarmony(),
  fieldCollapse: calculateFieldCollapse(),
  
  // BOLLINGER TESLA SQUEEZE
  tesla37LowerBollinger: calculateTesla37Bollinger(),
  tesla69SMAEquivalent: calculateTesla69SMA(),
  tesla94UpperBollinger: calculateTesla94Bollinger(),
  teslaSqueezeStatus: calculateTeslaSqueeze()
};
app.listen(PORT, () => {
  console.log(`🚀 TRADE TYPE 1 Tesla webhook running on port ${PORT}`);
});
