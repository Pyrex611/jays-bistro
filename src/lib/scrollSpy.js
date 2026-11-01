/**
 * Which menu group is "current" while the user scrolls? Pure so it can be tested.
 * @param {Array<{name:string, top:number}>} groups  ordered; `top` = distance of the group's first card from the viewport top
 * @param {number} threshold  a group becomes current once its first card has risen above this line
 * @param {boolean} atBottom  page scrolled to the very end → last group is current (short final groups would never cross the line)
 */
export function pickActiveGroup(groups, threshold, atBottom = false) {
  if (groups.length === 0) return null;
  if (atBottom) return groups[groups.length - 1].name;
  let active = groups[0].name;
  for (const g of groups) if (g.top <= threshold) active = g.name;
  return active;
}
