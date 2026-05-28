/** Stable UUID string used for persistent inventory entity identity. */
export type UUID = string;

/** High-level category that describes what kind of item this is. */
export type ItemType =
  | "weapon"
  | "armor"
  | "accessory"
  | "consumable"
  | "material"
  | "quest"
  | "currency";

/** Loot quality tier used for item display, sorting, and drop tables. */
export type Rarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary"
  | "mythic";

/** Equipment location where an item can be equipped by a character. */
export type SlotType =
  | "head"
  | "chest"
  | "hands"
  | "legs"
  | "feet"
  | "mainHand"
  | "offHand"
  | "neck"
  | "ring"
  | "trinket";

/** Numeric stat modifiers an item can grant when equipped or consumed. */
export interface ItemStats {
  strength?: number;
  dexterity?: number;
  intelligence?: number;
  vitality?: number;
  armor?: number;
  damageMin?: number;
  damageMax?: number;
  criticalChance?: number;
  criticalDamage?: number;
  healthRestore?: number;
  manaRestore?: number;
}

/** Core item record stored in inventory, equipment, or hotbar slots. */
export interface InventoryItem {
  id: UUID;
  name: string;
  description?: string;
  type: ItemType;
  rarity: Rarity;
  iconUrl?: string;
  stats?: ItemStats;
  weight: number;
  maxStack: number;
  quantity: number;
  allowedSlots?: readonly SlotType[];
}

/** Character equipment slot that can hold one compatible item. */
export interface EquipmentSlot {
  id: UUID;
  type: SlotType;
  item: InventoryItem | null;
}

/** Backpack grid slot that can hold an item stack at an inventory index. */
export interface BackpackSlot {
  id: UUID;
  index: number;
  item: InventoryItem | null;
}

/** Quick-access slot for usable items or actions pinned to the hotbar. */
export interface HotbarSlot {
  id: UUID;
  index: number;
  item: InventoryItem | null;
  keybind?: string;
}
