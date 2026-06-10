/**
 * Shared exchange/order status helpers.
 * Backend state machine (no PROCESSING):
 *   PENDING_DELIVERY -> DELIVERING | CANCELLED
 *   DELIVERING       -> COMPLETED  | CANCELLED
 */

export type ExchangeStatus =
  | "PENDING_DELIVERY"
  | "DELIVERING"
  | "COMPLETED"
  | "CANCELLED";

export const EXCHANGE_STATUSES: ExchangeStatus[] = [
  "PENDING_DELIVERY",
  "DELIVERING",
  "COMPLETED",
  "CANCELLED",
];

/** i18n key per status (under admin.exchangeRecords.*). */
export const STATUS_I18N: Record<string, string> = {
  PENDING_DELIVERY: "admin.exchangeRecords.statusPending",
  DELIVERING: "admin.exchangeRecords.statusDelivering",
  COMPLETED: "admin.exchangeRecords.statusCompleted",
  CANCELLED: "admin.exchangeRecords.statusCancelled",
};

/** Chip color styles per status. */
export const STATUS_STYLES: Record<string, { textColor: string; bgColor: string }> = {
  PENDING_DELIVERY: { textColor: "#D97706", bgColor: "#FFF7ED" },
  DELIVERING: { textColor: "#2563EB", bgColor: "#EFF6FF" },
  COMPLETED: { textColor: "#166534", bgColor: "#DCFCE7" },
  CANCELLED: { textColor: "#991B1B", bgColor: "#FEE2E2" },
};

export function statusStyle(status: string) {
  return STATUS_STYLES[status] ?? { textColor: "#64748B", bgColor: "#F1F5F9" };
}

/** Allowed next statuses given the current status (admin). */
export function nextStatuses(current: string): ExchangeStatus[] {
  switch (current) {
    case "PENDING_DELIVERY":
      return ["DELIVERING", "CANCELLED"];
    case "DELIVERING":
      return ["COMPLETED", "CANCELLED"];
    default:
      return [];
  }
}
