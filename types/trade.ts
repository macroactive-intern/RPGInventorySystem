import type { InventoryItem, UUID } from "@/types/inventory";

export type TradeStatus =
  | "pending"
  | "offered"
  | "accepted"
  | "completed"
  | "rejected"
  | "cancelled";

export interface TradeOffer {
  id: UUID;
  initiatorItems: readonly InventoryItem[];
  recipientItems: readonly InventoryItem[];
  status: TradeStatus;
  createdAt: number;
  completedAt?: number;
}
