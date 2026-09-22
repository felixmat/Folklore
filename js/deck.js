//----- ITEM & IC DECKS ------------
import { GOLDEN_ITEMS, NORMAL_CATEGORIES, IC_CARDS } from "./config.js";

// Global Deck Storage
export const decks = {
  item: [],
  ic: []
};

// Compatibility export so code reading mainDeck directly doesn't break
export let mainDeck = decks.item;

// ==========================================
// 1. UI SYNC FUNCTION
// ==========================================

export function updateDeckUI() {
  const itemBadge = document.getElementById('item-deck-count');
  if (itemBadge) {
    itemBadge.innerText = decks.item.length;
  }

  const icBadge = document.getElementById('ic-deck-count');
  if (icBadge) {
    icBadge.innerText = decks.ic.length;
  }
}

// ==========================================
// 2. CORE SHUFFLE & RETURN UTILITIES
// ==========================================

export function shuffleDeck(deckArray = decks.item) {
  const target = Array.isArray(deckArray) ? deckArray : decks.item;
  for (let i = target.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [target[i], target[j]] = [target[j], target[i]];
  }
  updateDeckUI();
}

export function drawFromDeck(deckKey, rebuildFn = null) {
  const deck = decks[deckKey];
  if (!deck) return null;

  if (deck.length === 0 && typeof rebuildFn === 'function') {
    rebuildFn();
  }

  const drawn = deck.pop();
  updateDeckUI(); // Always update UI immediately after draw
  return drawn;
}

export function returnToDeck(deckKey, card) {
  if (!card || !decks[deckKey]) return;

  // 1. Create a clean deep copy of the item object
  const cardCopy = typeof card === 'object' ? { ...card } : card;

  // 2. Return to deck array
  decks[deckKey].push(cardCopy);

  // 3. Reshuffle and update UI
  shuffleDeck(decks[deckKey]);
  updateDeckUI();
}

// ==========================================
// 3. ITEM DECK FUNCTIONS
// ==========================================

export function buildCombinedDeck() {
  decks.item = [];

  GOLDEN_ITEMS.forEach(item => {
    decks.item.push({ name: item, cat: "golden" }, { name: item, cat: "golden" });
  });

  NORMAL_CATEGORIES.forEach(c => {
    for (let i = 0; i < 4; i++) {
      decks.item.push({ name: c.name, cat: c.cat });
    }
  });

  shuffleDeck(decks.item);
  mainDeck = decks.item;
  updateDeckUI();
}

export function drawItem() {
  return drawFromDeck('item', buildCombinedDeck);
}

export function returnItemToDeck(item) {
  returnToDeck('item', item);
}

// ==========================================
// 4. IC CARD DECK FUNCTIONS
// ==========================================

export function buildICDeck() {
  if (Array.isArray(IC_CARDS) && IC_CARDS.length > 0) {
    // Deep copy card objects so original definitions aren't mutated
    decks.ic = IC_CARDS.map(card => ({ ...card }));
    shuffleDeck(decks.ic);
  } else {
    console.error("IC_CARDS data missing or empty in config.js!", IC_CARDS);
  }
}

export function drawICCard() {
  // If IC deck is empty, auto-build it from IC_CARDS
  if (!decks.ic || decks.ic.length === 0) {
    buildICDeck();
  }

  // If still empty (e.g. config issue), return null
  if (!decks.ic || decks.ic.length === 0) {
    console.warn("drawICCard: IC deck is completely empty!");
    return null;
  }

  const drawn = decks.ic.pop();
  updateDeckUI(); // 👈 FIXED: Sync deck counter badge on draw!
  return drawn;
}

export function returnICToDeck(card) {
  if (!card) return;
  if (!decks.ic) decks.ic = [];
  
  decks.ic.push(typeof card === 'object' ? { ...card } : card);
  shuffleDeck(decks.ic);
  updateDeckUI(); // 👈 FIXED: Sync deck counter badge on return!
}

// ==========================================
// 5. INITIALIZATION
// ==========================================

export function initializeDecks() {
  buildCombinedDeck();
  buildICDeck();
  updateDeckUI();
}

// Auto-initialize decks when deck.js is loaded
initializeDecks();