"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { DragOverlayItem } from "@/components/inventory/DragOverlayItem";
import { ItemTooltip } from "@/components/inventory/ItemTooltip";
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

export function InventoryDndProvider({ children }: InventoryDndProviderProps) {
  const draggedItem = useInventoryStore((state) => state.draggedItem);
  const clearRejectedSlot = useInventoryStore((state) => state.clearRejectedSlot);
  const moveItem = useInventoryStore((state) => state.moveItem);
  const rejectedSlot = useInventoryStore((state) => state.rejectedSlot);
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
    }

    setDraggedItem(null);
    setTooltip(null);
  }

  function handleDragCancel() {
    setDraggedItem(null);
    setTooltip(null);
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      {children}
      <div aria-live="polite" className="sr-only">
        {rejectedSlot?.reason ?? ""}
      </div>
      <DragOverlay>
        {draggedItem ? <DragOverlayItem item={draggedItem.item} /> : null}
      </DragOverlay>
      <ItemTooltip />
    </DndContext>
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
  const rejectedSlot = useInventoryStore((state) => state.rejectedSlot);
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
        isSameSlot(rejectedSlot?.slot ?? null, slot)
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
  const setTooltip = useInventoryStore((state) => state.setTooltip);
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useDraggable({
      id: getItemDndId(source),
      data: {
        item,
        source,
      } satisfies InventoryDragData,
    });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
  };
  const showTooltip = (event: PointerEvent<HTMLDivElement>) => {
    setTooltip({
      item,
      slot: source,
      x: event.clientX,
      y: event.clientY,
    });
  };

  return (
    <div
      className={`${className} ${isDragging ? "opacity-40" : ""}`}
      onPointerEnter={showTooltip}
      onPointerLeave={() => setTooltip(null)}
      onPointerMove={showTooltip}
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

function isSameSlot(first: SlotPointer | null, second: SlotPointer): boolean {
  return (
    first?.container === second.container &&
    first.slotId === second.slotId
  );
}

function getSlotDndId(slot: SlotPointer): string {
  return `${slot.container}:${slot.slotId}`;
}

function getItemDndId(slot: SlotPointer): string {
  return `${getSlotDndId(slot)}:item`;
}

