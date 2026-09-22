import { gameState, updateHUD, log } from './state.js';
import { drawBoard } from './rendering.js';
import { calculateReachableNodes } from './pathfinding.js';
import { isMyTurn } from './turnManager.js';

let peer = null;
let conn = null;

gameState.isMultiplayer = false;
gameState.isHost = false;

export function isMultiplayer() {
  return gameState.isMultiplayer;
}

export function isHost() {
  return gameState.isHost;
}

/**
 * Called on page load in main.js
 */
export function initMultiplayer() {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('room');

  if (roomId) {
    console.log(`[Multiplayer] Room parameter detected: ${roomId}`);
    joinGame(roomId);
  }
}

/**
 * Host creates a PeerJS room
 */
export function createGame() {
  // Free public PeerJS cloud broker
  peer = new Peer();

  peer.on('open', (id) => {
    gameState.isMultiplayer = true;
    gameState.isHost = true;
    gameState.myPlayerIndex = 0; // Host is Player 1

    const joinUrl = `${window.location.origin}${window.location.pathname}?room=${id}`;
    
    // Copy to clipboard or prompt fallback
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(joinUrl).then(() => {
        alert(`Room Created!\n\nLink copied to clipboard:\n${joinUrl}`);
      }).catch(() => {
        prompt("Room Created! Share this link with Player 2:", joinUrl);
      });
    } else {
      prompt("Room Created! Share this link with Player 2:", joinUrl);
    }

    log(`Hosting room ID: <strong>${id}</strong>. Waiting for Player 2...`);
  });

  peer.on('connection', (connection) => {
    conn = connection;
    setupConnectionListeners();

    // When connection is ready, push state to Player 2
    conn.on('open', () => {
      log(`🟢 Player 2 connected! Syncing state...`);
      syncStateToPeer();
    });
  });

  peer.on('error', (err) => {
    console.error('[Multiplayer] Host PeerJS Error:', err);
    alert(`Connection Error: ${err.type}`);
  });
}

/**
 * Guest joins room from link
 */
export function joinGame(roomId) {
  peer = new Peer();

  // CRITICAL: Wait for Player 2's own peer instance to open BEFORE calling peer.connect()
  peer.on('open', (myPeerId) => {
    console.log(`[Multiplayer] My Peer ID generated: ${myPeerId}. Connecting to host room: ${roomId}`);
    
    gameState.isMultiplayer = true;
    gameState.isHost = false;
    gameState.myPlayerIndex = 1; // Guest is Player 2

    // Hide setup modal immediately and show connecting status
    const setupModal = document.getElementById('setup-modal');
    if (setupModal) setupModal.style.display = 'none';

    log(`Connecting to room: <strong>${roomId}</strong>...`);

    // Initiate WebRTC connection to host
    conn = peer.connect(roomId, { reliable: true });

    setupConnectionListeners();

    conn.on('open', () => {
      console.log('[Multiplayer] Connection opened with Host!');
      log(`🟢 Connected to Host! Starting game...`);
    });
  });

  peer.on('error', (err) => {
    console.error('[Multiplayer] Guest PeerJS Error:', err);
    log(`❌ Could not connect to room "${roomId}". Check if host tab is open.`);
    alert(`Failed to connect to room. The host may have disconnected or the link expired.`);
  });
}

function setupConnectionListeners() {
  if (!conn) return;

  conn.on('data', (data) => {
    handleNetworkMessage(data);
  });

  conn.on('close', () => {
    log(`⚠️ Remote player disconnected.`);
  });
}

export function sendNetworkAction(type, payload = {}) {
  if (conn && conn.open) {
    conn.send({ type, payload });
  }
}

function handleNetworkMessage(data) {
  if (!data || !data.type) return;

  switch (data.type) {
    case 'STATE_SYNC': {
      // Save local player identity before syncing state
      const localMyPlayerIndex = gameState.myPlayerIndex;
      const localIsHost = gameState.isHost;

      // Overwrite global game state with incoming network state
      Object.assign(gameState, data.payload);

      // Restore local player identity
      gameState.myPlayerIndex = localMyPlayerIndex;
      gameState.isHost = localIsHost;

      // Hide setup modal on guest screen
      const setupModal = document.getElementById('setup-modal');
      if (setupModal) setupModal.style.display = 'none';

      // Dynamically lock/unlock controls for current active player
      const myTurnNow = isMyTurn();
      
      const rollBtn = document.getElementById('roll-btn');
      if (rollBtn) {
        rollBtn.disabled = !myTurnNow || gameState.hasRolled;
      }

      const endBtn = document.getElementById('end-btn');
      if (endBtn) {
        endBtn.disabled = !myTurnNow;
      }

      const stepsLeft = document.getElementById('steps-left');
      if (stepsLeft) {
        stepsLeft.innerText = gameState.stepsRemaining || 0;
      }

      // Sync path highlights on remote player's screen
      if (gameState.hasRolled && gameState.stepsRemaining > 0) {
        const activeP = gameState.players[gameState.turn];
        calculateReachableNodes(activeP.pos, gameState.stepsRemaining);
      } else {
        calculateReachableNodes(gameState.players[gameState.turn].pos, 0);
      }

      updateHUD();
      drawBoard();
      break;
    }

    default:
      console.log('Received packet:', data);
  }
}

export function broadcastState() {
  if (gameState.isMultiplayer && conn && conn.open) {
    sendNetworkAction('STATE_SYNC', gameState);
  }
}

export function syncStateToPeer() {
  if (gameState.isMultiplayer && conn && conn.open) {
    sendNetworkAction('STATE_SYNC', gameState);
  }
}