/** Kitchen workflow for a paid order. */
export const STATUSES = ["new", "preparing", "ready", "completed"];

export const STATUS_LABEL = { new: "New", preparing: "Preparing", ready: "Ready", completed: "Completed" };

/** The single next action for an order, or null when finished. `fulfilment` words the final step. */
export function nextAction(status, fulfilment) {
  switch (status) {
    case "new": return { to: "preparing", label: "Start preparing" };
    case "preparing": return { to: "ready", label: fulfilment === "delivery" ? "Ready for rider" : "Ready for pickup" };
    case "ready": return { to: "completed", label: fulfilment === "delivery" ? "Mark delivered" : "Mark collected" };
    default: return null;
  }
}
