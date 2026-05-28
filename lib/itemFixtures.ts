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

export const starterBackpack: readonly BackpackSlot[] = [
  {
    id: "1c1fd0ff-f559-4b97-9f17-0d1382e9e04d",
    index: 0,
    item: ashwoodBow,
  },
  {
    id: "ade15cd7-b015-4a0e-9fcb-ef605f07d367",
    index: 1,
    item: minorHealingPotion,
  },
  {
    id: "b41c79c7-cd5b-41e3-89a0-a2f6fa7ac772",
    index: 2,
    item: emberleafTonic,
  },
  {
    id: "ff92d842-580a-4d97-8656-a2b2a2231214",
    index: 3,
    item: ironOre,
  },
  {
    id: "9ec4e240-b420-4b0f-9ee8-c58d6ac0b906",
    index: 4,
    item: wolfPelt,
  },
  {
    id: "e4aee662-3979-4813-9d55-d41b6690e6ca",
    index: 5,
    item: moonlitThread,
  },
];

export const starterEquipment: readonly EquipmentSlot[] = [
  {
    id: "7ce4ca86-3575-47f1-8483-ae34d9654e7a",
    type: "mainHand",
    item: ironShortsword,
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
];

export const starterHotbar: readonly HotbarSlot[] = [
  {
    id: "02e2b298-9a9d-4ec9-8ff1-6c45ae9b29d8",
    index: 0,
    item: minorHealingPotion,
    keybind: "1",
  },
  {
    id: "eb670f2e-c7e2-4bfa-9cd0-451d4dd79c94",
    index: 1,
    item: emberleafTonic,
    keybind: "2",
  },
];
