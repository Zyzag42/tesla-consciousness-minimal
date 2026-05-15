// Tesla Consciousness WebSocket Connection Manager
import WebSocket from 'ws';
import EventEmitter from 'events';

export class WebSocketManager extends EventEmitter {
  constructor() {
    super();
    this.connections = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 5000;
  }

  async createConnection(name, url, options = {}) {
    console.log(`🔌 Creating WebSocket connection: ${name}`);
    
    try {
      const ws = new WebSocket(url, options);
      
      ws.on('open', () => {
        console.log(`✅ WebSocket connected: ${name}`);
        this.reconnectAttempts = 0;
        this.emit('connected', name);
      });

      ws.on('message', (data) => {
        try {
          const parsedData = JSON.parse(data);
          this.emit('data', name, parsedData);
        } catch (error) {
          console.log(`❌ Error parsing WebSocket data from ${name}:`, error);
        }
      });

      ws.on('close', () => {
        console.log(`❌ WebSocket disconnected: ${name}`);
        this.emit('disconnected', name);
        this.handleReconnection(name, url, options);
      });

      ws.on('error', (error) => {
        console.log(`❌ WebSocket error from ${name}:`, error.message);
        this.emit('error', name, error);
      });

      this.connections.set(name, ws);
      return ws;
      
    } catch (error) {
      console.log(`❌ Failed to create WebSocket connection ${name}:`, error);
      throw error;
    }
  }

  async handleReconnection(name, url, options) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect ${name} (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.createConnection(name, url, options);
      }, this.reconnectDelay);
    } else {
      console.log(`❌ Max reconnection attempts reached for ${name}`);
      this.emit('maxReconnectAttemptsReached', name);
    }
  }

  sendMessage(connectionName, message) {
    const ws = this.connections.get(connectionName);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      return true;
    } else {
      console.log(`❌ Cannot send message: ${connectionName} not connected`);
      return false;
    }
  }

  closeConnection(connectionName) {
    const ws = this.connections.get(connectionName);
    if (ws) {
      ws.close();
      this.connections.delete(connectionName);
      console.log(`🔌 Closed connection: ${connectionName}`);
    }
  }

  closeAllConnections() {
    console.log("🔌 Closing all WebSocket connections...");
    for (const [name, ws] of this.connections) {
      ws.close();
    }
    this.connections.clear();
  }

  getConnectionStatus(connectionName) {
    const ws = this.connections.get(connectionName);
    if (!ws) return 'not_created';
    
    switch (ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'open';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'closed';
      default: return 'unknown';
    }
  }
}

export default WebSocketManager;
