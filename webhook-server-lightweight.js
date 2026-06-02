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

// Enhanced webhook with storage - COMPLETE VERSION
app.post('/tesla-webhook', (req, res) => {
  console.log('⚡ TESLA ENHANCED - Alert received:', req.body);
  
  try {
    const prediction = {
      timestamp: Date.now(),
      symbol: req.body.symbol || 'BTCUSD.P',
      currentPrice: parseFloat(req.body.close) || 0,
      
      // DYNAMIC TESLA DATA
      timePrediction: req.body.timePrediction || req.body.p0 || "1.3d",
      pricePrediction: parseFloat(req.body.pricePrediction || req.body.p1) || parseFloat(req.body.close) || 0,
      electromagneticStrength: parseFloat(req.body.electromagnetic || req.body.p2) || 77.09,
      
      // ENHANCED FREQUENCY SIGNALS
      frequency37Hz: interpretTeslaSignal(req.body.frequency37Hz || req.body.p3),
      frequency69Hz: interpretTeslaSignal(req.body.frequency69Hz || req.body.p4),
      frequency94Hz: interpretTeslaSignal(req.body.frequency94Hz || req.body.p5),
      
      outcome: null,
      accuracy: null
    };
    
    // STORE PREDICTION
    tradeType1Data.predictions.push(prediction);
    tradeType1Data.backtesting.totalPredictions++;
    
    // Keep last 100
    if (tradeType1Data.predictions.length > 100) {
      tradeType1Data.predictions = tradeType1Data.predictions.slice(-100);
    }
    
    console.log(`📊 ENHANCED Tesla stored: EM=${prediction.electromagneticStrength.toFixed(2)} Signals=${prediction.frequency37Hz}/${prediction.frequency69Hz}/${prediction.frequency94Hz}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Enhanced Tesla prediction logged',
      prediction: {
        price: prediction.currentPrice,
        electromagnetic: prediction.electromagneticStrength,
        signals: `${prediction.frequency37Hz}/${prediction.frequency69Hz}/${prediction.frequency94Hz}`
      }
    });
    
  } catch (error) {
    console.error('❌ Enhanced webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

function interpretTeslaSignal(value) {
  if (!value) return 'NEUTRAL';
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    // If it's already a string signal, return uppercase
    return ['BUY', 'SELL', 'NEUTRAL'].includes(value.toUpperCase()) ? value.toUpperCase() : 'NEUTRAL';
  }
  
  // Tesla frequency interpretation based on live data ranges
  if (numValue > 69500) return 'BUY';
  if (numValue < 69000) return 'SELL';
  return 'NEUTRAL';
}

// SINGLE tesla-percentage endpoint
app.get('/tesla-percentage', (req, res) => {
  try {
    const latestPrediction = tradeType1Data.predictions[tradeType1Data.predictions.length - 1];
    const electromagnetic = latestPrediction ? latestPrediction.electromagneticStrength : 77.09;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(electromagnetic.toString());
  } catch (error) {
    res.status(500).send('77.09');
  }
});

// Debug endpoint
app.get('/tesla-debug', (req, res) => {
  try {
    const debugInfo = {
      dataExists: !!tradeType1Data,
      predictionsExists: !!tradeType1Data.predictions,
      predictionsLength: tradeType1Data.predictions ? tradeType1Data.predictions.length : 0,
      predictionsType: typeof tradeType1Data.predictions,
      sampleData: tradeType1Data.predictions ? tradeType1Data.predictions.slice(0, 1) : [],
      backTestingExists: !!tradeType1Data.backtesting,
      backTestingData: tradeType1Data.backtesting || {},
      rawDataStructure: Object.keys(tradeType1Data || {})
    };
    res.json(debugInfo);
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Enhanced backtesting results
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

// Helper function (CORRECT NAME)
function interpretFrequencyValue(value) {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return 'NEUTRAL';
  
  // Interpret numeric plot values as BUY/SELL signals
  if (numValue > 0.5) return 'BUY';
  if (numValue < -0.5) return 'SELL';
  return 'NEUTRAL';
}

// Sheets predictions endpoint
app.get('/sheets-predictions', (req, res) => {
  try {
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
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(sheetsData);
    
  } catch (error) {
    console.error('❌ Sheets predictions error:', error.message);
    res.status(200).json([]);
  }
});

// Test enhanced endpoint
app.get('/tesla-test-enhanced', (req, res) => {
  try {
    const testData = tradeType1Data.predictions.map(pred => ({
      ...pred,
      testField1: "TEST_VALUE",
      testField2: pred.electromagneticStrength > 70 ? "HIGH" : "LOW",
      testField3: pred.frequency37Hz === pred.frequency94Hz ? "ALIGNED" : "DIVERGENT"
    }));
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(testData);
    
  } catch (error) {
    console.error('❌ Test enhanced error:', error.message);
    res.status(200).json([]);
  }
});

// Basic enhanced endpoint
app.get('/tesla-basic-enhanced', (req, res) => {
  try {
    const enhancedData = tradeType1Data.predictions.map(pred => ({
      ...pred,
      teslaMetrics: calculateBasicTeslaMetrics(pred),
      priceMovement: ((pred.pricePrediction - pred.currentPrice) / pred.currentPrice * 100).toFixed(2),
      confidenceLevel: pred.electromagneticStrength > 75 ? 'HIGH' : pred.electromagneticStrength > 50 ? 'MEDIUM' : 'LOW'
    }));
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(enhancedData);
    
  } catch (error) {
    console.error('❌ Basic enhanced error:', error.message);
    res.status(200).json([]);
  }
});

// DEBUG ENDPOINT
app.get('/tesla-debug', (req, res) => {
  try {
    const debugInfo = {
      dataExists: !!tradeType1Data,
      predictionsExists: !!tradeType1Data.predictions,
      predictionsLength: tradeType1Data.predictions ? tradeType1Data.predictions.length : 0,
      predictionsType: typeof tradeType1Data.predictions,
      sampleData: tradeType1Data.predictions ? tradeType1Data.predictions.slice(0, 1) : [],
      backTestingExists: !!tradeType1Data.backtesting,
      backTestingData: tradeType1Data.backtesting || {},
      rawDataStructure: Object.keys(tradeType1Data || {})
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(debugInfo);
    
  } catch (error) {
    res.json({
      error: error.message,
      debugStatus: "Error accessing tradeType1Data"
    });
  }
});

// VALIDATION ENDPOINT - MOVED TO CORRECT POSITION
app.get('/validate-predictions', (req, res) => {
  try {
    checkPredictionOutcomes();
    res.json({ 
      message: "Predictions validated", 
      backtesting: tradeType1Data.backtesting,
      validatedCount: tradeType1Data.predictions.filter(p => p.outcome !== null).length
    });
  } catch (error) {
    console.error('❌ Validation error:', error.message);
    res.status(500).json({ error: "Validation failed", message: error.message });
  }
});

// HELPER FUNCTIONS
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
  const sellSignals = signals.filter(s => s === 'SELL').length;
  
  return {
    buySignals: buyCount,
    sellSignals: sellSignals,
    bullishWeight: `${((buyCount / signals.length) * 100).toFixed(1)}%`,
    bias: buyCount > sellSignals ? 'BULLISH' : buyCount < sellSignals ? 'BEARISH' : 'NEUTRAL'
  };
}

function calculateBasicTeslaMetrics(prediction) {
  const buySignals = [
    prediction.frequency37Hz === 'BUY' ? 1 : 0,
    prediction.frequency69Hz === 'BUY' ? 1 : 0, 
    prediction.frequency94Hz === 'BUY' ? 1 : 0
  ].reduce((a, b) => a + b, 0);
  
  const sellSignals = 3 - buySignals;
  
  return {
    buySignalsCount: buySignals,
    sellSignalsCount: sellSignals,
    bullishWeight: ((buySignals / 3) * 100).toFixed(1),
    marketBias: buySignals >= 2 ? 'BULLISH' : 'BEARISH',
    teslaStrengthLevel: prediction.electromagneticStrength > 70 ? 'HIGH' : 'MEDIUM'
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

function checkPredictionOutcomes() {
  try {
    const now = Date.now();
    const oneDayThreeHours = 1.3 * 24 * 60 * 60 * 1000; // 1.3 days in milliseconds
    
    if (!tradeType1Data || !tradeType1Data.predictions) {
      console.log('⚠️ No predictions data available for validation');
      return;
    }
    
    let validatedCount = 0;
    
    tradeType1Data.predictions.forEach(prediction => {
      // Only check predictions that are due and haven't been validated
      if (prediction.outcome === null && 
          (now - prediction.timestamp) >= oneDayThreeHours) {
        
        // Ensure prediction has required fields
        if (!prediction.currentPrice || !prediction.pricePrediction) {
          prediction.outcome = "invalid";
          prediction.accuracy = 0;
          return;
        }
        
        const priceDifference = Math.abs(prediction.currentPrice - prediction.pricePrediction);
        const toleranceRange = prediction.pricePrediction * 0.02; // 2% tolerance
        
        if (priceDifference <= toleranceRange) {
          prediction.outcome = "correct";
          prediction.accuracy = ((toleranceRange - priceDifference) / toleranceRange * 100).toFixed(1);
          tradeType1Data.backtesting.correctPredictions++;
        } else {
          prediction.outcome = "incorrect";
          prediction.accuracy = 0;
        }
        
        validatedCount++;
      }
    });
    
    // Recalculate overall accuracy
    const total = tradeType1Data.predictions.filter(p => p.outcome !== null).length;
    const correct = tradeType1Data.backtesting.correctPredictions;
    tradeType1Data.backtesting.accuracy = total > 0 ? ((correct / total) * 100).toFixed(2) : 0;
    
    if (validatedCount > 0) {
      console.log(`✅ Validated ${validatedCount} predictions. Overall accuracy: ${tradeType1Data.backtesting.accuracy}%`);
    }
    
  } catch (error) {
    console.error('❌ Error in checkPredictionOutcomes:', error.message);
  }
}

// SINGLE app.listen() - ALWAYS LAST!
app.listen(PORT, () => {
  console.log(`🚀 TRADE TYPE 1 Tesla webhook running on port ${PORT}`);
});

