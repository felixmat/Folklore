import { nodes, gameState, log, updateHUD } from './state.js';
import { drawBoard, showICCardModal } from './rendering.js';
import { returnItemToDeck, decks, drawICCard, returnICToDeck } from './deck.js';
import { calculateReachableNodes, reachableNodes, isAnimatingMove, setIsAnimatingMove } from './pathfinding.js';
import { openKakkabuModal } from './kakkabu.js';
import { isMultiplayer, broadcastState } from './multiplayer.js';

export function getActivePlayer() {
  return gameState.players[gameState.turn];
}

export function isMyTurn() {
  if (!isMultiplayer()) return true; 
  return gameState.turn === gameState.myPlayerIndex;
}

/**
 * Handles Rolling Dice
 */
export function handleRoll() {
  if (gameState.hasRolled || isAnimatingMove) return;

  if (!isMyTurn()) {
    log("It's not your turn!");
    return;
  }

  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  const total = d1 + d2;

  gameState.stepsRemaining = total;
  gameState.hasRolled = true;

  const die1 = document.getElementById('die1');
  const die2 = document.getElementById('die2');
  const stepsLeft = document.getElementById('steps-left');
  const rollBtn = document.getElementById('roll-btn');

  if (die1) die1.innerText = d1;
  if (die2) die2.innerText = d2;
  if (stepsLeft) stepsLeft.innerText = total;
  if (rollBtn) rollBtn.disabled = true;

  const activePlayer = getActivePlayer();
  const currentReachable = calculateReachableNodes(activePlayer.pos, total);

  const reachableCount = Object.keys(currentReachable).length;
  if (reachableCount > 0) {
    log(`${activePlayer.name || 'Player ' + (gameState.turn + 1)} rolled <strong>${total}</strong>. Select a highlighted destination.`);
  } else {
    log(`${activePlayer.name || 'Player ' + (gameState.turn + 1)} rolled <strong>${total}</strong>, but has no accessible paths.`);
    setTimeout(() => switchTurn(), 1200);
  }

  updateHUD();
  drawBoard();

  // 📡 Broadcast dice roll and reachability state to remote peer
  broadcastState();
}

/**
 * Handles Board Clicks for Player Movement
 */
export function handlePlayerClick(x, y) {
  if (!gameState.hasRolled || isAnimatingMove || Object.keys(reachableNodes).length === 0) return;

  // Prevent moving on opponent's turn in online play
  if (!isMyTurn()) return;

  const activePlayer = getActivePlayer();

  const clickedId = Object.keys(reachableNodes).find(rId => {
    const n = nodes[rId];
    if (!n) return false;
    const radius = n.type === 'path' ? 14 : 20;
    return Math.hypot(x - n.x, y - n.y) <= radius;
  });

  if (clickedId) {
    const targetData = reachableNodes[clickedId];
    const fullPath = targetData.path;
    const destNode = nodes[clickedId];

    const rollBtn = document.getElementById('roll-btn');
    if (rollBtn) rollBtn.disabled = true;

    animatePlayerMovement(activePlayer, fullPath, () => {
      let statusMsg = `${activePlayer.name || 'Player ' + activePlayer.id} moved <strong>${targetData.dist} steps</strong> to <strong>${destNode.name || destNode.id}</strong>.`;

      if (destNode.type === 'location') {
        if (destNode.requiredItem) {
          const itemIdx = activePlayer.items.findIndex(
            i => i && i.name && i.name.trim().toLowerCase() === destNode.requiredItem.trim().toLowerCase()
          );

          if (itemIdx !== -1) {
            const usedItem = activePlayer.items.splice(itemIdx, 1)[0];
            returnItemToDeck(usedItem);
            // Refresh player hand AND deck counters on screen
            updateHUD();
            statusMsg += `<br>🔑 Used <strong>${usedItem.name}</strong> to enter! Returned to deck.`;
          }
        }
        statusMsg += ` 🏰 Turn completed.`;
        log(statusMsg);
        updateHUD();
        drawBoard();
        
        // Broadcast final movement position before turn switch
        broadcastState();
        setTimeout(() => switchTurn(), 600);

      } else if (destNode.type === 'kakkabu') {
        log(statusMsg);
        broadcastState();
        if (!activePlayer.items || activePlayer.items.length === 0) {
          log(`🔮 <strong>${activePlayer.name || 'Player ' + activePlayer.id}</strong> reached Kakkabu Point, but has no items to offer.`);
          setTimeout(() => switchTurn(), 600);
        } else {
          openKakkabuModal(activePlayer, clickedId, targetData.dist);
        }

    
      } else if (destNode.type === 'interaction') {
        console.log("➡️ [1] Landed on Interaction node. Attempting drawICCard()...");
        
        const icCard = drawICCard();
        console.log("➡️ [2] Drawn IC Card Result:", icCard);

        if (icCard) {
            statusMsg += ` ⚠️ Stopped by Interaction Site! Met <strong>${icCard.name || 'a character'}</strong>.`;
            log(statusMsg);
            updateHUD();
            drawBoard();

            console.log("➡️ [3] Calling showICCardModal...");
            
            try {
                showICCardModal(icCard, () => {
                    console.log("➡️ [5] Modal closed by player. Switching turn...");
                    if (typeof broadcastState === 'function') broadcastState();
                    switchTurn();
                });
                console.log("➡️ [4] showICCardModal executed successfully.");
            } catch (err) {
                console.error("❌ [ERROR] Crash inside showICCardModal:", err);
                // Fallback so game doesn't freeze if modal errors out
                setTimeout(() => switchTurn(), 1000);
            }

            return; 
        } else {
            console.warn("⚠️ [2b] IC Deck returned null/empty.");
            statusMsg += ` ⚠️ Stopped by Interaction Site! (IC Deck is empty).`;
            log(statusMsg);
            updateHUD();
            drawBoard();
            if (typeof broadcastState === 'function') broadcastState();
            setTimeout(() => switchTurn(), 600);
            return;
        }

      } else {
        log(statusMsg);
        updateHUD();
        drawBoard();
        broadcastState();
        setTimeout(() => switchTurn(), 600);
      }
    });
  }
}

/**
 * Handles Step-by-Step Movement Animation
 */
function animatePlayerMovement(player, pathArray, onComplete) {
  if (!pathArray || pathArray.length <= 1) {
    if (onComplete) onComplete();
    return;
  }

  setIsAnimatingMove(true);
  let currentStepIndex = 1;

  function advanceStep() {
    if (currentStepIndex < pathArray.length) {
      player.pos = pathArray[currentStepIndex];
      
      // Update intermediate position locally and sync over network
      drawBoard();
      broadcastState();

      currentStepIndex++;
      setTimeout(advanceStep, 220);
    } else {
      setIsAnimatingMove(false);
      if (onComplete) onComplete();
    }
  }

  advanceStep();
}

/**
 * Switches Active Player Turn
 */
export function switchTurn() {
  // Prevent player from ending the opponent's turn in online play
  if (!isMyTurn()) {
    log("It's not your turn!");
    return;
  }

  gameState.turn = (gameState.turn + 1) % 2;
  gameState.stepsRemaining = 0;
  gameState.hasRolled = false;

  // Clear path reachability for turn switch
  calculateReachableNodes(gameState.players[gameState.turn].pos, 0);

  const stepsLeft = document.getElementById('steps-left');
  const rollBtn = document.getElementById('roll-btn');
  const endBtn = document.getElementById('end-btn');

  if (stepsLeft) stepsLeft.innerText = 0;

  // Enable/disable turn controls based on whose turn it now is
  const myTurnNow = isMyTurn();
  if (rollBtn) rollBtn.disabled = !myTurnNow;
  if (endBtn) endBtn.disabled = !myTurnNow;

  const currentP = getActivePlayer();
  log(`Turn switched to <strong>${currentP.name || 'Player ' + (gameState.turn + 1)}</strong>.`);
  
  updateHUD();
  drawBoard();

  // 📡 Broadcast turn switch over network
  broadcastState();
}