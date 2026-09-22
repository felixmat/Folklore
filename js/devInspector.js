import { 
  nodes, 
  setNodes, 
  selectedDevNodeId, 
  setSelectedDevNodeId, 
  isDraggingNode, 
  setIsDraggingNode, 
  dragNodeId, 
  setDragNodeId, 
  wasDragging, 
  setWasDragging, 
  reachableNodes, 
  setReachableNodes, 
  generateUniqueNodeId, 
  resetAutoNodeCounter, 
  log,
  getNextStepNumber 
} from './state.js';
import { drawBoard } from './rendering.js';
import { LOCATION_PRESETS } from './config.js';

let clickTimer = null;

export function setViewMode(mode) {
  window.currentViewMode = mode;
  const pBtn = document.getElementById('mode-player-btn');
  const dBtn = document.getElementById('mode-dev-btn');
  const dPanel = document.getElementById('dev-panel');
  const pHud = document.getElementById('player-hud-group');

  if (pBtn) pBtn.classList.toggle('active', mode === 'player');
  if (dBtn) dBtn.classList.toggle('active', mode === 'dev');
  if (dPanel) dPanel.style.display = mode === 'dev' ? 'flex' : 'none';
  if (pHud) pHud.style.display = mode === 'player' ? 'flex' : 'none';

  if (mode === 'player') setSelectedDevNodeId(null);
  refreshInspector();
  drawBoard();
}

export function handleDevSingleClick(x, y) {
  if (wasDragging) return;

  const clickedNode = Object.values(nodes).find(n => Math.hypot(x - n.x, y - n.y) <= 15);

  if (clickedNode) {
    // Single click on an existing node: Link or unlink with selected node
    if (selectedDevNodeId && selectedDevNodeId !== clickedNode.id) {
      toggleLink(selectedDevNodeId, clickedNode.id);
    }
  } else {
    // Single click on empty canvas: Create new node & auto-link to selected node
    const newId = generateUniqueNodeId();
    const nextStepNum = getNextStepNumber();
    nodes[newId] = {
      id: newId,
      type: "path",
      name: `Step ${nextStepNum}`,
      x: x,
      y: y,
      neighbors: []
    };

    if (selectedDevNodeId) {
      toggleLink(selectedDevNodeId, newId);
    }
    setSelectedDevNodeId(newId);
  }

  refreshInspector();
  drawBoard();
}

export function handleDevDoubleClick(x, y) {
  const clickedNode = Object.values(nodes).find(n => Math.hypot(x - n.x, y - n.y) <= 15);

  if (clickedNode) {
    // Double click node: Select it in Inspector
    setSelectedDevNodeId(clickedNode.id);
  } else {
    // Double click empty canvas: Deselect node
    setSelectedDevNodeId(null);
  }

  refreshInspector();
  drawBoard();
}

/**
 * Initializes canvas click listeners with single/double-click debouncing.
 * Call this once when initializing your app in main.js.
 */
export function initDevCanvasListeners() {
  const canvas = document.getElementById('gameBoard');
  if (!canvas || canvas.dataset.devListenersAttached) return;

  canvas.addEventListener('click', (e) => {
    if (window.currentViewMode !== 'dev') return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => {
      handleDevSingleClick(x, y);
    }, 220); // 220ms delay allows double-clicks to take precedence
  });

  canvas.addEventListener('dblclick', (e) => {
    if (window.currentViewMode !== 'dev') return;

    clearTimeout(clickTimer); // Prevents single-click action on double-click

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    handleDevDoubleClick(x, y);
  });

  canvas.dataset.devListenersAttached = 'true';
}

export function refreshInspector() {
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
      tag.innerHTML = `${tagLabel} <span class="remove-link-btn" data-n1="${node.id}" data-n2="${nId}">×</span>`;
      nContainer.appendChild(tag);
    });

    nContainer.querySelectorAll('.remove-link-btn').forEach(btn => {
      btn.onclick = (e) => toggleLink(e.target.dataset.n1, e.target.dataset.n2);
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

export function updateSelectedNodeProperties() {
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
    if (nameInput) node.name = nameInput.value.trim() || `Step`;
  }

  refreshInspector();
  drawBoard();
}

export function deleteSelectedNode() {
  if (!selectedDevNodeId) return;
  deleteNode(selectedDevNodeId);
  setSelectedDevNodeId(null);
  refreshInspector();
  drawBoard();
}

export function deleteNode(id) {
  const deletedName = nodes[id] ? (nodes[id].name || id) : id;
  delete nodes[id];
  Object.values(nodes).forEach(n => {
    n.neighbors = n.neighbors.filter(i => i !== id);
  });
  log(`Deleted <strong>${deletedName}</strong>.`);
}

export function toggleLink(id1, id2) {
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

export function clearAllNodes() {
  if (confirm("Are you sure you want to delete all nodes from the map?")) {
    setNodes({});
    setSelectedDevNodeId(null);
    setReachableNodes({});
    resetAutoNodeCounter();
    refreshInspector();
    drawBoard();
    log("Cleared all map nodes.");
  }
}

export function exportMapJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(nodes, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "game_map_nodes.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  log("Exported map configuration to JSON.");
}

export function triggerImportJSON() {
  const fileInput = document.getElementById('import-json-file');
  if (fileInput) fileInput.click();
}

export function importMapJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedNodes = JSON.parse(e.target.result);
      if (typeof importedNodes === 'object' && importedNodes !== null) {
        setNodes(importedNodes);
        setSelectedDevNodeId(null);
        setReachableNodes({});
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