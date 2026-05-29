"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type Active,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
  type Over,
  type ScreenReaderInstructions,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ContextMenu } from "@/components/inventory/ContextMenu";
import { DragOverlayItem } from "@/components/inventory/DragOverlayItem";
import { ItemInspectionModal } from "@/components/inventory/ItemInspectionModal";
import { ItemTooltip } from "@/components/inventory/ItemTooltip";
import { SplitStackModal } from "@/components/inventory/SplitStackModal";
import {
  TooltipPositionProvider,
  useTooltipPosition,
} from "@/components/inventory/TooltipPositionProvider";
import { isSameSlot } from "@/lib/inventoryLogic";
import { useInventoryStore, type SlotPointer } from "@/store/inventoryStore";
import type { InventoryItem } from "@/types/inventory";

export interface InventoryDragData {
  item: InventoryItem;
  source: SlotPointer;
}

interface InventoryDropData {
  slot: SlotPointer;
}

interface InventoryDndProviderProps {
  children: ReactNode;
}

const inventoryScreenReaderInstructions: ScreenReaderInstructions = {
  draggable:
    "To pick up an inventory item, press Space or Enter. Use the arrow keys to move between inventory slots. Press Space or Enter again to drop the item, or Escape to cancel.",
};

const inventoryAnnouncements: Announcements = {
  onDragStart({ active }) {
    const dragData = getInventoryDragData(active);

    return dragData
      ? `Picked up ${dragData.item.name} from ${formatSlotLabel(dragData.source)}.`
      : "Picked up inventory item.";
  },
  onDragOver({ active, over }) {
    const dragData = getInventoryDragData(active);
    const dropData = getInventoryDropData(over);

    if (!dragData) {
      return undefined;
    }

    return dropData
      ? `${dragData.item.name} is over ${formatSlotLabel(dropData.slot)}.`
      : `${dragData.item.name} is not over a valid inventory slot.`;
  },
  onDragEnd({ active, over }) {
    const dragData = getInventoryDragData(active);
    const dropData = getInventoryDropData(over);

    if (!dragData) {
      return "Inventory item released.";
    }

    return dropData
      ? `Released ${dragData.item.name} over ${formatSlotLabel(dropData.slot)}.`
      : `${dragData.item.name} returned to ${formatSlotLabel(dragData.source)}.`;
  },
  onDragCancel({ active }) {
    const dragData = getInventoryDragData(active);

    return dragData
      ? `Cancelled dragging ${dragData.item.name}. It returned to ${formatSlotLabel(dragData.source)}.`
      : "Cancelled inventory drag.";
  },
};

export function InventoryDndProvider({ children }: InventoryDndProviderProps) {
  const draggedItem = useInventoryStore((state) => state.draggedItem);
  const clearRejectedSlot = useInventoryStore((state) => state.clearRejectedSlot);
  const closeContextMenu = useInventoryStore((state) => state.closeContextMenu);
  const moveItem = useInventoryStore((state) => state.moveItem);
  const setRejectedSlot = useInventoryStore((state) => state.setRejectedSlot);
  const setDraggedItem = useInventoryStore((state) => state.setDraggedItem);
  const setTooltip = useInventoryStore((state) => state.setTooltip);
  const rejectionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    return () => {
      if (rejectionTimer.current) {
        clearTimeout(rejectionTimer.current);
      }
    };
  }, []);

  function restartRejectionTimer() {
    if (rejectionTimer.current) {
      clearTimeout(rejectionTimer.current);
    }

    rejectionTimer.current = setTimeout(clearRejectedSlot, 500);
  }

  function handleDragStart(event: DragStartEvent) {
    const dragData = event.active.data.current;

    if (isInventoryDragData(dragData)) {
      closeContextMenu();
      setTooltip(null);
      setDraggedItem({
        item: dragData.item,
        source: dragData.source,
      });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const dragData = event.active.data.current;
    const dropData = event.over?.data.current;

    if (isInventoryDragData(dragData) && isInventoryDropData(dropData)) {
      const wasValidDrop = moveItem(dragData.source, dropData.slot);

      if (!wasValidDrop) {
        setRejectedSlot(
          dropData.slot,
          dropData.slot.container === "equipment"
            ? "That item cannot be equipped there"
            : "Invalid drop",
        );
        restartRejectionTimer();
      }
    } else if (isInventoryDragData(dragData)) {
      setRejectedSlot(dragData.source, "Item returned to its original slot");
      restartRejectionTimer();
    }

    setDraggedItem(null);
    setTooltip(null);
  }

  function handleDragCancel() {
    setDraggedItem(null);
    setTooltip(null);
  }

  return (
    <TooltipPositionProvider>
      <DndContext
        accessibility={{
          announcements: inventoryAnnouncements,
          screenReaderInstructions: inventoryScreenReaderInstructions,
        }}
        collisionDetection={closestCenter}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        sensors={sensors}
      >
        {children}
        <RejectionAnnouncement />
        <DragOverlay>
          {draggedItem ? <DragOverlayItem item={draggedItem.item} /> : null}
        </DragOverlay>
        <ContextMenu />
        <ItemInspectionModal />
        <SplitStackModal />
        <ItemTooltip />
      </DndContext>
    </TooltipPositionProvider>
  );
}

function RejectionAnnouncement() {
  const reason = useInventoryStore((state) => state.rejectedSlot?.reason ?? "");

  return (
    <div aria-live="polite" className="sr-only">
      {reason}
    </div>
  );
}

interface InventoryDroppableSlotProps {
  children: ReactNode;
  className: string;
  label: string;
  role?: string;
  slot: SlotPointer;
}

export function InventoryDroppableSlot({
  children,
  className,
  label,
  role,
  slot,
}: InventoryDroppableSlotProps) {
  const isRejected = useInventoryStore((state) =>
    isSameSlot(state.rejectedSlot?.slot ?? null, slot),
  );
  const { isOver, setNodeRef } = useDroppable({
    id: getSlotDndId(slot),
    data: {
      slot,
    },
  });

  return (
    <div
      aria-label={label}
      className={`${className} ${isOver ? "ring-2 ring-emerald-300" : ""} ${
        isRejected
          ? "animate-pulse ring-2 ring-red-400 shadow-[0_0_24px_rgba(248,113,113,0.6)]"
          : ""
      }`}
      ref={setNodeRef}
      role={role}
    >
      {children}
    </div>
  );
}

interface DraggableInventoryItemProps {
  children: ReactNode;
  className?: string;
  item: InventoryItem;
  source: SlotPointer;
}

export function DraggableInventoryItem({
  children,
  className = "",
  item,
  source,
}: DraggableInventoryItemProps) {
  const openContextMenu = useInventoryStore((state) => state.openContextMenu);
  const setTooltip = useInventoryStore((state) => state.setTooltip);
  const { updateTooltipPosition } = useTooltipPosition();
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useDraggable({
      id: getItemDndId(source),
      data: {
        item,
        source,
      } satisfies InventoryDragData,
      attributes: {
        roleDescription: "draggable inventory item",
      },
    });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
  };
  const showTooltip = (event: PointerEvent<HTMLDivElement>) => {
    updateTooltipPosition({
      x: event.clientX,
      y: event.clientY,
    });
    setTooltip({
      item,
      slot: source,
    });
  };
  const moveTooltip = (event: PointerEvent<HTMLDivElement>) => {
    updateTooltipPosition({
      x: event.clientX,
      y: event.clientY,
    });
  };
  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setTooltip(null);
    openContextMenu(source, {
      x: event.clientX,
      y: event.clientY,
    });
  };

  return (
    <div
      aria-label={`${item.name}, ${source.container} item. Press Space or Enter to pick up, arrow keys to move, and Space or Enter to drop.`}
      className={`${className} ${isDragging ? "opacity-40" : ""}`}
      onContextMenu={handleContextMenu}
      onPointerEnter={showTooltip}
      onPointerLeave={() => setTooltip(null)}
      onPointerMove={moveTooltip}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}

function isInventoryDragData(value: unknown): value is InventoryDragData {
  return (
    typeof value === "object" &&
    value !== null &&
    "item" in value &&
    "source" in value
  );
}

function isInventoryDropData(value: unknown): value is InventoryDropData {
  return (
    typeof value === "object" &&
    value !== null &&
    "slot" in value &&
    isSlotPointer((value as { slot: unknown }).slot)
  );
}

function isSlotPointer(value: unknown): value is SlotPointer {
  return (
    typeof value === "object" &&
    value !== null &&
    "container" in value &&
    "slotId" in value
  );
}

function getInventoryDragData(active: Active): InventoryDragData | null {
  const dragData = active.data.current;

  return isInventoryDragData(dragData) ? dragData : null;
}

function getInventoryDropData(over: Over | null): InventoryDropData | null {
  const dropData = over?.data.current;

  return isInventoryDropData(dropData) ? dropData : null;
}

function formatSlotLabel(slot: SlotPointer): string {
  const containerLabel =
    slot.container === "backpack"
      ? "backpack"
      : slot.container === "equipment"
        ? "equipment"
        : "hotbar";

  return `${containerLabel} slot`;
}

function getSlotDndId(slot: SlotPointer): string {
  return `${slot.container}:${slot.slotId}`;
}

function getItemDndId(slot: SlotPointer): string {
  return `${getSlotDndId(slot)}:item`;
}

