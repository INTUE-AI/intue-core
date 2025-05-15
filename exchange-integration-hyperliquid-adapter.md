# Exchange Integration - Hyperliquid Adapter

## Hyperliquid Adapter

### Overview

The Hyperliquid Adapter provides a standardized interface to Hyperliquid's perpetual futures exchange, enabling INTUE agents to execute trades, manage perpetual positions, and access market data with minimal latency.

```javascript
javascriptconst hyperliquidAdapter = new HyperliquidAdapter({  apiKey: 'YOUR_API_KEY',  secretKey: 'YOUR_SECRET_KEY',  testnet: false  // Set to true for testing});
```

### Key Features

* **Zero Gas Fee Trading**: Leverage Hyperliquid's gas-free transaction model
* **Perpetual Futures Focus**: Specialized for derivatives trading with up to 50x leverage
* **Cross-Margin Support**: Unified margin across all positions
* **Sub-second Execution**: Optimized for high-frequency trading strategies
* **On-Chain Order Book**: Fully transparent and verifiable trade execution

### Setup and Configuration

#### Authentication

```javascript
javascript// Initialize with API credentialsconst hyperliquid = new HyperliquidAdapter({  apiKey: process.env.HYPERLIQUID_API_KEY,  secretKey: process.env.HYPERLIQUID_SECRET_KEY,  webSocketEnabled: true});// Test connectionconst status = await hyperliquid.getConnectionStatus();console.log(`Connected to Hyperliquid: ${status.connected}`);
```

#### Environment Configuration

The adapter supports both mainnet and testnet environments:

```javascript
javascript// For testnet (paper trading)const testHyperliquid = new HyperliquidAdapter({  apiKey: process.env.HYPERLIQUID_TESTNET_API_KEY,  secretKey: process.env.HYPERLIQUID_TESTNET_SECRET_KEY,  testnet: true});
```

### Core Functionality

#### Market Data

```javascript
javascript// Get available marketsconst markets = await hyperliquidAdapter.getMarkets();// Get current priceconst price = await hyperliquidAdapter.getCurrentPrice('BTC-PERP');// Get order bookconst orderBook = await hyperliquidAdapter.getOrderBook('ETH-PERP', 10);  // depth of 10// Get funding ratesconst fundingRates = await hyperliquidAdapter.getFundingRates();
```

#### Account Management

```javascript
javascript// Get account informationconst account = await hyperliquidAdapter.getAccountInfo();// Get available marginconst margin = await hyperliquidAdapter.getAvailableMargin();// Get account leverageconst leverage = await hyperliquidAdapter.getLeverage();// Set account leverageconst newLeverage = await hyperliquidAdapter.setLeverage(10);  // 10x
```

#### Position Management

```javascript
javascript// Get open positionsconst positions = await hyperliquidAdapter.getPositions();// Get position for specific assetconst ethPosition = await hyperliquidAdapter.getPosition('ETH-PERP');
```

#### Order Execution

```javascript
javascript// Execute perpetual tradeconst perpetualOrder = await hyperliquidAdapter.executePerpetrualTrade({  symbol: 'BTC-PERP',  side: 'BUY',  type: 'MARKET',  size: 0.1,  // BTC  leverage: 5  // 5x leverage});// Place limit orderconst limitOrder = await hyperliquidAdapter.placeOrder({  symbol: 'ETH-PERP',  side: 'SELL',  type: 'LIMIT',  size: 1.0,  price: 2500,  postOnly: true  // Ensure maker status});// Place stop lossconst stopLoss = await hyperliquidAdapter.placeOrder({  symbol: 'BTC-PERP',  side: 'SELL',  type: 'STOP_MARKET',  size: 0.1,  triggerPrice: 25000,  reduceOnly: true  // Only reduce position, don't flip});// Place take profitconst takeProfit = await hyperliquidAdapter.placeOrder({  symbol: 'BTC-PERP',  side: 'SELL',  type: 'LIMIT',  size: 0.1,  price: 30000,  reduceOnly: true});
```

#### Order Management

```javascript
javascript// Get open ordersconst openOrders = await hyperliquidAdapter.getOpenOrders();// Cancel orderconst cancelResult = await hyperliquidAdapter.cancelOrder({  symbol: 'ETH-PERP',  orderId: '123456789'});// Cancel all orders for a symbolconst cancelAllResult = await hyperliquidAdapter.cancelAllOrders('BTC-PERP');// Modify orderconst modifyResult = await hyperliquidAdapter.modifyOrder({  symbol: 'BTC-PERP',  orderId: '123456789',  newPrice: 26000});
```

#### Risk Management

```javascript
javascript// Close positionconst closeResult = await hyperliquidAdapter.closePosition({  symbol: 'BTC-PERP',  percentage: 100  // Close entire position});// Set cross-margin modeawait hyperliquidAdapter.setMarginMode('CROSS');// Set liquidation triggerawait hyperliquidAdapter.setLiquidationPriceAlert({  symbol: 'ETH-PERP',  threshold: 0.8  // Alert at 80% of liquidation price});
```

#### Advanced Order Types

```javascript
javascript// Trigger order with callbackconst callbackOrder = await hyperliquidAdapter.placeTriggerOrder({  symbol: 'BTC-PERP',  side: 'BUY',  size: 0.1,  triggerPrice: 28000,  callbackRate: 0.05  // 5% below trigger price});// Conditional order (One Cancels Other)const ocoOrder = await hyperliquidAdapter.placeOCOOrder({  symbol: 'ETH-PERP',  side: 'SELL',  size: 1.0,  price: 3000,       // Take profit  stopPrice: 2200,   // Stop loss  leverage: 5});
```

### Real-time Data Streaming

```javascript
javascript// Subscribe to price updateshyperliquidAdapter.listenPriceUpdates('BTC-PERP', (priceUpdate) => {  console.log(`New price for BTC: ${priceUpdate.price}`);});// Subscribe to order book updateshyperliquidAdapter.listenOrderBookUpdates('ETH-PERP', (orderBookUpdate) => {  console.log('Order book update:', orderBookUpdate);});// Subscribe to user data (positions, orders)hyperliquidAdapter.listenUserData({  positionCallback: (position) => {    console.log('Position update:', position);  },  orderCallback: (order) => {    console.log('Order update:', order);  },  marginCallback: (margin) => {    console.log('Margin update:', margin);  }});
```

### Performance Optimization

```javascript
javascript// Configure connection settings for high-frequency tradinghyperliquidAdapter.configureTradingMode({  priority: 'SPEED',  // SPEED, RELIABILITY, BALANCED  batchOrders: true,  connectionRedundancy: 2,  websocketHeartbeat: 5000  // ms});// Preload market data for faster accessawait hyperliquidAdapter.preloadMarketData(['BTC-PERP', 'ETH-PERP']);// Set dynamic execution parametershyperliquidAdapter.setExecutionParameters({  slippageTolerance: 0.0015,  // 0.15%  retryAttempts: 3,  orderExpiryMs: 10000});
```

### Error Handling

The adapter implements comprehensive error handling with specialized treatment for different error types:

```javascript
javascripttry {  const order = await hyperliquidAdapter.executePerpetrualTrade({    symbol: 'BTC-PERP',    side: 'BUY',    type: 'MARKET',    size: 0.1  });} catch (error) {  if (error.code === 'INSUFFICIENT_MARGIN') {    console.error('Not enough margin to execute trade');  } else if (error.code === 'PRICE_OUTSIDE_LIMIT') {    console.error('Price exceeds allowed slippage');  } else if (error.code === 'CONNECTION_ERROR') {    console.error('Connection issue, will retry automatically');  } else {    console.error('Error executing trade:', error.message);  }}
```

### Performance Metrics

The adapter maintains internal performance metrics:

* Average execution latency: 215ms
* Order success rate: 99.5%
* WebSocket reconnection rate: <0.02%
* Position update latency: 115ms (average)

```
```
