import type {
  BackpackSlot,
  EquipmentSlot,
  HotbarSlot,
  InventoryItem,
} from "@/types/inventory";

const ironShortsword: InventoryItem = {
  id: "3a5d9f2e-8b1c-4f5a-a3e6-2f6f81b0e017",
  name: "Iron Shortsword",
  description: "A dependable one-handed blade issued to new adventurers.",
  type: "weapon",
  rarity: "common",
  stats: {
    strength: 1,
    damageMin: 4,
    damageMax: 8,
  },
  weight: 2.7,
  maxStack: 1,
  quantity: 1,
  allowedSlots: ["mainHand", "offHand"],
};

const ashwoodBow: InventoryItem = {
  id: "c9f1aeb3-6cb6-4ef8-8cc1-761f78ab3f9d",
  name: "Ashwood Hunting Bow",
  description: "A light bow with a polished grip and steady draw.",
  type: "weapon",
  rarity: "uncommon",
  stats: {
    dexterity: 2,
    damageMin: 3,
    damageMax: 10,
    criticalChance: 0.03,
  },
  weight: 1.9,
  maxStack: 1,
  quantity: 1,
  allowedSlots: ["mainHand"],
};

const ironSword: InventoryItem = {
  id: "45d06f48-cc3d-48d2-b8bc-c3db83ed4bb2",
  name: "Iron Sword",
  description: "A freshly forged blade with a simple leather-wrapped grip.",
  type: "weapon",
  rarity: "uncommon",
  stats: {
    strength: 2,
    damageMin: 6,
    damageMax: 11,
  },
  weight: 3.1,
  maxStack: 1,
  quantity: 1,
  allowedSlots: ["mainHand", "offHand"],
};

const leatherCap: InventoryItem = {
  id: "8b11ca98-5543-4b09-85c4-21fa31d9ac48",
  name: "Reinforced Leather Cap",
  description: "Layered leather protection with a stitched brow guard.",
  type: "armor",
  rarity: "common",
  stats: {
    armor: 2,
    dexterity: 1,
  },
  weight: 0.8,
  maxStack: 1,
  quantity: 1,
  allowedSlots: ["head"],
};

const chainmailVest: InventoryItem = {
  id: "16f3471c-f5eb-4619-bf9a-071cc7acb57e",
  name: "Worn Chainmail Vest",
  description: "A repaired mail shirt that still turns a blade.",
  type: "armor",
  rarity: "uncommon",
  stats: {
    armor: 7,
    vitality: 1,
  },
  weight: 9.4,
  maxStack: 1,
  quantity: 1,
  allowedSlots: ["chest"],
};

const travelersLeggings: InventoryItem = {
  id: "c06bca9d-354a-4d27-8cb7-59909b3be409",
  name: "Traveler's Padded Leggings",
  description: "Quilted cloth leggings reinforced at the knees.",
  type: "armor",
  rarity: "common",
  stats: {
    armor: 3,
    vitality: 1,
  },
  weight: 1.6,
  maxStack: 1,
  quantity: 1,
  allowedSlots: ["legs"],
};

const garnetRing: InventoryItem = {
  id: "d7b56c55-ff85-4a5d-99e2-498023c42d86",
  name: "Garnet Ring of Focus",
  description: "A brass ring set with a tiny red garnet.",
  type: "accessory",
  rarity: "rare",
  stats: {
    intelligence: 2,
    manaRestore: 5,
  },
  weight: 0.05,
  maxStack: 1,
  quantity: 1,
  allowedSlots: ["ring"],
};

const stitchedBackpack: InventoryItem = {
  id: "2edbe0a5-fb9c-4898-a619-91fbe62e48ed",
  name: "Stitched Trail Backpack",
  description: "A reinforced pack sewn from cured hide and moonlit thread.",
  type: "accessory",
  rarity: "uncommon",
  stats: {
    vitality: 1,
  },
  weight: 1.1,
  maxStack: 1,
  quantity: 1,
  allowedSlots: ["back"],
};

const minorHealingPotion: InventoryItem = {
  id: "ba8c4d7c-0f2d-4f2c-9de8-8210c795f9c8",
  name: "Minor Healing Potion",
  description: "A bitter red tonic that closes small wounds.",
  type: "consumable",
  rarity: "common",
  stats: {
    healthRestore: 35,
  },
  weight: 0.3,
  maxStack: 10,
  quantity: 6,
};

const emberleafTonic: InventoryItem = {
  id: "43718ace-a47d-4af5-8eb2-3683d7ee0d56",
  name: "Emberleaf Tonic",
  description: "A warm herbal draught that sharpens the senses briefly.",
  type: "consumable",
  rarity: "uncommon",
  stats: {
    dexterity: 1,
    healthRestore: 15,
  },
  weight: 0.25,
  maxStack: 5,
  quantity: 2,
};

const ironOre: InventoryItem = {
  id: "5b7ba891-9a21-4402-a0d0-42477b913c91",
  name: "Iron Ore",
  description: "A dense chunk of raw ore ready for smelting.",
  type: "material",
  rarity: "common",
  stats: {},
  weight: 1.8,
  maxStack: 20,
  quantity: 12,
};

const wood: InventoryItem = {
  id: "7de86bb0-61ee-4c08-93de-cd3476a53634",
  name: "Wood",
  description: "Seasoned hardwood suitable for handles, hafts, and frames.",
  type: "material",
  rarity: "common",
  stats: {},
  weight: 0.7,
  maxStack: 20,
  quantity: 8,
};

const wolfPelt: InventoryItem = {
  id: "f6130174-3f67-4412-94f5-a8e1a1447e6e",
  name: "Cured Wolf Pelt",
  description: "A rugged hide used by tailors and leatherworkers.",
  type: "material",
  rarity: "common",
  stats: {},
  weight: 1.2,
  maxStack: 15,
  quantity: 4,
};

const moonlitThread: InventoryItem = {
  id: "949fdc30-38bc-471f-ae5d-86e77e471432",
  name: "Moonlit Thread",
  description: "Silvery thread that glimmers under torchlight.",
  type: "material",
  rarity: "rare",
  stats: {
    intelligence: 1,
  },
  weight: 0.02,
  maxStack: 50,
  quantity: 9,
};

const backpackSlotIds = [
  "1c1fd0ff-f559-4b97-9f17-0d1382e9e04d",
  "ade15cd7-b015-4a0e-9fcb-ef605f07d367",
  "b41c79c7-cd5b-41e3-89a0-a2f6fa7ac772",
  "ff92d842-580a-4d97-8656-a2b2a2231214",
  "9ec4e240-b420-4b0f-9ee8-c58d6ac0b906",
  "e4aee662-3979-4813-9d55-d41b6690e6ca",
  "f3ec1167-bca7-4aa7-b579-5a93023cae49",
  "7f496f16-4676-46b3-9187-d5c42d98cd5d",
  "2e46d923-ced5-4941-81d4-6771110c2374",
  "437ef128-4aa9-4707-a66c-6cd034156736",
  "6217f3c3-88ea-457f-94c8-89405d36c742",
  "b4a7930a-f1de-4caf-9254-357a87851a51",
  "d00fbf24-e572-430c-8eb7-2d42d3e999b6",
  "7e9e8378-46ac-4af3-bf1d-0d08f28b0ea1",
  "01eb0461-b9db-4a9a-a97b-2b00b0b5c62a",
  "d40a94dc-ddd1-48d7-88ef-94d4ce1937d8",
  "88fe3efc-c98e-40f4-9796-7ddab05a5c3f",
  "4937dbf4-0c1e-4406-b6df-3ad5414705a6",
  "aa0920c5-3bc3-4b86-8bec-4505a896af43",
  "760bb847-ecb4-4ec6-895e-942c27d94610",
  "c3efe276-b0c3-454b-ae96-17b55349fc59",
  "66ee613d-aacc-4966-ae25-c072a6631d58",
  "6e74e21a-9a58-4374-8356-a34bc8186095",
  "8a1796b5-2eff-4755-a1dc-3c7189c0846f",
  "cb81e30e-391f-4b7c-86cd-3481991a9254",
  "74dffae4-76fa-44f3-bae6-bf5a7bb86c32",
  "ca2fe1e9-99a3-4dfa-a0c3-6971d7303c34",
  "ce27a89c-54e6-4311-987c-d53fb82fba97",
  "0ecf4280-21e5-4b49-b3d0-d3fa9ad47cf3",
  "bd04f9ee-85f7-4515-beba-e1142a5e11c7",
] as const;

const starterBackpackItems: Record<number, InventoryItem> = {
  0: ashwoodBow,
  1: minorHealingPotion,
  2: emberleafTonic,
  3: ironOre,
  4: wolfPelt,
  5: moonlitThread,
  6: wood,
};

export const itemTemplates = {
  ironOre,
  ironSword,
  moonlitThread,
  stitchedBackpack,
  wood,
  wolfPelt,
} as const;

export const starterBackpack: readonly BackpackSlot[] = backpackSlotIds.map(
  (id, index) => ({
    id,
    index,
    item: starterBackpackItems[index] ?? null,
  }),
);

export const starterEquipment: readonly EquipmentSlot[] = [
  {
    id: "7ce4ca86-3575-47f1-8483-ae34d9654e7a",
    type: "mainHand",
    item: ironShortsword,
  },
  {
    id: "706db9cb-c957-4f7e-8017-bad4f6d6cc2f",
    type: "offHand",
    item: null,
  },
  {
    id: "9e084960-e4bc-44c8-9e90-f5954d7ef408",
    type: "head",
    item: leatherCap,
  },
  {
    id: "fdd18c20-25dd-4d20-8888-061461c3b89c",
    type: "chest",
    item: chainmailVest,
  },
  {
    id: "a32e689b-6c2c-427d-8805-bbbec1545fd7",
    type: "legs",
    item: travelersLeggings,
  },
  {
    id: "8851aa5d-a46b-4574-9af6-5d76a92a63f8",
    type: "ring",
    item: garnetRing,
  },
  {
    id: "08c0df6e-a08c-4ef6-a742-5652922842df",
    type: "ring",
    item: null,
  },
  {
    id: "42767660-6fc8-41ba-a0f9-f2de5a46b96f",
    type: "back",
    item: null,
  },
];

const hotbarSlotIds = [
  "02e2b298-9a9d-4ec9-8ff1-6c45ae9b29d8",
  "eb670f2e-c7e2-4bfa-9cd0-451d4dd79c94",
  "bbab1eef-8fd6-43d1-8bc7-01eadc446839",
  "ec0e66a3-e109-44cd-ae70-3805179f8799",
  "97cd19d2-7758-4e19-bd99-d534e9ece0f0",
] as const;

const starterHotbarItems: Record<number, InventoryItem> = {
  0: createItemInstance(
    minorHealingPotion,
    "9a5d91c5-80d8-4a91-a85d-1a617749555d",
  ),
  1: createItemInstance(
    emberleafTonic,
    "6a35e865-1a6d-421e-8c50-9882b1235bf1",
  ),
};

export const starterHotbar: readonly HotbarSlot[] = hotbarSlotIds.map(
  (id, index) => ({
    id,
    index,
    item: starterHotbarItems[index] ?? null,
    keybind: String(index + 1),
  }),
);

function createItemInstance(item: InventoryItem, id: string): InventoryItem {
  return {
    ...item,
    id,
    templateId: item.templateId ?? item.id,
  };
}
