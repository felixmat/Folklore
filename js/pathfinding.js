import { nodes, gameState } from './state.js';

export let reachableNodes = {};
export let isAnimatingMove = false;

// Setter so turnManager can update movement state during animations
export function setIsAnimatingMove(value) {
  isAnimatingMove = value;
}

// Helper to check if player possesses required key/item
function playerHasItem(player, requiredItem) {
  if (!requiredItem) return true; // No requirement to enter
  return player.items.some(item => item && item.name === requiredItem);
}

export function calculateReachableNodes(startNodeId, maxSteps) {
  reachableNodes = {};
  if (!nodes[startNodeId] || maxSteps <= 0 || isAnimatingMove) return reachableNodes;

  const activePlayer = gameState.players[gameState.turn];
  let queue = [{ id: startNodeId, dist: 0, path: [startNodeId] }];
  let visitedDistances = { [startNodeId]: 0 };
  let validLandingTargets = {};

  while (queue.length > 0) {
    let current = queue.shift();
    const currentNode = nodes[current.id];

    if (current.id !== startNodeId) {
      const isLocation = currentNode.type === 'location';
      const isInteraction = currentNode.type === 'interaction';
      const isKakkabu = currentNode.type === 'kakkabu';

      // 1. Kakkabu Points: ALWAYS valid landing targets if reached within maxSteps
      if (isKakkabu) {
        validLandingTargets[current.id] = { dist: current.dist, path: current.path, isBarrier: false };
      }

      // 2. Locations with item requirements or explicit barriers
      if (isLocation) {
        let canEnter = playerHasItem(activePlayer, currentNode.requiredItem);
        
        // If it requires an item, it acts as a barrier stop
        if (currentNode.requiredItem && currentNode.requiredItem.trim() !== "") {
          if (canEnter) {
            validLandingTargets[current.id] = { dist: current.dist, path: current.path, isBarrier: true };
          } else {
            const prevNodeId = current.path[current.path.length - 2];
            if (prevNodeId && prevNodeId !== startNodeId && !validLandingTargets[prevNodeId]) {
              validLandingTargets[prevNodeId] = {
                dist: current.dist - 1,
                path: current.path.slice(0, -1),
                isBarrier: false
              };
            }
          }
          continue; // Restricted locations stop further traversal
        }
        // If location has NO required item (e.g. Market), it behaves like a normal path node!
      }

      // 3. Interaction nodes stop movement completely
      if (isInteraction) {
        validLandingTargets[current.id] = { dist: current.dist, path: current.path, isBarrier: true };
        continue;
      }

      // 4. Standard path nodes on the exact final step
      if (current.dist === maxSteps && !isKakkabu) {
        validLandingTargets[current.id] = { dist: current.dist, path: current.path, isBarrier: false };
      }
    }

    if (current.dist >= maxSteps) continue;

    if (currentNode.neighbors) {
      currentNode.neighbors.forEach(nId => {
        if (!nodes[nId]) return;
        const newDist = current.dist + 1;

        // Skip if already visited with a shorter path
        if (visitedDistances[nId] !== undefined && visitedDistances[nId] <= newDist) return;

        visitedDistances[nId] = newDist;
        queue.push({
          id: nId,
          dist: newDist,
          path: [...current.path, nId]
        });
      });
    }
  }

  reachableNodes = validLandingTargets;
  return reachableNodes;
}