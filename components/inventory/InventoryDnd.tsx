"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useInventoryStore, type SlotPointer } from "@/store/inventoryStore";
import type { InventoryItem } from "@/types/inventory";

export interface InventoryDragData {
  item: InventoryItem;
  source: SlotPointer;
}

interface InventoryDndProviderProps {
  children: ReactNode;
}

export function InventoryDndProvider({ children }: InventoryDndProviderProps) {
  const draggedItem = useInventoryStore((state) => state.draggedItem);
  const setDraggedItem = useInventoryStore((state) => state.setDraggedItem);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    const dragData = event.active.data.current;

    if (isInventoryDragData(dragData)) {
      setDraggedItem({
        item: dragData.item,
        source: dragData.source,
      });
    }
  }

  function handleDragEnd() {
    // Drop rules and inventory mutations are intentionally left for a later step.
    setDraggedItem(null);
  }

  function handleDragCancel() {
    setDraggedItem(null);
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
      <DragOverlay>
        {draggedItem ? <DragItemPreview item={draggedItem.item} /> : null}
      </DragOverlay>
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
  const { isOver, setNodeRef } = useDroppable({
    id: getSlotDndId(slot),
    data: {
      slot,
    },
  });

  return (
    <div
      aria-label={label}
      className={`${className} ${isOver ? "ring-2 ring-emerald-300" : ""}`}
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

  return (
    <div
      className={`${className} ${isDragging ? "opacity-40" : ""}`}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}

function DragItemPreview({ item }: { item: InventoryItem }) {
  return (
    <div className="min-w-32 rounded-md border border-emerald-300 bg-slate-900 p-3 shadow-2xl shadow-black/40">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-950 text-sm font-bold text-slate-100">
          {getIconPlaceholder(item)}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white">
            {item.name}
          </div>
          <div className="text-xs capitalize text-slate-400">{item.rarity}</div>
        </div>
      </div>
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

function getSlotDndId(slot: SlotPointer): string {
  return `${slot.container}:${slot.slotId}`;
}

function getItemDndId(slot: SlotPointer): string {
  return `${getSlotDndId(slot)}:item`;
}

function getIconPlaceholder(item: InventoryItem): string {
  return item.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
