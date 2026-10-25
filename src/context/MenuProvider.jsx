import { useMemo } from "react";
import { MenuContext } from "./MenuContext.js";
import { CATEGORIES, MENU_ITEMS } from "../data/menu.js";
import { HERO_ITEM_IDS, SUBHERO_ITEM_IDS } from "../data/layout.js";
import { buildMenuModel } from "../lib/menuModel.js";

/**
 * Single source of menu data for the UI.
 * Phase 2: swap the static imports for a Supabase-backed fetch (with a loading state);
 * consumers keep using useMenu() unchanged.
 */
export default function MenuProvider({ children }) {
  const value = useMemo(
    () =>
      buildMenuModel({
        items: MENU_ITEMS,
        categories: CATEGORIES,
        heroIds: HERO_ITEM_IDS,
        subheroIds: SUBHERO_ITEM_IDS,
      }),
    [],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}
