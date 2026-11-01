/**
 * What is connected, for the console's "Going live" cards. Pure: derived from `capabilities` (reported by /api/menu)
 * plus whether the console is running on the demo backend.
 * state: "connected" | "demo" | "planned"
 */
export function integrationStatus(capabilities, demo) {
  const payments = capabilities?.payments;
  const paymentsConnected = !demo && (payments === "live" || payments === "test");
  return [
    {
      key: "storage",
      name: "Storage (Vercel Blob)",
      state: demo ? "demo" : "connected",
      label: demo ? "Demo · this browser only" : "Connected",
      tone: demo ? "demo" : "good",
    },
    {
      key: "payments",
      name: "Payments (Paystack)",
      state: paymentsConnected ? "connected" : "demo",
      label: paymentsConnected ? (payments === "live" ? "Live" : "Test mode") : "Demo checkout",
      tone: payments === "live" && !demo ? "good" : paymentsConnected ? "warn" : "demo",
    },
    {
      key: "email",
      name: "Kitchen email alerts",
      state: capabilities?.email ? "connected" : "demo",
      label: capabilities?.email ? "Connected" : "Simulated",
      tone: capabilities?.email ? "good" : "demo",
    },
    {
      key: "orderStatus",
      name: "Order tracking",
      state: capabilities?.orderStatus ? "connected" : demo ? "demo" : "planned",
      label: capabilities?.orderStatus ? "Connected" : demo ? "Demo workflow" : "Coming soon",
      tone: capabilities?.orderStatus ? "good" : demo ? "demo" : "soon",
    },
  ];
}
