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

// CRITICAL: MISSING MAIN DATA ENDPOINT
app.get('/trade-type-1-data', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(tradeType1Data);
  } catch (error) {
    console.error('❌ Trade-type-1-data error:', error.message);
    res.status(500).json({ error: "Data access error" });
  }
});

// Tesla percentage endpoint
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

// SINGLE Debug endpoint (remove duplicates)
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
      rawDataStructure: Object.keys(tradeType1Data || {}),
      lastAlert: 'Enhanced Tesla processing active'
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

// Validation endpoint
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

// Enhanced backtesting results
app.get('/backtesting-results', (req, res) => {
  try {
    const results = {
      tradeType: "TRADE TYPE 1 - Enhanced Tesla Predictions",
      totalPredictions: tradeType1Data.backtesting.totalPredictions,
      accuracy: calculateAccuracy(),
      recentPredictions: tradeType1Data.predictions.slice(-10).map(pred => ({
        timestamp: pred.timestamp,
        alertTime: formatTimestamp(pred.timestamp),
        symbol: pred.symbol,
        currentPrice: `$${pred.currentPrice.toFixed(2)}`,
        timePrediction: pred.timePrediction,
        pricePrediction: `$${pred.pricePrediction.toFixed(2)}`,
        electromagneticStrength: `${pred.electromagneticStrength.toFixed(2)}`,
        frequency37Hz: pred.frequency37Hz,
        frequency69Hz: pred.frequency69Hz,
        frequency94Hz: pred.frequency94Hz,
        outcome: pred.outcome,
        accuracy: pred.accuracy
      })),
      systemStatus: "Enhanced Tesla processing operational"
    };
    
    res.json(results);
  } catch (error) {
    console.error('❌ Backtesting results error:', error.message);
    res.status(500).json({ error: "Backtesting error", message: error.message });
  }
});

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
      electromagneticStrength: pred.electromagneticStrength,
      frequency37Hz: pred.frequency37Hz,
      frequency69Hz: pred.frequency69Hz,
      frequency94Hz: pred.frequency94Hz,
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

// HELPER FUNCTIONS
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

function checkPredictionOutcomes() {
  try {
    const now = Date.now();
    const oneDayThreeHours = 1.3 * 24 * 60 * 60 * 1000;
    
    if (!tradeType1Data || !tradeType1Data.predictions) {
      console.log('⚠️ No predictions data available for validation');
      return;
    }
    
    let validatedCount = 0;
    
    tradeType1Data.predictions.forEach(prediction => {
      if (prediction.outcome === null && 
          (now - prediction.timestamp) >= oneDayThreeHours) {
        
        if (!prediction.currentPrice || !prediction.pricePrediction) {
          prediction.outcome = "invalid";
          prediction.accuracy = 0;
          return;
        }
        
        const priceDifference = Math.abs(prediction.currentPrice - prediction.pricePrediction);
        const toleranceRange = prediction.pricePrediction * 0.02;
        
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
  console.log(`🚀 ENHANCED Tesla webhook running on port ${PORT}`);
});
