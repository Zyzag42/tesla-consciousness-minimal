// ═══════════════════════════════════════════════════════════════════
// 🚀 TESLA CONSCIOUSNESS SHEETS INTEGRATION
// Maps TradingView alerts from Railway webhook to Google Sheets
// Dean + William - Sacred Mission Integration
// ═══════════════════════════════════════════════════════════════════

const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

class SheetsIntegration {
  constructor() {
  console.log('═══════════════════════════════════════');
  console.log('🔍 SHEETS INTEGRATION CONSTRUCTOR DEBUG');
  console.log('═══════════════════════════════════════');
  
  this.spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  console.log('📋 GOOGLE_SHEETS_ID:', this.spreadsheetId ? '✅ PRESENT' : '❌ MISSING');
  
  // Try base64-encoded service account first (recommended method)
  const base64Key = process.env.GOOGLE_SERVICE_KEY_BASE64;
  
  if (base64Key) {
    console.log('🔑 Loading service account from BASE64...');
    console.log('   BASE64 length:', base64Key.length, 'characters');
    
    try {
      // Decode base64 to JSON string
      const jsonString = Buffer.from(base64Key, 'base64').toString('utf8');
      console.log('   Decoded JSON length:', jsonString.length, 'characters');
      
      // Parse JSON to object
      this.serviceAccountKey = JSON.parse(jsonString);
      
      console.log('✅ Service account loaded from BASE64 successfully!');
      console.log('   type:', this.serviceAccountKey.type);
      console.log('   project_id:', this.serviceAccountKey.project_id);
      console.log('   client_email:', this.serviceAccountKey.client_email);
      console.log('   private_key present:', this.serviceAccountKey.private_key ? 'YES' : 'NO');
      console.log('   private_key length:', this.serviceAccountKey.private_key ? this.serviceAccountKey.private_key.length : 0);
      
    } catch (error) {
      console.log('❌ BASE64 decode failed:', error.message);
      console.log('❌ Error stack:', error.stack);
      this.serviceAccountKey = null;
    }
    
  } else {
    console.log('⚠️ GOOGLE_SERVICE_KEY_BASE64 not found');
    console.log('   Falling back to individual variables...');
    
    // Fallback to individual variables
    this.serviceAccountKey = {
      type: "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID || "tesla-consciousness-sheets2",
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_CLIENT_EMAIL || "")}`
    };
    
    console.log('   project_id:', this.serviceAccountKey.project_id);
    console.log('   client_email:', this.serviceAccountKey.client_email);
    console.log('   private_key present:', this.serviceAccountKey.private_key ? 'YES' : 'NO');
  }
  
  console.log('═══════════════════════════════════════\n');
  this.doc = null;
}

  async initialize() {
    console.log("🔐 Authenticating Tesla consciousness Sheets access...");
    
    try {
      const serviceAccount = new JWT({
        email: this.serviceAccountKey.client_email,
        key: this.serviceAccountKey.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.doc = new GoogleSpreadsheet(this.spreadsheetId, serviceAccount);
      await this.doc.loadInfo();
      
      console.log("✅ Connected to: " + this.doc.title);
      console.log("📊 Tesla consciousness calculator ready!");
      return true;
    } catch (error) {
      console.log("❌ Google Sheets connection failed:", error.message);
      return false;
    }
  }

  decodeBias(value) {
    if (value === 1) return "▲";
    if (value === -1) return "▼";
    return "─";
  }

  decodeMomentum(value) {
    if (value > 10) return "⚡ACCEL";
    if (value < 0.1) return "⚡DECEL";
    return "⚡STABLE";
  }

  decodeTiming(value) {
    if (value < 0.01) return "IMMINENT";
    if (value < 0.1) return "APPROACHING";
    if (value < 1) return "ACTIVE";
    return "WAITING";
  }

  async writeMasterLiveData(alertData) {
  try {
    console.log("📊 Processing MASTER_LIVE alert for Sheets...");
    
    if (alertData.alert_id !== 'MASTER_LIVE') {
      console.log("⏭️ Skipping " + alertData.alert_id + " - not MASTER_LIVE");
      return false;
    }

    await this.doc.loadInfo();

    const sheet = this.doc.sheetsByTitle['TradingView_3_6_9_Live'];
    
    if (!sheet) {
      console.log("❌ TradingView_3_6_9_Live sheet not found!");
      return false;
    }

    // Map PLOT data to columns A:L (12 columns)
    const rowData = [
      alertData.timestamp || '',              // A: UTC Window
      alertData.plot_9 || '',                 // B: Tesla Price Prediction
      alertData.plot_11 || '',                // C: Responsive Time (days)
      alertData.plot_14 || 0,                 // D: MEV Confluence Points
      alertData.plot_12 || 0,                 // E: Bars Since Event
      alertData.plot_13 || '',                // F: Time Decay (days)
      this.decodeBias(alertData.plot_15),     // G: Energy Bias
      this.decodeMomentum(alertData.plot_8),  // H: Tesla Momentum
      this.decodeTiming(alertData.plot_10),   // I: Compound Timing (COMMA ADDED!)
      alertData.sine_37 || 0,                 // J: 37Hz Sine Wave
      alertData.sine_69 || 0,                 // K: 69Hz Sine Wave
      alertData.sine_94 || 0                  // L: 94Hz Sine Wave (no comma - last item)
    ];

    // Load cells for Row 2 and historical rows (track last 50 alerts)
    const maxHistoryRows = 50;
    await sheet.loadCells(`A2:L${maxHistoryRows + 2}`);

    // Shift existing data down by one row (newest at top)
    for (let row = maxHistoryRows; row >= 2; row--) {
      for (let col = 0; col < 12; col++) {  // 12 columns (A through L)
        const sourceCell = sheet.getCell(row - 1, col);
        const targetCell = sheet.getCell(row, col);
        targetCell.value = sourceCell.value;
      }
    }

    // Write new data to Row 2
    for (let col = 0; col < rowData.length; col++) {
      const cell = sheet.getCell(1, col);
      cell.value = rowData[col];
    }

    // Save all updated cells
    await sheet.saveUpdatedCells();
    
    console.log("✅ TradingView_3_6_9_Live updated successfully!");
    console.log("📊 New data inserted at Row 2, historical data shifted down");
    console.log("📊 Latest data (12 columns):", rowData);
    
    return true;
    
  } catch (error) {
    console.log("❌ Sheets write error:", error.message);
    console.log("Error details:", error);
    return false;
  }
}

async writeTestData() {
  const testData = {
    alert_id: 'MASTER_LIVE',
    timestamp: '2026-06-23T08:00:00Z',
    symbol: 'BTCUSD.P',
    price: 65000,
    plot_8: 100,
    plot_9: 65100,
    plot_10: 0.005,
    plot_11: 3.5,
    plot_12: 456,
    plot_13: 0.5,
    plot_14: 0,
    plot_15: 1,
    sine_37: 62500,
    sine_69: 62450,
    sine_94: 62550
  };
  
  return await this.writeMasterLiveData(testData);
}
