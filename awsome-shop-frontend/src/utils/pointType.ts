import type { TFunction } from "i18next";

/**
 * Shared point-transaction type helpers.
 * Backend PointTransactionDTO.type enum:
 *   EARN         - points earned
 *   REDEEM       - points spent on a redemption
 *   ADJUST       - manual admin adjustment
 *   INIT         - initial grant on account creation
 *   DISTRIBUTION - scheduled / periodic distribution
 */

export type PointTransactionType =
  | "EARN"
  | "REDEEM"
  | "ADJUST"
  | "INIT"
  | "DISTRIBUTION";

export const POINT_TRANSACTION_TYPES: PointTransactionType[] = [
  "EARN",
  "REDEEM",
  "ADJUST",
  "INIT",
  "DISTRIBUTION",
];

/** i18n key per type (under points.type.*). */
export const POINT_TYPE_I18N: Record<string, string> = {
  EARN: "points.type.EARN",
  REDEEM: "points.type.REDEEM",
  ADJUST: "points.type.ADJUST",
  INIT: "points.type.INIT",
  DISTRIBUTION: "points.type.DISTRIBUTION",
};

/** Chip color styles per type. */
export const POINT_TYPE_STYLES: Record<
  string,
  { textColor: string; bgColor: string }
> = {
  EARN: { textColor: "#166534", bgColor: "#DCFCE7" },
  REDEEM: { textColor: "#D97706", bgColor: "#FFF7ED" },
  ADJUST: { textColor: "#2563EB", bgColor: "#EFF6FF" },
  INIT: { textColor: "#7C3AED", bgColor: "#EDE9FE" },
  DISTRIBUTION: { textColor: "#0891B2", bgColor: "#ECFEFF" },
};

/**
 * Localized label for a transaction type.
 * Falls back to the raw backend value when the type is unknown.
 */
export function pointTypeLabel(type: string, t: TFunction): string {
  const key = POINT_TYPE_I18N[type];
  return key ? t(key) : type;
}

/** Chip color style for a transaction type, with a neutral fallback. */
export function pointTypeStyle(type: string) {
  return POINT_TYPE_STYLES[type] ?? { textColor: "#64748B", bgColor: "#F1F5F9" };
}
