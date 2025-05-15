# Error Handling

The API uses standard HTTP status codes and provides detailed error objects:

```javascript
javascripttry {  const signals = await agent.process();} catch (error) {  console.error('Error processing market data:', error);    if (error.code === 'MARKET_DATA_UNAVAILABLE') {    // Handle market data unavailability  } else if (error.code === 'CONFIGURATION_INVALID') {    // Handle configuration issue  } else if (error.code === 'RATE_LIMIT_EXCEEDED') {    // Handle rate limiting  }}
```

#### Common Error Codes

```
AUTHENTICATION_FAILEDAPI key invalid or expiredINSUFFICIENT_PERMISSIONSLacking permissions for requested operationRATE_LIMIT_EXCEEDEDAPI rate limit exceededMARKET_DATA_UNAVAILABLERequired market data not availableCONFIGURATION_INVALIDAgent configuration invalidAGENT_INITIALIZATION_FAILEDFailed to initialize agentTRADING_DISABLEDTrading functionality not enabledEXCHANGE_ERRORError communicating with exchangeINSUFFICIENT_FUNDSInsufficient funds for trade execution
```

###
