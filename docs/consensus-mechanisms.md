# Consensus Mechanisms

The swarm employs multiple consensus strategies:

**Weighted Voting**

```javascript
javascript// Weighted voting consensusfunction weightedVotingConsensus(signals, weights) {  const tally = {};    // Initialize tally for each asset and direction  signals.forEach(signal => {    const key = `${signal.asset}-${signal.direction}`;    if (!tally[key]) {      tally[key] = {        asset: signal.asset,        direction: signal.direction,        weightedConfidence: 0,        votes: 0,        signals: []      };    }  });    // Add weighted votes  signals.forEach(signal => {    const key = `${signal.asset}-${signal.direction}`;    const agentWeight = weights[signal.agentId] || 1;        tally[key].weightedConfidence += signal.confidence * agentWeight;    tally[key].votes += 1;    tally[key].signals.push(signal);  });    // Calculate final confidence scores and sort by strength  const results = Object.values(tally).map(result => {    return {      ...result,      consensusConfidence: result.weightedConfidence /         result.signals.reduce((sum, signal) => sum + weights[signal.agentId], 0)    };  });    // Sort by consensus confidence  return results.sort((a, b) => b.consensusConfidence - a.consensusConfidence);}// Example usageconst consensusResults = weightedVotingConsensus(allAgentSignals, agentWeights);console.log('Consensus results:', consensusResults);
```

**Bayesian Aggregation**

```javascript
javascript// Bayesian signal aggregationfunction bayesianAggregation(signals) {  const aggregatedResults = {};    // Group signals by asset  signals.forEach(signal => {    if (!aggregatedResults[signal.asset]) {      aggregatedResults[signal.asset] = {        asset: signal.asset,        priorUp: 0.5, // Initial prior probability (neutral)        priorDown: 0.5,        posteriorUp: 0.5,        posteriorDown: 0.5,        signals: []      };    }        aggregatedResults[signal.asset].signals.push(signal);  });    // Apply Bayesian update for each asset  Object.values(aggregatedResults).forEach(result => {    result.signals.forEach(signal => {      // Adjust signal confidence based on historical accuracy      const adjustedConfidence = signal.confidence * signal.agentAccuracy;            if (signal.direction === 'up') {        // Update posterior probability for upward movement        result.posteriorUp = updateBayesianProbability(          result.posteriorUp,           adjustedConfidence        );        result.posteriorDown = 1 - result.posteriorUp;      } else {        // Update posterior probability for downward movement        result.posteriorDown = updateBayesianProbability(          result.posteriorDown,           adjustedConfidence        );        result.posteriorUp = 1 - result.posteriorDown;      }    });        // Determine consensus direction and confidence    if (result.posteriorUp > result.posteriorDown) {      result.consensusDirection = 'up';      result.consensusConfidence = result.posteriorUp;    } else {      result.consensusDirection = 'down';      result.consensusConfidence = result.posteriorDown;    }  });    return Object.values(aggregatedResults);}// Bayesian probability updatefunction updateBayesianProbability(prior, likelihood) {  // P(A|B) = (P(B|A) * P(A)) / P(B)  // Simplified Bayesian update for binary hypothesis  const posterior = (likelihood * prior) /     (likelihood * prior + (1 - likelihood) * (1 - prior));    return posterior;}
```

### Collective Decision Making

#### Signal Composition

```javascript
javascript// Compose signals from multiple agentsasync function composeSwarmSignals(swarm, marketData) {  // Collect signals from all agents  const agentSignals = [];    for (const agent of swarm.getAgents()) {    const signals = await agent.process(marketData);        // Annotate signals with agent information    const annotatedSignals = signals.map(signal => ({      ...signal,      agentId: agent.getId(),      agentType: agent.getType(),      agentAccuracy: agent.getHistoricalAccuracy()    }));        agentSignals.push(...annotatedSignals);  }    // Group signals by asset  const signalsByAsset = groupBy(agentSignals, 'asset');    // Apply consensus mechanism to each asset group  const consensusResults = {};    for (const [asset, signals] of Object.entries(signalsByAsset)) {    consensusResults[asset] = swarm.applyConsensus(signals);  }    return {    rawSignals: agentSignals,    consensusResults  };}// Example usageconst swarmAnalysis = await composeSwarmSignals(marketSwarm, currentMarketData);console.log('Swarm consensus:', swarmAnalysis.consensusResults);
```

#### Decision Refinement

```javascript
javascript// Refine decisions through agent interactionasync function refineSwarmDecision(swarm, initialConsensus, refinementRounds = 3) {  let currentConsensus = initialConsensus;    // Perform multiple rounds of refinement  for (let round = 0; round < refinementRounds; round++) {    console.log(`Refinement round ${round + 1}`);        // Each agent reviews the current consensus    const refinementOpinions = [];        for (const agent of swarm.getAgents()) {      const opinion = await agent.evaluateConsensus(currentConsensus);      refinementOpinions.push(opinion);    }        // Aggregate refinement opinions    currentConsensus = swarm.aggregateRefinements(      currentConsensus,      refinementOpinions    );        // Check for convergence    if (swarm.hasConverged(currentConsensus)) {      console.log(`Refinement converged after ${round + 1} rounds`);      break;    }  }    return {    finalConsensus: currentConsensus,    refinementRounds: Math.min(refinementRounds, round + 1),    hasConverged: swarm.hasConverged(currentConsensus)  };}// Example usageconst refinedDecision = await refineSwarmDecision(  marketSwarm,  swarmAnalysis.consensusResults);
```

###
