import { updateDeckUI } from './deck.js';

export let nodes = {};

// Function to get the market node ID from your board data
function getMarketNodeId(boardNodes) {
    // Searches your board nodes array/object for the one labeled "market"
    const marketNode = boardNodes.find(node => 
        node.type === 'market' || 
        node.name?.toLowerCase() === 'market' || 
        node.id?.toLowerCase().includes('market')
    );
    if (marketNode) {
        console.log("✅ Found Market Node:", marketNode);
        return marketNode.id;
    } else {
        console.warn("⚠️ Market node NOT found in BOARD_NODES! Falling back to N10.");
        return "N10";
    }
}

// Initialize gameState
export const gameState = {
  turn: 0,
  stepsRemaining: 0,
  hasRolled: false,
  players: [
    { id: 1, name: "Player 1", color: "#e63946", pos: null, items: [] },
    { id: 2, name: "Player 2", color: "#457b9d", pos: null, items: [] }
  ]
};

// Call this when setting up or resetting the game
export function initializePlayerPositions(boardNodes) {
    const marketId = getMarketNodeId(boardNodes);
    gameState.players.forEach(player => {
        player.pos = marketId;
    });
}

// View and Selection State
export let currentViewMode = 'player'; // 'player' or 'dev'
window.currentViewMode = 'player';

export let selectedNodeId = null;
export let selectedDevNodeId = null;

// Dragging State
export let isDraggingNode = false;
export let dragNodeId = null;
export let wasDragging = false;

// Reachable Nodes State (Pathfinding)
export let reachableNodes = {};

// Auto ID Counter
export let autoNodeCounter = 1;

// --- Setters and Mutators ---

export function setNodes(newNodes) {
  Object.keys(nodes).forEach(key => delete nodes[key]);
  Object.assign(nodes, newNodes);
}

export function setCurrentViewMode(mode) {
  currentViewMode = mode;
  window.currentViewMode = mode;
}

export function setSelectedNodeId(id) {
  selectedNodeId = id;
}

export function setSelectedDevNodeId(id) {
  selectedDevNodeId = id;
}

export function setIsDraggingNode(val) {
  isDraggingNode = val;
}

export function setDragNodeId(val) {
  dragNodeId = val;
}

export function setWasDragging(val) {
  wasDragging = val;
}

export function setReachableNodes(nodesObj) {
  reachableNodes = nodesObj;
}

export function incrementAutoNodeCounter() {
  autoNodeCounter++;
  return autoNodeCounter;
}

export function resetAutoNodeCounter() {
  autoNodeCounter = 1;
}

export function generateUniqueNodeId() {
  while (nodes[`N${autoNodeCounter}`]) {
    autoNodeCounter++;
  }
  return `N${autoNodeCounter}`;
}

// --- Data Loader ---

export async function loadNodesData(jsonPath = '../game_map_nodes.json') {
  try {
    const res = await fetch(jsonPath);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setNodes(data);
  } catch (err) {
    console.warn("Could not load nodes JSON dynamically:", err);
  }
}

// --- UI Helpers ---

export function log(msg) {
  const logBox = document.getElementById('log');
  if (logBox) {
    logBox.innerHTML += `<br>• ${msg}`;
    logBox.scrollTop = logBox.scrollHeight;
  }
}

export function updateHUD() {
  gameState.players.forEach((p, idx) => {
    const pNum = idx + 1;
    const invContainer = document.getElementById(`p${pNum}-items`);
    if (invContainer) {
      invContainer.innerHTML = '';
      p.items.forEach(item => {
        if (!item) return;
        const tag = document.createElement('div');
        tag.className = `item-badge item-${item.cat}`;
        tag.innerText = item.name;
        invContainer.appendChild(tag);
      });
    }

    const card = document.getElementById(`p${pNum}-card`);
    if (card) {
      if (gameState.turn === idx) card.classList.add('active');
      else card.classList.remove('active');
    }
  });
  updateDeckUI();
}

export function getNextStepNumber() {
  let maxIndex = 0;
  
  Object.values(nodes).forEach(node => {
    if (node.name) {
      // Look for numbers at the end of names matching "Step X" or similar
      const match = node.name.match(/Step\s*(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxIndex) maxIndex = num;
      }
    }
  });

  return maxIndex + 1;
}