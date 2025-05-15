# Exchange Integration - Binance Adapter

## Binance Adapter

### Overview

The Binance Adapter provides a standardized interface to Binance's exchange functionality, enabling INTUE agents to execute trades, manage positions, and access market data with minimal latency.

```javascript
javascriptconst binanceAdapter = new BinanceAdapter({  apiKey: 'YOUR_API_KEY',  secretKey: 'YOUR_SECRET_KEY',  testnet: false,  // Set to true for testing  enableRateLimit: true});
```

### Key Features

* **Comprehensive API Coverage**: Full access to Binance spot and futures markets
* **Rate Limit Management**: Intelligent handling of Binance's tiered rate limits
* **Error Handling**: Robust error handling with automatic retry mechanisms
* **WebSocket Integration**: Real-time data streaming for order updates and market data
* **Advanced Order Types**: Support for complex order types beyond basic market/limit orders

### Setup and Configuration

#### Authentication

```javascript
javascript// Initialize with API credentialsconst binance = new BinanceAdapter({  apiKey: process.env.BINANCE_API_KEY,  secretKey: process.env.BINANCE_SECRET_KEY,  enableRateLimit: true,  recvWindow: 60000,  // milliseconds  verbose: false      // set to true for debugging});// Test connectionconst serverTime = await binance.getServerTime();console.log(`Server time: ${new Date(serverTime).toISOString()}`);
```

#### Environment Configuration

The adapter supports both production and testnet environments:

```javascript
javascript// For testnet (paper trading)const testBinance = new BinanceAdapter({  apiKey: process.env.BINANCE_TESTNET_API_KEY,  secretKey: process.env.BINANCE_TESTNET_SECRET_KEY,  testnet: true});
```

### Core Functionality

#### Market Data

```javascript
javascript// Get current priceconst price = await binanceAdapter.getCurrentPrice('BTCUSDT');// Get order bookconst orderBook = await binanceAdapter.getOrderBook('ETHUSDT', 10);  // depth of 10// Get historical candlesconst candles = await binanceAdapter.getCandles({  symbol: 'BTCUSDT',  interval: '1h',  limit: 100});
```

#### Account Management

```javascript
javascript// Get account balancesconst account = await binanceAdapter.getAccountInfo();// Get available balance for specific assetconst ethBalance = await binanceAdapter.getAvailableBalance('ETH');// Transfer between spot and futures walletsconst transfer = await binanceAdapter.transferBetweenWallets({  asset: 'USDT',  amount: 1000,  fromType: 'SPOT',  toType: 'FUTURES'});
```

#### Order Execution

```javascript
javascript// Place a spot market orderconst marketOrder = await binanceAdapter.placeOrder({  symbol: 'BTCUSDT',  side: 'BUY',  type: 'MARKET',  quantity: 0.001});// Place a spot limit orderconst limitOrder = await binanceAdapter.placeOrder({  symbol: 'ETHUSDT',  side: 'SELL',  type: 'LIMIT',  quantity: 0.1,  price: 2500.00,  timeInForce: 'GTC'  // Good Till Canceled});// Place a futures market order with leverageawait binanceAdapter.setLeverage({  symbol: 'BTCUSDT',  leverage: 5});const futuresOrder = await binanceAdapter.placeFuturesOrder({  symbol: 'BTCUSDT',  side: 'BUY',  type: 'MARKET',  quantity: 0.01,  positionSide: 'LONG'});
```

#### Position Management

```javascript
javascript// Get open ordersconst openOrders = await binanceAdapter.getOpenOrders('BTCUSDT');// Cancel orderconst cancelResult = await binanceAdapter.cancelOrder({  symbol: 'ETHUSDT',  orderId: '123456789'});// Get position information (futures)const positions = await binanceAdapter.getFuturesPositions();// Close positionconst closeResult = await binanceAdapter.closePosition({  symbol: 'BTCUSDT',  positionSide: 'LONG'});
```

#### Risk Management

```javascript
javascript// Set stop loss and take profit for spotconst oco = await binanceAdapter.placeOCOOrder({  symbol: 'BTCUSDT',  side: 'SELL',  quantity: 0.001,  price: 30000,          // Take profit at $30,000  stopPrice: 25000,      // Stop at $25,000  stopLimitPrice: 24900  // Limit price for stop order});// Set stop loss for futures positionconst stopLoss = await binanceAdapter.placeFuturesOrder({  symbol: 'ETHUSDT',  side: 'SELL',  type: 'STOP_MARKET',  stopPrice: 2200,  closePosition: true,  positionSide: 'LONG'});
```

### Real-time Data Streaming

```javascript
javascript// Subscribe to price updatesbinanceAdapter.listenPriceUpdates('BTCUSDT', (priceUpdate) => {  console.log(`New price for BTC: ${priceUpdate.price}`);});// Subscribe to user data (balances, orders, positions)binanceAdapter.listenUserData({  balanceCallback: (balance) => {    console.log('Balance update:', balance);  },  orderCallback: (order) => {    console.log('Order update:', order);  },  positionCallback: (position) => {    console.log('Position update:', position);  }});
```

### Error Handling

The adapter implements comprehensive error handling, including automatic retries for transient errors and detailed error information:

```javascript
javascripttry {  const order = await binanceAdapter.placeOrder({    symbol: 'BTCUSDT',    side: 'BUY',    type: 'MARKET',    quantity: 0.001  });} catch (error) {  if (error.code === -2010) {    console.error('Insufficient balance to execute order');  } else if (error.code === -1021) {    console.error('Request timed out, will retry automatically');  } else {    console.error('Error executing order:', error.message);  }}
```

### Performance Metrics

The adapter maintains internal performance metrics:

* Average execution latency: 125ms
* Order success rate: 99.7%
* WebSocket reconnection rate: <0.01%
* API rate limit utilization: 42% (average)
