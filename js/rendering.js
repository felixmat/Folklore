import { nodes, currentViewMode, gameState, selectedNodeId, selectedDevNodeId } from './state.js';
import { reachableNodes } from './pathfinding.js';
import { LOCATION_PRESETS } from './config.js';
import { returnICToDeck } from './deck.js';
import { updateHUD, log } from './state.js';
import { switchTurn } from './turnManager.js';


export let highlightedKakkabuId = null;

const canvas = document.getElementById('gameBoard');
const ctx = canvas ? canvas.getContext('2d') : null;

let isImageLoaded = false;
const boardImage = new Image();
boardImage.src = '../board_map.png';

boardImage.onload = () => {
  isImageLoaded = true;
  drawBoard();
};

boardImage.onerror = () => {
  console.warn("board_map.jpeg not found. Falling back to background rendering.");
  drawBoard();
};

export function drawBoard() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (isImageLoaded) {
    ctx.drawImage(boardImage, 0, 0, canvas.width, canvas.height);
  }

  // Use window.currentViewMode to catch mode changes from devInspector.js
  const activeViewMode = window.currentViewMode || currentViewMode;

  // Developer View Overlay
  if (activeViewMode === 'dev') {
    Object.values(nodes).forEach(node => {
      if (!node.neighbors) return;
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
      const activeSelectedId = selectedDevNodeId || selectedNodeId;
      const isSelected = activeSelectedId === node.id;
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

      // Label logic: Location nodes always show labels; other nodes only show when selected
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

        // Dark background pill
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

        // Border around label pill
        ctx.strokeStyle = isSelected ? "#db1222" : nodeColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Dark text outline
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.strokeText(labelText, labelX, labelY);

        // Main text fill
        ctx.fillStyle = isSelected ? "#ffffff" : "#08f133";
        ctx.fillText(labelText, labelX, labelY);

        ctx.restore();
      }
    });
  }

  // Player Reachable Highlights
  if (activeViewMode === 'player' && typeof reachableNodes !== 'undefined') {
    Object.keys(reachableNodes).forEach(rId => {
      const target = nodes[rId];
      if (!target) return;

      const nodeType = target.type || 'path';
      const radius = (nodeType === 'location') ? 12 : 5;

      const styleMap = {
        location: {
          fill: "rgba(242, 211, 8, 0.85)",
          stroke: "#070707",
          lineWidth: 2.5
        },
        interaction: {
          fill: "rgba(237, 181, 138, 0.9)",
          stroke: "#0f0f0f",
          lineWidth: 2.5
        },
        kakkabu: {
          fill: "rgba(81, 68, 181, 0.9)",
          stroke: "#020202",
          lineWidth: 2.5
        },
        path: {
          fill: "rgba(212, 201, 200, 0.89)",
          stroke: "#020202",
          lineWidth: 2.5
        }
      };

      
      const style = styleMap[nodeType] || styleMap.path;

      ctx.beginPath();
      ctx.arc(target.x, target.y, radius + 6, 0, Math.PI * 2);
      ctx.fillStyle = style.fill;
      ctx.fill();
      ctx.strokeStyle = style.stroke;
      ctx.lineWidth = style.lineWidth;
      ctx.stroke();

      const labelY = target.y - (radius + 8);

      ctx.save();
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";

      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2.5;
      ctx.strokeText(`${reachableNodes[rId].dist} steps`, target.x, labelY);

      ctx.fillStyle = "#ffffff";
      ctx.fillText(`${reachableNodes[rId].dist} steps`, target.x, labelY);
      ctx.restore();
    });
  }

  // 🔮 HIGHLIGHT SELECTED KAKKABU TARGET (Independent of reachableNodes loop)
  if (highlightedKakkabuId && nodes[highlightedKakkabuId]) {
    const targetNode = nodes[highlightedKakkabuId];
    ctx.save();
    ctx.beginPath();
    ctx.arc(targetNode.x, targetNode.y, (targetNode.radius || 20) + 12, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffd700'; // Gold pulse ring
    ctx.lineWidth = 4;
    ctx.setLineDash([6, 4]); // Dashed glow ring
    ctx.stroke();

    // Inner ring highlight
    ctx.beginPath();
    ctx.arc(targetNode.x, targetNode.y, (targetNode.radius || 20) + 6, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff9900';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
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

export function getPlayerTokenLabel(player, index) {
  if (player && player.name && player.name.trim().length > 0) {
    const trimmed = player.name.trim();
    if (/^player\s*\d+$/i.test(trimmed)) {
      return `P${index + 1}`;
    }
    return trimmed.charAt(0).toUpperCase();
  }
  return `P${index + 1}`;
}

export function drawPlayerToken(ctx, player, index, x, y, radius = 14) {
  ctx.save();

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = player.color || (index === 0 ? '#E74C3C' : '#3498DB');
  ctx.fill();
  
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#FFFFFF';
  ctx.stroke();

  const label = getPlayerTokenLabel(player, index);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y);

  ctx.restore();
}

export function setHighlightedKakkabu(nodeId) {
  highlightedKakkabuId = nodeId;
  drawBoard();
}


export function showICCardModal(card, onCloseCallback) {
    const modal = document.getElementById('ic-card-modal');
    if (!modal) {
        console.error("ic-card-modal element not found in HTML!");
        if (onCloseCallback) onCloseCallback();
        return;
    }

    // Sanitize category string (defaults to neutral if missing)
    const category = (card.cat || 'neutral').toLowerCase();
    const categoryClass = `cat-${category}`;
    const categoryLabel = category.toUpperCase();

    modal.innerHTML = `
        <div class="ic-card-container ${categoryClass}">
            <span class="ic-card-badge">${categoryLabel} 🎴</span>
            
            <div class="ic-card-header">
                <h2 class="ic-card-title">${card.name || 'Encounter'}</h2>
            </div>
            
            <div class="ic-card-art">
                <span class="ic-card-art-icon">${card.icon || '📜'}</span>
            </div>

            <div class="ic-card-body">
                <p style="margin: 0;">${card.description || 'An interaction site encounter takes place...'}</p>
            </div>

            <div class="ic-card-footer">
                <button id="ic-close-btn" class="ic-card-btn">
                    Return Card & End Turn
                </button>
            </div>
        </div>
    `;

    modal.style.display = 'flex';

    document.getElementById('ic-close-btn').addEventListener('click', () => {
        modal.style.display = 'none';
        if (typeof returnICToDeck === 'function') {
            returnICToDeck(card);
        }
        if (onCloseCallback) onCloseCallback();
    }, { once: true });
}

// Global exposure
window.showICCardModal = showICCardModal