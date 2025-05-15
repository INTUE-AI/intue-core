# Pagination

For endpoints returning large result sets, pagination is supported:

```javascript
javascript// Get paginated signal historyconst signalHistoryPage1 = await agent.getSignalHistory({  timeframe: '90d',  limit: 50,  offset: 0});const signalHistoryPage2 = await agent.getSignalHistory({  timeframe: '90d',  limit: 50,  offset: 50});// Alternative cursor-based paginationconst signalHistoryNext = await agent.getSignalHistory({  timeframe: '90d',  limit: 50,  cursor: signalHistoryPage1.nextCursor});
```

### Websocket Streams

For real-time updates, use WebSocket connections:

```javascript
javascript// Subscribe to real-time signal updatesconst signalStream = agent.subscribeToSignals({  assets: ['BTC', 'ETH', 'SOL'],  minimumConfidence: 0.7});signalStream.on('signal', (signal) => {  console.log('New signal received:', signal);});// Subscribe to position updatesconst positionStream = agent.subscribeToPositions();positionStream.on('position', (position) => {  console.log('Position update:', position);});// Handle connection issuessignalStream.on('error', (error) => {  console.error('Signal stream error:', error);});// Close streams when donesignalStream.close();positionStream.close();
```

```
```
