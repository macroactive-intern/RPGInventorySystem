"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { canEquip } from "@/lib/inventoryLogic";
import { useInventoryStore } from "@/store/inventoryStore";

interface MenuAction {
  disabled?: boolean;
  label: string;
  onSelect: () => void;
}

export function ContextMenu() {
  const closeContextMenu = useInventoryStore((state) => state.closeContextMenu);
  const contextMenu = useInventoryStore((state) => state.contextMenu);
  const equipment = useInventoryStore((state) => state.equipment);
  const equipItem = useInventoryStore((state) => state.equipItem);
  const removeItem = useInventoryStore((state) => state.removeItem);
  const setTooltip = useInventoryStore((state) => state.setTooltip);
  const splitStack = useInventoryStore((state) => state.splitStack);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const actions = useMemo<MenuAction[]>(() => {
    if (!contextMenu) {
      return [];
    }

    const canEquipItem =
      contextMenu.slot.container !== "equipment" &&
      equipment.some((slot) => canEquip(contextMenu.item, slot));

    return [
      {
        disabled: !canEquipItem,
        label: "Equip",
        onSelect: () => {
          equipItem(contextMenu.slot);
          closeContextMenu();
        },
      },
      {
        label: "Drop",
        onSelect: () => {
          removeItem(contextMenu.slot);
          closeContextMenu();
        },
      },
      {
        disabled: contextMenu.item.quantity <= 1,
        label: "Split Stack",
        onSelect: () => {
          splitStack(contextMenu.slot, Math.floor(contextMenu.item.quantity / 2));
          closeContextMenu();
        },
      },
      {
        label: "Inspect",
        onSelect: () => {
          setTooltip({
            item: contextMenu.item,
            slot: contextMenu.slot,
            x: contextMenu.x,
            y: contextMenu.y,
          });
          closeContextMenu();
        },
      },
    ];
  }, [
    closeContextMenu,
    contextMenu,
    equipment,
    equipItem,
    removeItem,
    setTooltip,
    splitStack,
  ]);

  useEffect(() => {
    if (!contextMenu) {
      return;
    }

    const firstEnabledIndex = getEnabledIndices(actions)[0] ?? 0;
    queueMicrotask(() => buttonRefs.current[firstEnabledIndex]?.focus());
  }, [actions, contextMenu]);

  useEffect(() => {
    if (!contextMenu) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        closeContextMenu();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [closeContextMenu, contextMenu]);

  if (!contextMenu) {
    return null;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const enabledIndices = getEnabledIndices(actions);

    if (enabledIndices.length === 0) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeContextMenu();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusRelativeAction(1, enabledIndices);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusRelativeAction(-1, enabledIndices);
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      focusRelativeAction(event.shiftKey ? -1 : 1, enabledIndices);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const action = actions[selectedIndex];

      if (action && !action.disabled) {
        action.onSelect();
      }
    }
  }

  function focusRelativeAction(direction: 1 | -1, enabledIndices: number[]) {
    const currentEnabledIndex = enabledIndices.indexOf(selectedIndex);
    const safeCurrentIndex = currentEnabledIndex === -1 ? 0 : currentEnabledIndex;
    const nextEnabledIndex =
      (safeCurrentIndex + direction + enabledIndices.length) %
      enabledIndices.length;
    const nextIndex = enabledIndices[nextEnabledIndex];

    setSelectedIndex(nextIndex);
    buttonRefs.current[nextIndex]?.focus();
  }

  return (
    <div
      aria-label={`Actions for ${contextMenu.item.name}`}
      className="fixed z-50 min-w-44 rounded-md border border-slate-700 bg-slate-950 p-1.5 shadow-2xl shadow-black/60"
      onKeyDown={handleKeyDown}
      ref={menuRef}
      role="menu"
      style={{
        left: contextMenu.x,
        top: contextMenu.y,
      }}
      tabIndex={-1}
    >
      <div className="border-b border-slate-800 px-3 py-2">
        <div className="truncate text-sm font-semibold text-white">
          {contextMenu.item.name}
        </div>
        <div className="text-xs capitalize text-slate-500">
          {contextMenu.item.rarity}
        </div>
      </div>

      <div className="mt-1 space-y-1">
        {actions.map((action, index) => (
          <button
            className={`flex w-full items-center rounded px-3 py-2 text-left text-sm transition-colors ${
              index === selectedIndex
                ? "bg-emerald-500/15 text-emerald-100"
                : "text-slate-200 hover:bg-slate-900"
            } disabled:cursor-not-allowed disabled:text-slate-600 disabled:hover:bg-transparent`}
            disabled={action.disabled}
            key={action.label}
            onClick={action.onSelect}
            onFocus={() => setSelectedIndex(index)}
            onMouseEnter={() => {
              if (!action.disabled) {
                setSelectedIndex(index);
              }
            }}
            ref={(element) => {
              buttonRefs.current[index] = element;
            }}
            role="menuitem"
            type="button"
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function getEnabledIndices(actions: MenuAction[]): number[] {
  return actions.flatMap((action, index) => (action.disabled ? [] : [index]));
}
