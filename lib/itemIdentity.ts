import type { InventoryItem, UUID } from "@/types/inventory";

export function getTemplateId(item: InventoryItem): UUID {
  return item.templateId ?? item.id;
}
