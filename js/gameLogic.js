export function playerHasItem(player, itemName) {
  if (!itemName) return true;
  if (!player || !player.items) return false;
  return player.items.some(
    i => i && i.name && i.name.trim().toLowerCase() === itemName.trim().toLowerCase()
  );
}