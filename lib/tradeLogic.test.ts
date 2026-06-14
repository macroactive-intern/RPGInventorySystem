import { describe, expect, it } from "vitest";
import type {
  BackpackSlot,
  EquipmentSlot,
  HotbarSlot,
  InventoryItem,
} from "@/types/inventory";
import { getTemplateId } from "@/lib/itemIdentity";
import type { InventoryCollections } from "@/lib/inventoryLogic";
import {
  completeTrade,
  validateTradeOffer,
  type TradeOffer,
} from "./tradeLogic";

// -- test helpers --

const makeItem = (overrides: Partial<InventoryItem> = {}): InventoryItem => ({
  id: "a0000000-0000-4000-8000-000000000001",
  name: "Test Item",
  type: "material",
  rarity: "common",
  weight: 1,
  maxStack: 1,
  quantity: 1,
  ...overrides,
});

const makeBackpackSlot = (
  id: string,
  index: number,
  item: InventoryItem | null,
): BackpackSlot => ({ id, index, item });

const makeEquipmentSlot = (
  id: string,
  type: EquipmentSlot["type"],
  item: InventoryItem | null,
): EquipmentSlot => ({ id, type, item });

const makeHotbarSlot = (
  id: string,
  index: number,
  item: InventoryItem | null,
): HotbarSlot => ({ id, index, item });

const makeInventory = (
  backpack: readonly BackpackSlot[],
  equipment: readonly EquipmentSlot[] = [],
  hotbar: readonly HotbarSlot[] = [],
): InventoryCollections => ({ backpack, equipment, hotbar });

const makeTradeOffer = (overrides: Partial<TradeOffer> = {}): TradeOffer => ({
  id: "b0000000-0000-4000-8000-000000000001",
  status: "accepted",
  initiatorItems: [],
  recipientItems: [],
  createdAt: 0,
  ...overrides,
});

/** Sums the quantity of all items matching a template ID across all containers. */
function totalQuantity(
  inventory: InventoryCollections,
  templateId: string,
): number {
  return [
    ...inventory.backpack,
    ...inventory.equipment,
    ...inventory.hotbar,
  ].reduce((sum, slot) => {
    if (!slot.item) return sum;
    return getTemplateId(slot.item) === templateId
      ? sum + slot.item.quantity
      : sum;
  }, 0);
}

// -- shared item IDs --

const SWORD_ID = "a0000000-0000-4000-8000-000000000010";
const ORE_TEMPLATE_ID = "a0000000-0000-4000-8000-000000000020";
const POTION_ID = "a0000000-0000-4000-8000-000000000030";
const HELMET_ID = "a0000000-0000-4000-8000-000000000040";

// -- tests --

describe("tradeLogic", () => {
  describe("validateTradeOffer", () => {
    it("returns valid when the offered item is in the backpack", () => {
      const sword = makeItem({
        id: SWORD_ID,
        name: "Iron Sword",
        type: "weapon",
        maxStack: 1,
        allowedSlots: ["mainHand"],
      });
      const inventory = makeInventory([
        makeBackpackSlot("c0000000-0000-4000-8000-000000000001", 0, sword),
      ]);

      const result = validateTradeOffer(inventory, [sword]);

      expect(result.valid).toBe(true);
    });

    it("returns valid when the offered item is equipped", () => {
      const helmet = makeItem({
        id: HELMET_ID,
        name: "Iron Helm",
        type: "armor",
        maxStack: 1,
        allowedSlots: ["head"],
      });
      const inventory = makeInventory(
        [],
        [makeEquipmentSlot("d0000000-0000-4000-8000-000000000001", "head", helmet)],
      );

      const result = validateTradeOffer(inventory, [helmet]);

      expect(result.valid).toBe(true);
    });

    it("returns valid when the offered item is in the hotbar", () => {
      const potion = makeItem({
        id: POTION_ID,
        name: "Potion",
        type: "consumable",
        maxStack: 10,
        quantity: 2,
      });
      const inventory = makeInventory(
        [],
        [],
        [makeHotbarSlot("e0000000-0000-4000-8000-000000000001", 0, potion)],
      );

      const result = validateTradeOffer(inventory, [potion]);

      expect(result.valid).toBe(true);
    });

    it("returns invalid when the offered item is not in any container", () => {
      const inventory = makeInventory([
        makeBackpackSlot("c0000000-0000-4000-8000-000000000002", 0, null),
      ]);

      const result = validateTradeOffer(inventory, [
        makeItem({ id: "a0000000-0000-4000-8000-000000000099" }),
      ]);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe("missing-item");
    });

    it("returns invalid when quantity offered exceeds the held amount", () => {
      const ore = makeItem({
        id: ORE_TEMPLATE_ID,
        name: "Iron Ore",
        type: "material",
        maxStack: 20,
        quantity: 2,
      });
      const inventory = makeInventory([
        makeBackpackSlot("c0000000-0000-4000-8000-000000000003", 0, ore),
      ]);

      // Offering 5 but only holds 2
      const result = validateTradeOffer(inventory, [{ ...ore, quantity: 5 }]);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe("insufficient-quantity");
    });

    it("validates split stacks by summing quantities across the same template", () => {
      const oreTemplateId = "a0000000-0000-4000-8000-000000000050";
      const oreStack1 = makeItem({
        id: "a0000000-0000-4000-8000-000000000051",
        templateId: oreTemplateId,
        name: "Iron Ore",
        type: "material",
        maxStack: 20,
        quantity: 3,
      });
      const oreStack2 = makeItem({
        id: "a0000000-0000-4000-8000-000000000052",
        templateId: oreTemplateId,
        name: "Iron Ore",
        type: "material",
        maxStack: 20,
        quantity: 3,
      });
      const inventory = makeInventory([
        makeBackpackSlot("c0000000-0000-4000-8000-000000000004", 0, oreStack1),
        makeBackpackSlot("c0000000-0000-4000-8000-000000000005", 1, oreStack2),
      ]);

      // 3 + 3 = 6 total; offering 5 should pass — different instance id, same template
      const result = validateTradeOffer(inventory, [
        makeItem({
          id: "a0000000-0000-4000-8000-000000000053",
          templateId: oreTemplateId,
          name: "Iron Ore",
          type: "material",
          maxStack: 20,
          quantity: 5,
        }),
      ]);

      expect(result.valid).toBe(true);
    });

    it("matches by template identity rather than instance id", () => {
      const templateId = "a0000000-0000-4000-8000-000000000060";
      const item = makeItem({
        id: "a0000000-0000-4000-8000-000000000061",
        templateId,
        name: "Rare Gem",
        type: "material",
        maxStack: 1,
        quantity: 1,
      });
      const inventory = makeInventory([
        makeBackpackSlot("c0000000-0000-4000-8000-000000000006", 0, item),
      ]);

      // Offered item has a different instance id but the same template id
      const offeredItem = makeItem({
        id: "a0000000-0000-4000-8000-000000000062",
        templateId,
        name: "Rare Gem",
        type: "material",
      });
      const result = validateTradeOffer(inventory, [offeredItem]);

      expect(result.valid).toBe(true);
    });
  });

  describe("completeTrade", () => {
    it("returns null when offer status is pending", () => {
      const offer = makeTradeOffer({ status: "pending" });
      const inventory = makeInventory([
        makeBackpackSlot("c0000000-0000-4000-8000-000000000010", 0, null),
      ]);

      expect(completeTrade(offer, inventory, inventory)).toBeNull();
    });

    it("returns null when offer status is completed", () => {
      const offer = makeTradeOffer({ status: "completed" });
      const inventory = makeInventory([
        makeBackpackSlot("c0000000-0000-4000-8000-000000000011", 0, null),
      ]);

      expect(completeTrade(offer, inventory, inventory)).toBeNull();
    });

    it("returns null when offer status is cancelled", () => {
      const offer = makeTradeOffer({ status: "cancelled" });
      const inventory = makeInventory([
        makeBackpackSlot("c0000000-0000-4000-8000-000000000012", 0, null),
      ]);

      expect(completeTrade(offer, inventory, inventory)).toBeNull();
    });

    it("returns null when offer status is rejected", () => {
      const offer = makeTradeOffer({ status: "rejected" });
      const inventory = makeInventory([
        makeBackpackSlot("c0000000-0000-4000-8000-000000000013", 0, null),
      ]);

      expect(completeTrade(offer, inventory, inventory)).toBeNull();
    });

    it("transfers items from initiator to recipient and vice versa", () => {
      const sword = makeItem({
        id: SWORD_ID,
        name: "Iron Sword",
        type: "weapon",
        maxStack: 1,
        allowedSlots: ["mainHand"],
      });
      const potions = makeItem({
        id: POTION_ID,
        name: "Potion",
        type: "consumable",
        maxStack: 10,
        quantity: 5,
      });

      const initiatorInventory = makeInventory([
        makeBackpackSlot("c0000000-0000-4000-8000-000000000020", 0, sword),
        makeBackpackSlot("c0000000-0000-4000-8000-000000000021", 1, null),
      ]);
      const recipientInventory = makeInventory([
        makeBackpackSlot("c0000000-0000-4000-8000-000000000022", 0, potions),
        makeBackpackSlot("c0000000-0000-4000-8000-000000000023", 1, null),
      ]);

      const offer = makeTradeOffer({
        initiatorItems: [sword],
        recipientItems: [{ ...potions, quantity: 3 }],
      });

      const result = completeTrade(offer, initiatorInventory, recipientInventory);

      expect(result).not.toBeNull();
      // Initiator gave the sword and received 3 potions
      expect(totalQuantity(result!.initiator, SWORD_ID)).toBe(0);
      expect(totalQuantity(result!.initiator, POTION_ID)).toBe(3);
      // Recipient gave 3 potions and received the sword
      expect(totalQuantity(result!.recipient, POTION_ID)).toBe(2);
      expect(totalQuantity(result!.recipient, SWORD_ID)).toBe(1);
    });

    it("conserves total item quantity across both inventories after trade", () => {
      const sword = makeItem({
        id: SWORD_ID,
        name: "Iron Sword",
        type: "weapon",
        maxStack: 1,
        allowedSlots: ["mainHand"],
      });
      const potions = makeItem({
        id: POTION_ID,
        name: "Potion",
        type: "consumable",
        maxStack: 10,
        quantity: 5,
      });

      const initiatorInventory = makeInventory([
        makeBackpackSlot("c0000000-0000-4000-8000-000000000030", 0, sword),
        makeBackpackSlot("c0000000-0000-4000-8000-000000000031", 1, null),
      ]);
      const recipientInventory = makeInventory([
        makeBackpackSlot("c0000000-0000-4000-8000-000000000032", 0, potions),
        makeBackpackSlot("c0000000-0000-4000-8000-000000000033", 1, null),
      ]);

      const offer = makeTradeOffer({
        initiatorItems: [sword],
        recipientItems: [{ ...potions, quantity: 3 }],
      });

      const result = completeTrade(offer, initiatorInventory, recipientInventory);

      expect(result).not.toBeNull();

      const swordsBefore =
        totalQuantity(initiatorInventory, SWORD_ID) +
        totalQuantity(recipientInventory, SWORD_ID);
      const swordsAfter =
        totalQuantity(result!.initiator, SWORD_ID) +
        totalQuantity(result!.recipient, SWORD_ID);
      expect(swordsAfter).toBe(swordsBefore);

      const potionsBefore =
        totalQuantity(initiatorInventory, POTION_ID) +
        totalQuantity(recipientInventory, POTION_ID);
      const potionsAfter =
        totalQuantity(result!.initiator, POTION_ID) +
        totalQuantity(result!.recipient, POTION_ID);
      expect(potionsAfter).toBe(potionsBefore);
    });

    it("returns null when initiator lacks the items they offered", () => {
      const ore = makeItem({
        id: ORE_TEMPLATE_ID,
        name: "Iron Ore",
        type: "material",
        maxStack: 20,
        quantity: 2,
      });
      const potions = makeItem({
        id: POTION_ID,
        name: "Potion",
        type: "consumable",
        maxStack: 10,
        quantity: 3,
      });

      // Initiator only has 2 ore but offers 5
      const initiatorInventory = makeInventory([
        makeBackpackSlot("c0000000-0000-4000-8000-000000000040", 0, ore),
      ]);
      const recipientInventory = makeInventory([
        makeBackpackSlot("c0000000-0000-4000-8000-000000000041", 0, potions),
        makeBackpackSlot("c0000000-0000-4000-8000-000000000042", 1, null),
      ]);

      const offer = makeTradeOffer({
        // Only has 2 ore but tries to offer 5
        initiatorItems: [{ ...ore, quantity: 5 }],
        recipientItems: [{ ...potions, quantity: 2 }],
      });

      const result = completeTrade(offer, initiatorInventory, recipientInventory);

      expect(result).toBeNull();
    });

    it("returns null when recipient lacks the items they offered", () => {
      const sword = makeItem({
        id: SWORD_ID,
        name: "Iron Sword",
        type: "weapon",
        maxStack: 1,
        allowedSlots: ["mainHand"],
      });

      const initiatorInventory = makeInventory([
        makeBackpackSlot("c0000000-0000-4000-8000-000000000050", 0, sword),
        makeBackpackSlot("c0000000-0000-4000-8000-000000000051", 1, null),
      ]);
      // Recipient offers potions but has none
      const recipientInventory = makeInventory([
        makeBackpackSlot("c0000000-0000-4000-8000-000000000052", 0, null),
      ]);

      const offer = makeTradeOffer({
        initiatorItems: [sword],
        // Recipient offers potions they don't have
        recipientItems: [makeItem({ id: POTION_ID, type: "consumable", maxStack: 10, quantity: 2 })],
      });

      const result = completeTrade(offer, initiatorInventory, recipientInventory);

      expect(result).toBeNull();
    });

    it("does not duplicate items when the same trade is completed twice", () => {
      const sword = makeItem({
        id: SWORD_ID,
        name: "Iron Sword",
        type: "weapon",
        maxStack: 1,
        allowedSlots: ["mainHand"],
      });
      const potions = makeItem({
        id: POTION_ID,
        name: "Potion",
        type: "consumable",
        maxStack: 10,
        quantity: 5,
      });

      const initiatorInventory = makeInventory([
        makeBackpackSlot("c0000000-0000-4000-8000-000000000060", 0, sword),
        makeBackpackSlot("c0000000-0000-4000-8000-000000000061", 1, null),
      ]);
      const recipientInventory = makeInventory([
        makeBackpackSlot("c0000000-0000-4000-8000-000000000062", 0, potions),
        makeBackpackSlot("c0000000-0000-4000-8000-000000000063", 1, null),
      ]);

      const offer = makeTradeOffer({
        initiatorItems: [sword],
        recipientItems: [{ ...potions, quantity: 3 }],
      });

      const result = completeTrade(offer, initiatorInventory, recipientInventory);
      expect(result).not.toBeNull();

      // Use the completed offer returned by the first call — status is already "completed"
      const secondResult = completeTrade(
        result!.offer,
        result!.initiator,
        result!.recipient,
      );

      // Status guard must block the second completion
      expect(secondResult).toBeNull();

      // Item counts after the single completed trade are exactly right
      expect(totalQuantity(result!.initiator, SWORD_ID)).toBe(0);
      expect(totalQuantity(result!.initiator, POTION_ID)).toBe(3);
      expect(totalQuantity(result!.recipient, SWORD_ID)).toBe(1);
      expect(totalQuantity(result!.recipient, POTION_ID)).toBe(2);
    });

    it("produces the same final state when the store completion action is dispatched twice", () => {
      const sword = makeItem({
        id: SWORD_ID,
        name: "Iron Sword",
        type: "weapon",
        maxStack: 1,
        allowedSlots: ["mainHand"],
      });
      const potions = makeItem({
        id: POTION_ID,
        name: "Potion",
        type: "consumable",
        maxStack: 10,
        quantity: 5,
      });

      const initiatorInventory = makeInventory([
        makeBackpackSlot("c0000000-0000-4000-8000-000000000070", 0, sword),
        makeBackpackSlot("c0000000-0000-4000-8000-000000000071", 1, null),
      ]);
      const recipientInventory = makeInventory([
        makeBackpackSlot("c0000000-0000-4000-8000-000000000072", 0, potions),
        makeBackpackSlot("c0000000-0000-4000-8000-000000000073", 1, null),
      ]);

      const offer = makeTradeOffer({
        initiatorItems: [sword],
        recipientItems: [{ ...potions, quantity: 3 }],
      });

      // Simulate the first store dispatch
      let activeOffer = offer;
      let activeInitiator = initiatorInventory;
      let activeRecipient = recipientInventory;

      const firstResult = completeTrade(activeOffer, activeInitiator, activeRecipient);
      if (firstResult) {
        activeInitiator = firstResult.initiator;
        activeRecipient = firstResult.recipient;
        activeOffer = firstResult.offer; // status: "completed", completedAt set
      }

      // Simulate the second store dispatch
      const secondResult = completeTrade(activeOffer, activeInitiator, activeRecipient);
      if (secondResult) {
        activeInitiator = secondResult.initiator;
        activeRecipient = secondResult.recipient;
      }

      // Second dispatch must be a no-op
      expect(secondResult).toBeNull();
      // Final inventories are the same object references as after the first dispatch
      expect(activeInitiator).toBe(firstResult?.initiator);
      expect(activeRecipient).toBe(firstResult?.recipient);
    });
  });
});
