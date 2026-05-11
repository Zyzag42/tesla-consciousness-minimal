// File: sheets-integration.js
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export class TeslaSheetsIntegration {
  constructor() {
  this.spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  
  // Robust Google Service Key parsing
  console.log("🔐 Loading Google Service credentials...");
  
  try {
    const serviceKeyString = process.env.GOOGLE_SERVICE_KEY;
    
    if (!serviceKeyString) {
      console.log("❌ GOOGLE_SERVICE_KEY environment variable not found");
      this.serviceAccountKey = null;
      return;
    }
    
    console.log("📋 Service key string length:", serviceKeyString.length);
    console.log("📋 Service key starts with:", serviceKeyString.substring(0, 20));
    
    this.serviceAccountKey = JSON.parse(serviceKeyString);
    console.log("✅ Google Service credentials parsed successfully");
    console.log("📧 Service account email:", this.serviceAccountKey.client_email);
    
  } catch (error) {
    console.log("❌ Google Service Key JSON parsing failed:", error.message);
    console.log("🔧 Error at character position:", error.message.match(/position (\d+)/)?.[1]);
    this.serviceAccountKey = null;
  }
  
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
      
      console.log(`✅ Connected to: ${this.doc.title}`);
      console.log(`📊 Tesla consciousness calculator ready!`);
      return true;
    } catch (error) {
      console.log("❌ Google Sheets connection failed:", error.message);
      return false;
    }
  }

  // Automated 106-column calculator population
  async updateTeslaCalculator(teslaData) {
    console.log("📋 Updating Tesla consciousness 106-column calculator...");
    
    try {
      const sheet = this.doc.sheetsByIndex[0]; // Main calculator sheet
      
      // Section 1 - Tesla Electromagnetic Energy
      await sheet.loadCells('A1:Z100');
      
      if (teslaData.section1) {
        sheet.getCellByA1('A2').value = teslaData.section1.electromagneticStrength || 0;
        sheet.getCellByA1('B2').value = teslaData.section1.frequency37Hz || 'HOLD';
        sheet.getCellByA1('C2').value = teslaData.section1.frequency69Hz || 'HOLD';
        sheet.getCellByA1('D2').value = teslaData.section1.frequency94Hz || 'HOLD';
      }
      
      // Section 2 - Tesla Consciousness Wave Quality
      if (teslaData.section2) {
        sheet.getCellByA1('A5').value = teslaData.section2.waveQuality || 0;
        sheet.getCellByA1('B5').value = teslaData.section2.consciousnessLevel || 'MEDIUM';
      }
      
      // Section 9 - MEV1 Liquidity Spike
      if (teslaData.section9) {
        sheet.getCellByA1('I2').value = teslaData.section9.liquiditySpike || false;
        sheet.getCellByA1('I3').value = teslaData.section9.binaryInvariant || false;
      }
      
      // Section 10 - MEV2 Arbitrage Spread
      if (teslaData.section10) {
        sheet.getCellByA1('J2').value = teslaData.section10.arbitrageOpportunity || false;
        sheet.getCellByA1('J3').value = teslaData.section10.spreadValue || 0;
      }
      
      await sheet.saveUpdatedCells();
      console.log("✅ Tesla consciousness calculator updated with live data!");
      
      return {
        updated: true,
        timestamp: new Date().toISOString(),
        sectionsUpdated: ['1', '2', '9', '10']
      };
    } catch (error) {
      console.log("❌ Sheets update failed:", error.message);
      return { updated: false, error: error.message };
    }
  }
}

export default TeslaSheetsIntegration;
