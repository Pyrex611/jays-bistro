import { createContext, useContext } from "react";

export const MenuContext = createContext(null);

/** Access the menu model: { activeItems, byId, categories, hero, subhero }. */
export function useMenu() {
  const value = useContext(MenuContext);
  if (!value) throw new Error("useMenu must be used inside <MenuProvider>");
  return value;
}
