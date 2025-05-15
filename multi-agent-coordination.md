# Multi-Agent Coordination

// Message structure\
interface SwarmMessage {\
from: string; // Source agent ID\
to: string | 'all'; // Target agent ID or broadcast\
type: MessageType; // Signal, query, response, consensus\
data: any; // Message content\
confidence: number; // Confidence level (0-1)\
timestamp: number; // Message creation time\
correlationId?: string; // For message threading\
ttl?: number; // Time-to-live (hops)\
}

// Send a message between agents\
function sendAgentMessage(fromAgent, toAgent, messageType, data, confidence) {\
const message = {\
from: fromAgent.id,\
to: toAgent.id,\
type: messageType,\
data: data,\
confidence: confidence,\
timestamp: Date.now(),\
correlationId: generateCorrelationId()\
};

// Log message for debugging\
logger.debug('Agent message sent', {\
from: fromAgent.id,\
to: toAgent.id,\
type: messageType,\
confidence\
});

// Deliver message to target agent\
return messageRouter.route(message);\
}

// Example usage\
const queryResponse = await sendAgentMessage(\
momentumAgent,\
sentimentAgent,\
'QUERY',\
{ asset: 'BTC', timeframe: '4h', signalType: 'sentiment\_score' },\
0.9\
);
