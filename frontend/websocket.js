class WebSocketClient {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
  }
  
  connect() {
    this.ws = new WebSocket('ws://localhost:8080');
    
    this.ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      
      // Обрабатываем разные типы обновлений
      switch(type) {
        case 'order_created':
          // Обновить список заказов
          break;
        case 'stock_updated':
          // Обновить остатки
          break;
        case 'balance_changed':
          // Обновить баланс
          break;
      }
    };
  }
  
  send(type, data) {
    if (this.ws?.readyState === 1) {
      this.ws.send(JSON.stringify({ type, data }));
    }
  }
}

export default new WebSocketClient();