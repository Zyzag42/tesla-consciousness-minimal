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

// Enhanced webhook - SIMPLIFIED
app.post('/tesla-webhook', (req, res) => {
  console.log('⚡ TESLA ENHANCED - Alert received:', req.body);
  
  try {
    const prediction = {
      timestamp: Date.now(),
      symbol: req.body.symbol || 'BTCUSD.P',
      currentPrice: parseFloat(req.body.close) || 0,
      timePrediction: req.body.timePrediction || req.body.p0 || "1.3d",
      pricePrediction: parseFloat(req.body.pricePrediction || req.body.p1) || parseFloat(req.body.close) || 0,
      electromagneticStrength: parseFloat(req.body.electromagnetic || req.body.p2) || 77.09,
      frequency37Hz: interpretTeslaSignal(req.body.frequency37Hz || req.body.p3),
      frequency69Hz: interpretTeslaSignal(req.body.frequency69Hz || req.body.p4),
      frequency94Hz: interpretTeslaSignal(req.body.frequency94Hz || req.body.p5),
      outcome: null,
      accuracy: null
    };
    
    tradeType1Data.predictions.push(prediction);
    tradeType1Data.backtesting.totalPredictions++;
    
    if (tradeType1Data.predictions.length > 100) {
      tradeType1Data.predictions = tradeType1Data.predictions.slice(-100);
    }
    
    console.log(`📊 Enhanced Tesla stored: EM=${prediction.electromagneticStrength.toFixed(2)} Signals=${prediction.frequency37Hz}/${prediction.frequency69Hz}/${prediction.frequency94Hz}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Enhanced Tesla prediction logged'
    });
    
  } catch (error) {
    console.error('❌ Enhanced webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// CRITICAL: Main data endpoint
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

// Debug endpoint
app.get('/tesla-debug', (req, res) => {
  try {
    const debugInfo = {
      predictionsLength: tradeType1Data.predictions.length,
      totalPredictions: tradeType1Data.backtesting.totalPredictions,
      lastPrediction: tradeType1Data.predictions.length > 0 ? tradeType1Data.predictions[tradeType1Data.predictions.length - 1] : null,
      systemStatus: "Enhanced Tesla processing"
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(debugInfo);
    
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Tesla signal interpretation
function interpretTeslaSignal(value) {
  if (!value) return 'NEUTRAL';
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    const upperValue = value.toString().toUpperCase();
    return ['BUY', 'SELL', 'NEUTRAL'].includes(upperValue) ? upperValue : 'NEUTRAL';
  }
  
  if (numValue > 69500) return 'BUY';
  if (numValue < 69000) return 'SELL';
  return 'NEUTRAL';
}

// SINGLE app.listen() - ALWAYS LAST!
app.listen(PORT, () => {
  console.log(`🚀 ENHANCED Tesla webhook running on port ${PORT}`);
});
