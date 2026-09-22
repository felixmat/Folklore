/**
 * Kerala Folklore Board Game - Complete Unified Engine
 */

// ==========================================
// 1. STATE & INITIAL DATA
// ==========================================
let currentViewMode = 'player';
let selectedDevNodeId = null;
let isDraggingNode = false;
let dragNodeId = null;
let wasDragging = false;
let autoNodeCounter = 1;
let reachableNodes = {};
let isAnimatingMove = false;

// 10 Game Locations & their required Golden Items
const LOCATION_PRESETS = {
  "Market": { name: "Market", requiredItem: null },
  "Temple": { name: "Temple", requiredItem: "Kedavilakku" },
  "Paddy Fields": { name: "Paddy Fields", requiredItem: "Palm Toddy" },
  "Forest": { name: "Forest", requiredItem: "Choottu" },
  "Mountain": { name: "Mountain", requiredItem: "Metal Rod" },
  "Pond": { name: "Pond", requiredItem: "Wooden Cane" },
  "Chudukadu": { name: "Chudukadu", requiredItem: "Raw Rice Grains" },
  "Kalari": { name: "Kalari", requiredItem: "Urumi" },
  "Karimpanathottam": { name: "Karimpanathottam", requiredItem: "Lime Paste" },
  "Palace": { name: "Palace", requiredItem: "Gold" }
};

let nodes = {};

// Item & Deck Data
const GOLDEN_ITEMS = ["Gold", "Kedavilakku", "Palm Toddy", "Urumi", "Choottu", "Metal Rod", "Wooden Cane", "Lime Paste", "Raw Rice Grains"];
const NORMAL_CATEGORIES = [
  { name: "Weapons & Defence", cat: "weapon" },
  { name: "Food & Offerings", cat: "food" },
  { name: "Sacred & Ritual", cat: "sacred" },
  { name: "Tools & Utility", cat: "tool" }
];

let mainDeck = [];

function buildCombinedDeck() {
  mainDeck = [];
  GOLDEN_ITEMS.forEach(item => {
    mainDeck.push({ name: item, cat: "golden" }, { name: item, cat: "golden" });
  });
  NORMAL_CATEGORIES.forEach(c => {
    for (let i = 0; i < 4; i++) mainDeck.push({ name: c.name, cat: c.cat });
  });
  shuffleDeck();
}

function shuffleDeck() {
  mainDeck.sort(() => Math.random() - 0.5);
  updateDeckUI();
}

function drawItem() {
  if (mainDeck.length === 0) buildCombinedDeck();
  const drawn = mainDeck.pop();
  updateDeckUI();
  return drawn;
}

function returnItemToDeck(item) {
  if (item) {
    mainDeck.push(item);
    shuffleDeck();
  }
}

function updateDeckUI() {
  const countBadge = document.getElementById('deck-count');
  if (countBadge) countBadge.innerText = mainDeck.length;
}

const gameState = {
  turn: 0,
  stepsRemaining: 0,
  hasRolled: false,
  players: [
    { id: 1, name: "", color: "#e63946", pos: "N10", items: [] },
    { id: 2, name: "", color: "#457b9d", pos: "N10", items: [] }
  ]
};

// Canvas & Asset Loading Setup
const canvas = document.getElementById('gameBoard');
const ctx = canvas ? canvas.getContext('2d') : null;

let isImageLoaded = false;
const boardImage = new Image();
boardImage.src = 'board_map.jpeg';

boardImage.onload = () => {
  isImageLoaded = true;
  loadGameMap();
};
boardImage.onerror = () => {
  console.warn("board_map.jpeg not found. Falling back to background rendering.");
  loadGameMap();
};

function generateUniqueNodeId() {
  while (nodes[`N${autoNodeCounter}`]) {
    autoNodeCounter++;
  }
  return `N${autoNodeCounter}`;
}

function loadGameMap() {
  try {
    if (typeof initialNodesData !== "undefined" && Object.keys(nodes).length === 0) {
      nodes = initialNodesData;
    }

    // Set starting position fallback
    if (Object.keys(nodes).length > 0) {
      const defaultStart = nodes["N10"] ? "N10" : Object.keys(nodes)[0];
      gameState.players.forEach(p => p.pos = defaultStart);
    }

    drawBoard();
  } catch (error) {
    console.error("Failed loading map nodes:", error);
  }
}

// ==========================================
// 2. VIEW TOGGLES & SETUP MODAL
// ==========================================
function setViewMode(mode) {
  currentViewMode = mode;
  const pBtn = document.getElementById('mode-player-btn');
  const dBtn = document.getElementById('mode-dev-btn');
  const dPanel = document.getElementById('dev-panel');
  const pHud = document.getElementById('player-hud-group');

  if (pBtn) pBtn.classList.toggle('active', mode === 'player');
  if (dBtn) dBtn.classList.toggle('active', mode === 'dev');
  if (dPanel) dPanel.style.display = mode === 'dev' ? 'flex' : 'none';
  if (pHud) pHud.style.display = mode === 'player' ? 'flex' : 'none';

  if (mode === 'player') selectedDevNodeId = null;
  refreshInspector();
  drawBoard();
}

function startGame() {
  const p1Elem = document.getElementById('p1-name-input');
  const p2Elem = document.getElementById('p2-name-input');
  const p1Input = p1Elem ? p1Elem.value.trim() : "";
  const p2Input = p2Elem ? p2Elem.value.trim() : "";

  // Leave empty if blank so the fallback logic renders P1 / P2
  gameState.players[0].name = p1Input;
  gameState.players[1].name = p2Input;

  const setupModal = document.getElementById('setup-modal');
  if (setupModal) setupModal.style.display = 'none';

  const p1Display = document.getElementById('p1-display-name');
  const p2Display = document.getElementById('p2-display-name');
  if (p1Display) p1Display.innerText = gameState.players[0].name || "Player 1";
  if (p2Display) p2Display.innerText = gameState.players[1].name || "Player 2";

  buildCombinedDeck();
  gameState.players[0].items = [drawItem(), drawItem(), drawItem()];
  gameState.players[1].items = [drawItem(), drawItem(), drawItem()];

  log(`Game started! Roll dice to move.`);
  updateHUD();
  drawBoard();
}

function getPlayerTokenLabel(player, index) {
  if (player && player.name && player.name.trim().length > 0) {
    const trimmed = player.name.trim();
    // If name is "Player 1", "Player 2", etc., fallback to P1 / P2
    if (/^player\s*\d+$/i.test(trimmed)) {
      return `P${index + 1}`;
    }
    return trimmed.charAt(0).toUpperCase();
  }
  return `P${index + 1}`;
}

function drawPlayerToken(ctx, player, index, x, y, radius = 14) {
  ctx.save();

  // Draw background circle
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = player.color || (index === 0 ? '#E74C3C' : '#3498DB'); // Red for P1, Blue for P2
  ctx.fill();
  
  // White border around the token
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#FFFFFF';
  ctx.stroke();

  // Draw the initial / default label
  const label = getPlayerTokenLabel(player, index);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y);

  ctx.restore();
}

// ==========================================
// 3. PATHFINDING & LOCATION GATING
// ==========================================
function playerHasItem(player, itemName) {
  if (!itemName) return true;
  if (!player || !player.items) return false;
  return player.items.some(
    i => i && i.name && i.name.trim().toLowerCase() === itemName.trim().toLowerCase()
  );
}

function calculateReachableNodes(startNodeId, maxSteps) {
  reachableNodes = {};
  if (!nodes[startNodeId] || maxSteps <= 0 || isAnimatingMove) return;

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

      if (isLocation) {
        let canEnter = playerHasItem(activePlayer, currentNode.requiredItem);
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
        continue;
      }

      if (isInteraction) {
        validLandingTargets[current.id] = { dist: current.dist, path: current.path, isBarrier: true };
        continue;
      }

      if (current.dist === maxSteps) {
        validLandingTargets[current.id] = { dist: current.dist, path: current.path, isBarrier: false };
      }
    }

    if (current.dist >= maxSteps) continue;

    currentNode.neighbors.forEach(nId => {
      if (!nodes[nId]) return;
      const newDist = current.dist + 1;

      if (visitedDistances[nId] !== undefined && visitedDistances[nId] <= newDist) return;

      visitedDistances[nId] = newDist;
      queue.push({
        id: nId,
        dist: newDist,
        path: [...current.path, nId]
      });
    });
  }

  reachableNodes = validLandingTargets;
}

function handlePlayerArrival(player, nodeId) {
  const currentNode = nodes[nodeId];
  if (!currentNode) return;

  if (currentNode.type === 'kakkabu') {
    // Check if player has items to offer for teleportation
    if (!player.items || player.items.length === 0) {
      log(`${player.name || 'Player'} reached ${currentNode.name || nodeId}, but has no items to discard for teleportation.`);
      endTurnOrContinue();
      return;
    }
    
    // Prompt player for optional teleport
    openKakkabuModal(player, nodeId);
  } else if (currentNode.type === 'location') {
    handleLocationArrival(player, currentNode);
  } else if (currentNode.type === 'interaction') {
    handleInteractionArrival(player, currentNode);
  } else {
    endTurnOrContinue();
  }
}

let currentKakkabuContext = { player: null, currentId: null };

function openKakkabuModal(player, currentKakkabuId) {
  currentKakkabuContext = { player, currentId: currentKakkabuId };

  const modal = document.getElementById('kakkabu-modal');
  const choiceStep = document.getElementById('kakkabu-step-choice');
  const selectStep = document.getElementById('kakkabu-step-select');

  choiceStep.style.display = 'block';
  selectStep.style.display = 'none';
  modal.style.display = 'block';

  // "No" Button — Skip teleportation
  document.getElementById('kakkabu-no-btn').onclick = () => {
    modal.style.display = 'none';
    log(`${player.name || 'Player'} chose not to use the Kakkabu Point.`);
    endTurnOrContinue();
  };

  // "Yes" Button — Reveal choices
  document.getElementById('kakkabu-yes-btn').onclick = () => {
    setupKakkabuSelections(player, currentKakkabuId);
    choiceStep.style.display = 'none';
    selectStep.style.display = 'block';
  };
}

function setupKakkabuSelections(player, currentKakkabuId) {
  const itemSelect = document.getElementById('kakkabu-item-select');
  const targetSelect = document.getElementById('kakkabu-target-select');

  // Populate Item Dropdown
  itemSelect.innerHTML = '';
  player.items.forEach((item, index) => {
    const itemName = typeof item === 'object' ? (item.name || `Item ${index + 1}`) : item;
    const opt = document.createElement('option');
    opt.value = index;
    opt.textContent = itemName;
    itemSelect.appendChild(opt);
  });

  // Populate Other Kakkabu Points Dropdown
  targetSelect.innerHTML = '';
  const otherKakkabus = Object.values(nodes).filter(
    n => n.type === 'kakkabu' && n.id !== currentKakkabuId
  );

  if (otherKakkabus.length === 0) {
    alert("No other Kakkabu points available on the board!");
    document.getElementById('kakkabu-modal').style.display = 'none';
    return;
  }

  otherKakkabus.forEach(n => {
    const opt = document.createElement('option');
    opt.value = n.id;
    opt.textContent = n.name || `Kakkabu ${n.id}`;
    targetSelect.appendChild(opt);
  });

  // "Confirm" Button Handler
  document.getElementById('kakkabu-confirm-btn').onclick = () => {
    const itemIndex = parseInt(itemSelect.value, 10);
    const targetNodeId = targetSelect.value;

    executeKakkabuTeleport(player, itemIndex, targetNodeId);
  };

  // "Cancel" Button Handler
  document.getElementById('kakkabu-cancel-btn').onclick = () => {
    document.getElementById('kakkabu-modal').style.display = 'none';
    endTurnOrContinue();
  };
}

function executeKakkabuTeleport(player, itemIndex, targetNodeId) {
  // 1. Discard selected item
  const discardedItem = player.items.splice(itemIndex, 1)[0];
  const discardedName = typeof discardedItem === 'object' ? discardedItem.name : discardedItem;

  // 2. Move player position
  const targetNode = nodes[targetNodeId];
  player.pos = targetNodeId;

  // 3. Hide Modal & Log
  document.getElementById('kakkabu-modal').style.display = 'none';
  log(`✨ ${player.name || 'Player'} offered [${discardedName}] and warped to ${targetNode.name || targetNodeId}!`);

  // 4. Update HUD and Board UI
  updateHUD();
  drawBoard();
  endTurnOrContinue();
}
// ==========================================
// 4. ANIMATED MOVEMENT & PLAYER CLICK HANDLER
// ==========================================
function animatePlayerMovement(player, pathArray, onComplete) {
  if (!pathArray || pathArray.length <= 1) {
    if (onComplete) onComplete();
    return;
  }

  isAnimatingMove = true;
  let currentStepIndex = 1;

  function advanceStep() {
    if (currentStepIndex < pathArray.length) {
      player.pos = pathArray[currentStepIndex];
      drawBoard();
      currentStepIndex++;
      setTimeout(advanceStep, 220);
    } else {
      isAnimatingMove = false;
      if (onComplete) onComplete();
    }
  }

  advanceStep();
}

function handlePlayerClick(x, y) {
  if (!gameState.hasRolled || isAnimatingMove || Object.keys(reachableNodes).length === 0) return;

  const activePlayer = gameState.players[gameState.turn];

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

    reachableNodes = {};
    const rollBtn = document.getElementById('roll-btn');
    if (rollBtn) rollBtn.disabled = true;

    animatePlayerMovement(activePlayer, fullPath, () => {
      let statusMsg = `${activePlayer.name} moved <strong>${targetData.dist} steps</strong> to <strong>${destNode.name || destNode.id}</strong>.`;

      if (destNode.type === 'location') {
        if (destNode.requiredItem) {
          const itemIdx = activePlayer.items.findIndex(
            i => i && i.name && i.name.trim().toLowerCase() === destNode.requiredItem.trim().toLowerCase()
          );

          if (itemIdx !== -1) {
            const usedItem = activePlayer.items.splice(itemIdx, 1)[0];
            returnItemToDeck(usedItem);
            statusMsg += `<br>🔑 Used <strong>${usedItem.name}</strong> to enter! Returned to deck.`;
          }
        }
        statusMsg += ` 🏰 Turn completed.`;
        log(statusMsg);
        updateHUD();
        drawBoard();
        setTimeout(() => switchTurn(), 600);
      } else if (destNode.type === 'kakkabu') {
        log(statusMsg);
        if (!activePlayer.items || activePlayer.items.length === 0) {
          log(`🔮 <strong>${activePlayer.name}</strong> reached Kakkabu Point, but has no items to offer.`);
          setTimeout(() => switchTurn(), 600);
        } else {
          openKakkabuModal(activePlayer, clickedId);
        }
      } else if (destNode.type === 'interaction') {
        statusMsg += ` ⚠️ Stopped by Interaction Site! Turn completed.`;
        log(statusMsg);
        drawBoard();
        setTimeout(() => switchTurn(), 600);
      } else {
        log(statusMsg);
        drawBoard();
        setTimeout(() => switchTurn(), 600);
      }
    });
  }
}

// ==========================================
// 5. MAP JSON IMPORT & EXPORT
// ==========================================
function exportMapJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(nodes, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "game_map_nodes.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  log("Exported map configuration to JSON.");
}

function triggerImportJSON() {
  const fileInput = document.getElementById('import-json-file');
  if (fileInput) fileInput.click();
}

function importMapJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedNodes = JSON.parse(e.target.result);
      if (typeof importedNodes === 'object' && importedNodes !== null) {
        nodes = importedNodes;
        selectedDevNodeId = null;
        reachableNodes = {};
        refreshInspector();
        drawBoard();
        log("Successfully imported map JSON.");
      } else {
        alert("Invalid JSON structure.");
      }
    } catch (err) {
      alert("Error parsing JSON file: " + err.message);
    }
  };
  reader.readAsText(file);
}

// ==========================================
// 6. BOARD RENDERING
// ==========================================
function drawBoard() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (isImageLoaded) {
    ctx.drawImage(boardImage, 0, 0, canvas.width, canvas.height);
  }

  // Developer View Overlay
  if (currentViewMode === 'dev') {
    Object.values(nodes).forEach(node => {
      node.neighbors.forEach(nId => {
        const target = nodes[nId];
        if (!target) return;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = "rgba(0, 229, 255, 0.8)";
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    });

    Object.values(nodes).forEach(node => {
      const isSelected = selectedDevNodeId === node.id;
      const isLocation = node.type === 'location';
      const radius = isLocation ? 14 : 7;

      let nodeColor = "#0a0b0b"; 
      if (node.type === 'location') nodeColor = "#08f133";
      if (node.type === 'interaction') nodeColor = "#ff9900";
      if (node.type === 'kakkabu') nodeColor = "#bd00ff";

      // Draw Node Circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? "#db1222" : nodeColor;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = isSelected ? 3 : 1;
      ctx.stroke();

      // Show label ALWAYS for locations, but ONLY WHEN SELECTED for other nodes
      const shouldShowLabel = isLocation || isSelected;

      if (shouldShowLabel) {
        const labelText = node.requiredItem 
          ? `${node.name || node.id} [Req: ${node.requiredItem}]` 
          : (node.name || node.id);

        ctx.save();
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";

        const textMetrics = ctx.measureText(labelText);
        const textWidth = textMetrics.width;
        const textHeight = 14; 
        const labelX = node.x;
        const labelY = node.y - (radius + 6);

        // 1. Dark background pill
        ctx.fillStyle = "rgba(10, 10, 15, 0.85)";
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(
            labelX - (textWidth / 2) - 5,
            labelY - textHeight,
            textWidth + 10,
            textHeight + 2,
            4
          );
        } else {
          ctx.rect(
            labelX - (textWidth / 2) - 5,
            labelY - textHeight,
            textWidth + 10,
            textHeight + 2
          );
        }
        ctx.fill();

        // 2. Colored border around label pill
        ctx.strokeStyle = isSelected ? "#db1222" : nodeColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        // 3. Dark text outline (halo) for contrast
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.strokeText(labelText, labelX, labelY);

        // 4. Main text fill
        ctx.fillStyle = isSelected ? "#ffffff" : "#08f133";
        ctx.fillText(labelText, labelX, labelY);

        ctx.restore();
      }
    });
  }

  // Player Reachable Highlights
  if (currentViewMode === 'player') {
    Object.keys(reachableNodes).forEach(rId => {
      const target = nodes[rId];
      if (!target) return;

      const nodeType = target.type || 'path';

      // --- STYLE CONTROLS ---
      // 1. Radius: 14 for locations, 7 for everything else
      const radius = (nodeType === 'location') ? 12 : 5;

      // 2. Fill & Stroke configurations per node type
      const styleMap = {
        location: {
          fill: "rgba(242, 211, 8, 0.85)",      // Green fill for locations
          stroke: "#070707",                    // Green stroke
          lineWidth: 2.5
        },
        interaction: {
          fill: "rgba(215, 155, 110, 0.9)",     // Yellow fill for interactions
          stroke: "#0f0f0f",                    // Lime/yellow stroke
          lineWidth: 2.5
        },
        kakkabu: {
          fill: "rgba(186, 85, 211, 0.9)",    // Medium Orchid / Purple
          stroke: "#e066ff",
          lineWidth: 2.5
        },
        path: {
          fill: "rgba(212, 201, 200, 0.89)",   // Neutral gray fill for standard steps
          stroke: "#020202",                    // Orange stroke
          lineWidth: 2.5
        }
      };

      // Select style (fall back to 'path' style if type is unrecognized)
      const style = styleMap[nodeType] || styleMap.path;

      // --- DRAW HIGHLIGHT / REACHABLE CIRCLE ---
      ctx.beginPath();
      ctx.arc(target.x, target.y, radius + 6, 0, Math.PI * 2);
      ctx.fillStyle = style.fill;
      ctx.fill();
      ctx.strokeStyle = style.stroke;
      ctx.lineWidth = style.lineWidth;
      ctx.stroke();

      // --- DRAW DISTANCE LABEL ---
      const labelY = target.y - (radius + 8);

      ctx.save();
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";

      // Optional: Text Halo (Outline) so step count is legible over bright fills
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2.5;
      ctx.strokeText(`${reachableNodes[rId].dist} steps`, target.x, labelY);

      ctx.fillStyle = "#ffffff";
      ctx.fillText(`${reachableNodes[rId].dist} steps`, target.x, labelY);
      ctx.restore();
    });
  }

  // Player Token Rendering
  const isSameNode = gameState.players[0].pos === gameState.players[1].pos;

  gameState.players.forEach((p, idx) => {
    const loc = nodes[p.pos];
    if (!loc) return;

    const scale = isSameNode ? 0.75 : 1.0;
    let posX = loc.x + (isSameNode ? (idx === 0 ? -10 : 10) : 0);
    let posY = loc.y;

    ctx.beginPath();
    ctx.arc(posX, posY, 12 * scale, 0, Math.PI * 2);
    ctx.fillStyle = "#111111";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(posX, posY, 11 * scale, 0, Math.PI * 2);
    ctx.fillStyle = "#d4af37";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(posX, posY, 8.5 * scale, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(posX - (2 * scale), posY - (2 * scale), 3 * scale, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    ctx.fill();

    const playerInitial = getPlayerTokenLabel(p, idx);

    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${Math.round(9 * scale)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(playerInitial, posX, posY + (3 * scale));
  });
}

// ==========================================
// 7. CANVAS EVENTS & DEV CONTROLS
// ==========================================
if (canvas) {
  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    if (currentViewMode === 'dev') {
      const clickedNode = Object.values(nodes).find(n => Math.hypot(x - n.x, y - n.y) <= 15);
      if (clickedNode) {
        isDraggingNode = true;
        dragNodeId = clickedNode.id;
      }
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (currentViewMode === 'dev' && isDraggingNode && dragNodeId) {
      wasDragging = true;
      const rect = canvas.getBoundingClientRect();
      nodes[dragNodeId].x = Math.round(e.clientX - rect.left);
      nodes[dragNodeId].y = Math.round(e.clientY - rect.top);
      drawBoard();
    }
  });

  canvas.addEventListener('mouseup', () => {
    if (currentViewMode === 'dev' && isDraggingNode) {
      isDraggingNode = false;
      dragNodeId = null;
      setTimeout(() => { wasDragging = false; }, 0);
    }
  });

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    if (currentViewMode === 'dev') {
      handleDevSingleClick(x, y);
    } else {
      handlePlayerClick(x, y);
    }
  });

  canvas.addEventListener('dblclick', (e) => {
    if (currentViewMode !== 'dev') return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    const clickedNode = Object.values(nodes).find(n => Math.hypot(x - n.x, y - n.y) <= 15);
    if (clickedNode) {
      selectedDevNodeId = clickedNode.id;
      refreshInspector();
      drawBoard();
    }
  });
}

function handleDevSingleClick(x, y) {
  if (wasDragging) return;

  const clickedNode = Object.values(nodes).find(n => Math.hypot(x - n.x, y - n.y) <= 15);

  if (clickedNode) {
    if (selectedDevNodeId && selectedDevNodeId !== clickedNode.id) {
      toggleLink(selectedDevNodeId, clickedNode.id);
    } else {
      selectedDevNodeId = clickedNode.id;
    }
  } else {
    const newId = generateUniqueNodeId();
    nodes[newId] = {
      id: newId,
      type: "path",
      name: `Step ${autoNodeCounter}`,
      x: x,
      y: y,
      neighbors: []
    };

    if (selectedDevNodeId) {
      toggleLink(selectedDevNodeId, newId);
    }
    selectedDevNodeId = newId;
  }

  refreshInspector();
  drawBoard();
}

// ==========================================
// 8. DEV INSPECTOR & HUD MANAGEMENT
// ==========================================
function refreshInspector() {
  const inspBox = document.getElementById('node-inspector');
  if (!inspBox) return;

  if (!selectedDevNodeId || !nodes[selectedDevNodeId]) {
    inspBox.style.display = 'none';
    return;
  }

  const node = nodes[selectedDevNodeId];
  inspBox.style.display = 'flex';
  
  const idElem = document.getElementById('insp-node-id');
  const typeElem = document.getElementById('insp-type');
  const nameElem = document.getElementById('insp-name');

  if (idElem) idElem.innerText = `${node.name || node.id} (${node.id})`;
  if (typeElem) typeElem.value = node.type;
  if (nameElem) nameElem.value = node.name || "";

  const locGroup = document.getElementById('insp-location-group');
  if (locGroup) {
    if (node.type === 'location') {
      locGroup.style.display = 'block';
      const presetSelect = document.getElementById('insp-location-preset');
      if (presetSelect) presetSelect.value = node.locationName || "";
    } else {
      locGroup.style.display = 'none';
    }
  }

  const nContainer = document.getElementById('insp-neighbors');
  if (nContainer) {
    nContainer.innerHTML = '';
    node.neighbors.forEach(nId => {
      const neighborNode = nodes[nId];
      const tagLabel = neighborNode ? (neighborNode.name || nId) : nId;

      const tag = document.createElement('span');
      tag.className = 'neighbor-tag';
      tag.innerHTML = `${tagLabel} <span onclick="toggleLink('${node.id}', '${nId}')">×</span>`;
      nContainer.appendChild(tag);
    });
  }

  const connSelect = document.getElementById('insp-connect-select');
  if (connSelect) {
    connSelect.innerHTML = '<option value="">-- Select Node --</option>';
    Object.values(nodes).forEach(other => {
      if (other.id !== node.id && !node.neighbors.includes(other.id)) {
        const opt = document.createElement('option');
        opt.value = other.id;
        opt.innerText = `${other.name || other.id} (${other.id})`;
        connSelect.appendChild(opt);
      }
    });
  }
}

function updateSelectedNodeProperties() {
  if (!selectedDevNodeId || !nodes[selectedDevNodeId]) return;

  const node = nodes[selectedDevNodeId];
  const typeSelect = document.getElementById('insp-type');
  const nameInput = document.getElementById('insp-name');
  const presetSelect = document.getElementById('insp-location-preset');

  if (typeSelect) node.type = typeSelect.value;

  if (node.type === 'location') {
    const presetKey = presetSelect ? presetSelect.value : "";
    if (presetKey && LOCATION_PRESETS[presetKey]) {
      node.locationName = presetKey;
      node.name = LOCATION_PRESETS[presetKey].name;
      node.requiredItem = LOCATION_PRESETS[presetKey].requiredItem;
    } else {
      node.requiredItem = null;
    }
  } else {
    node.locationName = null;
    node.requiredItem = null;
    if (nameInput) node.name = nameInput.value.trim() || `Step ${autoNodeCounter}`;
  }

  refreshInspector();
  drawBoard();
}

function deleteSelectedNode() {
  if (!selectedDevNodeId) return;
  deleteNode(selectedDevNodeId);
  selectedDevNodeId = null;
  refreshInspector();
  drawBoard();
}

function deleteNode(id) {
  const deletedName = nodes[id] ? (nodes[id].name || id) : id;
  delete nodes[id];
  Object.values(nodes).forEach(n => {
    n.neighbors = n.neighbors.filter(i => i !== id);
  });
  log(`Deleted <strong>${deletedName}</strong>.`);
}

function toggleLink(id1, id2) {
  const n1 = nodes[id1];
  const n2 = nodes[id2];
  if (!n1 || !n2) return;

  if (n1.neighbors.includes(id2)) {
    n1.neighbors = n1.neighbors.filter(i => i !== id2);
    n2.neighbors = n2.neighbors.filter(i => i !== id1);
  } else {
    n1.neighbors.push(id2);
    n2.neighbors.push(id1);
  }
  refreshInspector();
  drawBoard();
}

function clearAllNodes() {
  if (confirm("Are you sure you want to delete all nodes from the map?")) {
    nodes = {};
    selectedDevNodeId = null;
    reachableNodes = {};
    autoNodeCounter = 1;
    refreshInspector();
    drawBoard();
    log("Cleared all map nodes.");
  }
}

// ==========================================
// 9. GAME ROLLS & TURNS
// ==========================================
function handleRoll() {
  if (gameState.hasRolled || isAnimatingMove) return;

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

  const activePlayer = gameState.players[gameState.turn];
  calculateReachableNodes(activePlayer.pos, total);

  const reachableCount = Object.keys(reachableNodes).length;
  if (reachableCount > 0) {
    log(`${activePlayer.name} rolled <strong>${total}</strong>. Select a highlighted destination.`);
  } else {
    log(`${activePlayer.name} rolled <strong>${total}</strong>, but has no accessible paths.`);
    setTimeout(() => switchTurn(), 1200);
  }

  drawBoard();
}

function switchTurn() {
  gameState.turn = (gameState.turn + 1) % 2;
  gameState.stepsRemaining = 0;
  gameState.hasRolled = false;
  reachableNodes = {};

  const stepsLeft = document.getElementById('steps-left');
  const rollBtn = document.getElementById('roll-btn');

  if (stepsLeft) stepsLeft.innerText = 0;
  if (rollBtn) rollBtn.disabled = false;

  log(`Turn switched to <strong>${gameState.players[gameState.turn].name}</strong>.`);
  updateHUD();
  drawBoard();
}

function updateHUD() {
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

function log(msg) {
  const logBox = document.getElementById('log');
  if (logBox) {
    logBox.innerHTML += `<br>• ${msg}`;
    logBox.scrollTop = logBox.scrollHeight;
  }
}

// Initial Boot Sequence
loadGameMap();