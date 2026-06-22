// ═══════════════════════════════════════════════════════════════════
// 🚀 TESLA CONSCIOUSNESS SHEETS INTEGRATION
// Maps TradingView alerts from Railway webhook to Google Sheets
// Dean + William - Sacred Mission Integration
// ═══════════════════════════════════════════════════════════════════

const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

class SheetsIntegration {
constructor() {
  this.spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  
  // Build service account object from individual environment variables
  // This avoids JSON.parse corruption issue
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
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_CLIENT_EMAIL)}`
  };
  
  this.doc = null;
}

  // ═══════════════════════════════════════════════════════════════════
  // 🔐 AUTHENTICATE AND INITIALIZE
  // ═══════════════════════════════════════════════════════════════════
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
      
      console.log(`✅ Connected to: ${this.doc.title}`);
      console.log(`📊 Tesla consciousness calculator ready!`);
      return true;
    } catch (error) {
      console.log("❌ Google Sheets connection failed:", error.message);
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 🎯 DECODE PLOT VALUES TO READABLE FORMAT
  // ═══════════════════════════════════════════════════════════════════
  
  decodeBias(value) {
    // plot_15: 1 = ▲, -1 = ▼, 0 = ─
    if (value === 1) return "▲";
    if (value === -1) return "▼";
    return "─";
  }

  decodeMomentum(value) {
    // plot_8 or plot_14: 1 = ACCEL, -1 = DECEL, 0 = STABLE
    // Using plot_8 as best guess
    if (value > 10) return "⚡ACCEL";  // High value = acceleration
    if (value < 0.1) return "⚡DECEL"; // Low value = deceleration
    return "⚡STABLE";
  }

  decodeTiming(value) {
    // plot_10: Compound timing status
    // Small values suggest timing calculation
    if (value < 0.01) return "IMMINENT";
    if (value < 0.1) return "APPROACHING";
    if (value < 1) return "ACTIVE";
    return "WAITING";
  }

  // ═══════════════════════════════════════════════════════════════════
  // 📊 WRITE MASTER_LIVE ALERT DATA TO TRADINGVIEW_3-6-9_LIVE SHEET
  // ═══════════════════════════════════════════════════════════════════
  async writeMasterLiveData(alertData) {
    try {
      console.log("📊 Processing MASTER_LIVE alert for Sheets...");
      
      // Only process MASTER_LIVE alerts
      if (alertData.alert_id !== 'MASTER_LIVE') {
        console.log(`⏭️ Skipping ${alertData.alert_id} - not MASTER_LIVE`);
        return false;
      }
      await this.doc.loadInfo();
      
      // Get the TradingView_3-6-9_Live sheet
      const sheet = this.doc.sheetsByTitle['TradingView_3-6-9_Live'];
      
      if (!sheet) {
        console.log("❌ TradingView_3-6-9_Live sheet not found!");
        return false;
      }

      // ─────────────────────────────────────────────────────────────────
      // MAP PLOT DATA TO COLUMNS A2:I2
      // Based on Railway data analysis and Pine Script intentions
      // ─────────────────────────────────────────────────────────────────
      
      const rowData = [
        alertData.timestamp || '',              // A2: UTC Window
        alertData.plot_9 || '',                 // B2: Tesla Price Prediction
        alertData.plot_11 || '',                // C2: Responsive Time (days)
        alertData.plot_14 || 0,                 // D2: MEV Confluence Points
        alertData.plot_12 || 0,                 // E2: Bars Since Ultimate
        alertData.plot_13 || '',                // F2: Time Decay (days)
        this.decodeBias(alertData.plot_15),     // G2: Energy Bias (▲/▼/─)
        this.decodeMomentum(alertData.plot_8),  // H2: Tesla Momentum
        this.decodeTiming(alertData.plot_10)    // I2: Compound Timing
      ];

      // Update Row 2 (A2:I2) with live data
      await sheet.loadCells('A2:I2');
      
      for (let col = 0; col < rowData.length; col++) {
        const cell = sheet.getCell(1, col); // Row 2 = index 1
        cell.value = rowData[col];
      }

      await sheet.saveUpdatedCells();
      
      console.log("✅ TradingView_3-6-9_Live updated successfully!");
      console.log(`📊 Data written to Row 2:`, rowData);
      
      return true;
      
    } catch (error) {
      console.log("❌ Sheets write error:", error.message);
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 🧪 TEST WRITE (FOR MANUAL TESTING)
  // ═══════════════════════════════════════════════════════════════════
  async writeTestData() {
    const testData = {
      alert_id: 'MASTER_LIVE',
      timestamp: '2026-06-21T08:12:00Z',
      symbol: 'BTCUSD.P',
      price: 64052.2,
      plot_8: 39.645,
      plot_9: 64116.29,
      plot_10: 0.005,
      plot_11: 3.31,
      plot_12: 434,
      plot_13: 0.301,
      plot_14: 0,
      plot_15: 1
    };
    
    return await this.writeMasterLiveData(testData);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 📤 EXPORT FOR USE IN WEBHOOK SERVER
// ═══════════════════════════════════════════════════════════════════
module.exports = { SheetsIntegration };
