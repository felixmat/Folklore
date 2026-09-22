// Set your passcode key here
const GAME_PASSCODE = "Koodothram";

import { nodes, gameState, updateHUD, log, loadNodesData, initializePlayerPositions } from './state.js';
import { drawBoard } from './rendering.js';
import { buildCombinedDeck, buildICDeck, drawItem } from './deck.js';
import { 
  handleDevSingleClick, 
  handleDevDoubleClick,
  setViewMode, 
  updateSelectedNodeProperties,
  deleteSelectedNode,
  clearAllNodes,
  exportMapJSON,
  importMapJSON
} from './devInspector.js';
import { handleRoll, handlePlayerClick, switchTurn } from './turnManager.js';
import { initMultiplayer, createGame } from './multiplayer.js';

let clickTimer = null;
let isDraggingNode = false;
let dragNodeId = null;
let dragThresholdExceeded = false;
let dragStartPos = { x: 0, y: 0 };

export async function loadGameMap() {
  try {
    if (Object.keys(nodes).length === 0) {
      await loadNodesData('../game_map_nodes.json');
    }

    if (Object.keys(nodes).length > 0) {
      // Find the key/ID for the market node inside the `nodes` dictionary
      const marketKey = Object.keys(nodes).find(key => {
        const node = nodes[key];
        return node.type === 'market' || 
               node.nodeType === 'market' || 
               node.name?.toLowerCase() === 'market' ||
               key.toLowerCase().includes('market');
      });

      // Fallback to N10 or the first node key if no market node is found
      const startPosition = marketKey || (nodes["N10"] ? "N10" : Object.keys(nodes)[0]);
      
      console.log(`📍 Dynamically setting player start position to: ${startPosition}`);

      // Update player positions in gameState
      gameState.players.forEach(p => p.pos = startPosition);
    }

    drawBoard();
  } catch (error) {
    console.error("Failed loading map nodes:", error);
  }
}

export function startGame() {
  const p1Elem = document.getElementById('p1-name-input');
  const p2Elem = document.getElementById('p2-name-input');
  const p1Input = p1Elem ? p1Elem.value.trim() : "";
  const p2Input = p2Elem ? p2Elem.value.trim() : "";

  gameState.players[0].name = p1Input || "Player 1";
  gameState.players[1].name = p2Input || "Player 2";

  const setupModal = document.getElementById('setup-modal');
  if (setupModal) setupModal.style.display = 'none';

  const p1Display = document.getElementById('p1-display-name');
  const p2Display = document.getElementById('p2-display-name');
  if (p1Display) p1Display.innerText = gameState.players[0].name;
  if (p2Display) p2Display.innerText = gameState.players[1].name;

  buildCombinedDeck();
  gameState.players[0].items = [drawItem(), drawItem(), drawItem()];
  gameState.players[1].items = [drawItem(), drawItem(), drawItem()];

  buildICDeck();

  log(`Game started! Roll dice to move.`);
  updateHUD();
  drawBoard();
}

export function setupCanvasListeners(canvas) {
  if (!canvas) return;

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    if (window.currentViewMode === 'dev') {
      const clickedNode = Object.values(nodes).find(n => Math.hypot(x - n.x, y - n.y) <= 15);
      if (clickedNode) {
        isDraggingNode = true;
        dragNodeId = clickedNode.id;
        dragThresholdExceeded = false;
        dragStartPos = { x, y };
      }
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (window.currentViewMode === 'dev' && isDraggingNode && dragNodeId) {
      const rect = canvas.getBoundingClientRect();
      const currentX = Math.round(e.clientX - rect.left);
      const currentY = Math.round(e.clientY - rect.top);

      if (Math.hypot(currentX - dragStartPos.x, currentY - dragStartPos.y) > 3) {
        dragThresholdExceeded = true;
      }

      nodes[dragNodeId].x = currentX;
      nodes[dragNodeId].y = currentY;
      drawBoard();
    }
  });

  canvas.addEventListener('mouseup', () => {
    if (window.currentViewMode === 'dev' && isDraggingNode) {
      isDraggingNode = false;
      dragNodeId = null;
    }
  });

  canvas.addEventListener('click', (e) => {
    if (dragThresholdExceeded) {
      dragThresholdExceeded = false;
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    if (window.currentViewMode === 'dev') {
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => {
        handleDevSingleClick(x, y);
      }, 220);
    } else {
      handlePlayerClick(x, y);
    }
  });

  canvas.addEventListener('dblclick', (e) => {
    if (window.currentViewMode !== 'dev') return;

    clearTimeout(clickTimer);

    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    handleDevDoubleClick(x, y);
  });
}

document.getElementById('insp-connect-btn')?.addEventListener('click', () => {
  const select = document.getElementById('insp-connect-select');
  if (select && select.value) {
    toggleLink(selectedDevNodeId, select.value);
  }
});

function initGame(nodes) {
    // Pass the loaded nodes to position functions
    initializePlayerPositions(nodes);
    
    // Draw initial tokens on the map
    renderBoard();
}

// Initial setup on page load - ensure map nodes are loaded BEFORE initializing multiplayer
document.addEventListener('DOMContentLoaded', () => {
    const gate = document.getElementById('auth-gate');
    const passInput = document.getElementById('auth-pass-input');
    const passBtn = document.getElementById('auth-pass-btn');
    const errorMsg = document.getElementById('auth-error-msg');

    // Skip passcode entry if player authenticated earlier in this session
    if (sessionStorage.getItem('game_authenticated') === 'true') {
        if (gate) gate.style.display = 'none';
        launchGame();
        return;
    }

    function attemptUnlock() {
        if (passInput.value.trim() === GAME_PASSCODE) {
            sessionStorage.setItem('game_authenticated', 'true');
            if (gate) gate.style.display = 'none';
            launchGame();
        } else {
            errorMsg.style.display = 'block';
            passInput.style.borderColor = '#ef4444';
            passInput.value = '';
        }
    }

    passBtn.addEventListener('click', attemptUnlock);
    passInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') attemptUnlock();
    });
});

// Move map loading & multiplayer setup inside launchGame()
async function launchGame() {
    const canvas = document.getElementById('gameBoard');
    if (canvas && typeof setupCanvasListeners === 'function') {
        setupCanvasListeners(canvas);
    }
    
    // 1. Load map nodes & resolve Market starting node
    await loadGameMap();

    // 2. Initialize PeerJS connection & read room URL parameters
    if (typeof initMultiplayer === 'function') {
        initMultiplayer();
    }
}

// Attach listener to Host Online Game button
document.getElementById('host-game-btn')?.addEventListener('click', () => {
  startGame(); // Initialize game state, deck, and hide setup modal locally
  createGame(); // Open PeerJS session
});

// Game Controls
document.getElementById('start-game-btn')?.addEventListener('click', startGame);
document.getElementById('roll-btn')?.addEventListener('click', handleRoll);
document.getElementById('end-btn')?.addEventListener('click', switchTurn);

// View Mode Switches
document.getElementById('mode-player-btn')?.addEventListener('click', () => setViewMode('player'));
document.getElementById('mode-dev-btn')?.addEventListener('click', () => setViewMode('dev'));

// Dev Inspector Controls
document.getElementById('insp-type')?.addEventListener('change', updateSelectedNodeProperties);
document.getElementById('insp-name')?.addEventListener('input', updateSelectedNodeProperties);
document.getElementById('insp-location-preset')?.addEventListener('change', updateSelectedNodeProperties);
document.getElementById('delete-node-btn')?.addEventListener('click', deleteSelectedNode);

// Map Import / Export Controls
document.getElementById('export-json-btn')?.addEventListener('click', exportMapJSON);
document.getElementById('import-json-btn')?.addEventListener('click', () => document.getElementById('import-json-file')?.click());
document.getElementById('import-json-file')?.addEventListener('change', importMapJSON);
document.getElementById('clear-nodes-btn')?.addEventListener('click', clearAllNodes);