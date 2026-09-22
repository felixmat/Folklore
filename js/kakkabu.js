import { nodes, gameState, log, updateHUD } from './state.js';
import { drawBoard, setHighlightedKakkabu } from './rendering.js';
import { switchTurn } from './turnManager.js';
import { calculateReachableNodes } from './pathfinding.js';
import { broadcastState, isMultiplayer } from './multiplayer.js';
import { returnItemToDeck, decks } from './deck.js';

let activePlayerRef = null;
let activeKakkabuIdRef = null;

export function openKakkabuModal(player, currentKakkabuId, distUsed = 0) {
  activePlayerRef = player;
  activeKakkabuIdRef = currentKakkabuId;

  // 1. Deduct steps
  gameState.stepsRemaining = Math.max(0, (gameState.stepsRemaining || 0) - distUsed);
  
  // 2. Sync UI counter
  const stepsLeftElem = document.getElementById('steps-left');
  if (stepsLeftElem) stepsLeftElem.innerText = gameState.stepsRemaining;

  const modal = document.getElementById('kakkabu-modal');
  const choiceStep = document.getElementById('kakkabu-step-choice');
  const selectStep = document.getElementById('kakkabu-step-select');

  if (!modal || !choiceStep || !selectStep) {
    console.error("Kakkabu modal elements missing from DOM.");
    return;
  }

  // Reset steps
  choiceStep.style.display = 'block';
  selectStep.style.display = 'none';
  modal.style.display = 'block';

  // --- "NO" BUTTON ---
  const noBtn = document.getElementById('kakkabu-no-btn');
  if (noBtn) {
    noBtn.onclick = (e) => {
      e.stopPropagation();
      setHighlightedKakkabu(null);
      modal.style.display = 'none';
      log(`${player.name || 'Player'} chose not to teleport.`);

      if (gameState.stepsRemaining > 0) {
        const reachable = calculateReachableNodes(player.pos, gameState.stepsRemaining);
        if (Object.keys(reachable).length > 0) {
          log(`🎯 Continue moving your remaining <strong>${gameState.stepsRemaining} steps</strong>.`);
          updateHUD();
          drawBoard();
          if (isMultiplayer()) broadcastState();
          return;
        }
      }

      setTimeout(() => switchTurn(), 600);
    };
  }

  // --- "YES" BUTTON ---
  const yesBtn = document.getElementById('kakkabu-yes-btn');
  if (yesBtn) {
    yesBtn.onclick = (e) => {
      e.stopPropagation();

      if (!player.items || player.items.length === 0) {
        alert("You have no items to offer!");
        setHighlightedKakkabu(null);
        modal.style.display = 'none';
        setTimeout(() => switchTurn(), 600);
        return;
      }

      choiceStep.style.display = 'none';
      selectStep.style.display = 'block';

      // Transition to selection setup
      setupKakkabuSelections(player, currentKakkabuId);
    };
  }
}

export function setupKakkabuSelections(player, currentKakkabuId) {
  const itemSelect = document.getElementById('kakkabu-item-select');
  const targetSelect = document.getElementById('kakkabu-target-select');
  const confirmBtn = document.getElementById('kakkabu-confirm-btn');
  const cancelBtn = document.getElementById('kakkabu-cancel-btn');

  if (!itemSelect || !targetSelect) {
    console.error("Select elements not found inside #kakkabu-step-select.");
    return;
  }

  // Populate Items
  itemSelect.innerHTML = '';
  player.items.forEach((item, index) => {
    const itemName = typeof item === 'object' ? (item.name || `Item ${index + 1}`) : item;
    const opt = document.createElement('option');
    opt.value = String(index);
    opt.textContent = itemName;
    itemSelect.appendChild(opt);
  });

  // Populate Kakkabu Targets
  targetSelect.innerHTML = '';
  const otherKakkabus = Object.values(nodes).filter(
    n => n.type === 'kakkabu' && String(n.id) !== String(currentKakkabuId)
  );

  if (otherKakkabus.length === 0) {
    alert("No other Kakkabu points available on the board!");
    document.getElementById('kakkabu-modal').style.display = 'none';
    setHighlightedKakkabu(null);
    setTimeout(() => switchTurn(), 600);
    return;
  }

  otherKakkabus.forEach(n => {
    const opt = document.createElement('option');
    opt.value = String(n.id);
    opt.textContent = n.name || `Kakkabu ${n.id}`;
    targetSelect.appendChild(opt);
  });

  // Default selection
  targetSelect.value = String(otherKakkabus[0].id);

  // 🎯 Highlight default node on board
  setHighlightedKakkabu(targetSelect.value);

  // 🎯 Dynamic highlight change on dropdown change
  targetSelect.onchange = (e) => {
    setHighlightedKakkabu(e.target.value);
  };

  // --- CONFIRM BUTTON BINDING ---
  if (confirmBtn) {
    confirmBtn.type = "button"; // Prevent form submission reloads
    confirmBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const itemIdx = parseInt(itemSelect.value, 10);
      const targetId = targetSelect.value;

      if (isNaN(itemIdx) || !targetId) {
        alert("Please select a valid item and destination.");
        return;
      }

      executeKakkabuTeleport(player, itemIdx, targetId);
    };
  }

  // --- CANCEL BUTTON BINDING ---
  if (cancelBtn) {
    cancelBtn.type = "button"; // Prevent form submission reloads
    cancelBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      setHighlightedKakkabu(null);
      document.getElementById('kakkabu-modal').style.display = 'none';

      if (gameState.stepsRemaining > 0) {
        const reachable = calculateReachableNodes(player.pos, gameState.stepsRemaining);
        if (Object.keys(reachable).length > 0) {
          log(`🎯 Continue moving your remaining <strong>${gameState.stepsRemaining} steps</strong>.`);
          updateHUD();
          drawBoard();
          if (isMultiplayer()) broadcastState();
          return;
        }
      }

      setTimeout(() => switchTurn(), 600);
    };
  }
}

export function executeKakkabuTeleport(player, itemIndex, targetNodeId) {
  // 1. Clear target highlight ring
  setHighlightedKakkabu(null);

  // 2. Fetch target node FIRST so targetNode exists before any logging
  const targetNode = nodes[targetNodeId];
  if (!targetNode) {
    console.error(`Target node ${targetNodeId} not found in nodes dictionary.`);
    return;
  }

  // 3. Discard item and return to item deck
  let discardedName = 'an item';
  if (itemIndex >= 0 && itemIndex < player.items.length) {
    const discardedItem = player.items.splice(itemIndex, 1)[0];

    if (discardedItem) {
      const itemObj = typeof discardedItem === 'object' 
        ? discardedItem 
        : { name: discardedItem, cat: 'normal' };

      returnItemToDeck(itemObj);
      discardedName = itemObj.name || discardedItem;
    }
  }

  // 4. Warp player token
  player.pos = targetNodeId;

  // 5. Close modal
  const modal = document.getElementById('kakkabu-modal');
  if (modal) modal.style.display = 'none';

  // 6. Log warp event safely (targetNode is guaranteed to be declared here)
  log(`✨ ${player.name || 'Player'} offered [${discardedName}] and warped to ${targetNode.name || targetNodeId}!`);

  // 7. Process remaining steps from destination
  if (gameState.stepsRemaining > 0) {
    const reachable = calculateReachableNodes(player.pos, gameState.stepsRemaining);
    if (Object.keys(reachable).length > 0) {
      log(`🎯 You have <strong>${gameState.stepsRemaining} steps remaining</strong>. Select your next destination.`);
      updateHUD();
      drawBoard();
      if (typeof isMultiplayer === 'function' && isMultiplayer()) broadcastState();
      return;
    }
  }

  // 8. Refresh HUD and complete movement
  updateHUD();
  drawBoard();
  if (typeof isMultiplayer === 'function' && isMultiplayer()) broadcastState();
  setTimeout(() => switchTurn(), 600);
}