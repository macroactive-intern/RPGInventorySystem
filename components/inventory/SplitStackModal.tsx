"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useInventoryStore, type SplitStackModalState } from "@/store/inventoryStore";

export function SplitStackModal() {
  const closeSplitStackModal = useInventoryStore(
    (state) => state.closeSplitStackModal,
  );
  const splitStack = useInventoryStore((state) => state.splitStack);
  const splitStackModal = useInventoryStore((state) => state.splitStackModal);

  if (!splitStackModal) {
    return null;
  }

  return (
    <SplitStackDialog
      closeSplitStackModal={closeSplitStackModal}
      splitStack={splitStack}
      splitStackModal={splitStackModal}
    />
  );
}

interface SplitStackDialogProps {
  closeSplitStackModal: () => void;
  splitStack: (source: SplitStackModalState["slot"], amount: number) => boolean;
  splitStackModal: SplitStackModalState;
}

function SplitStackDialog({
  closeSplitStackModal,
  splitStack,
  splitStackModal,
}: SplitStackDialogProps) {
  const maxAmount = splitStackModal.item.quantity - 1;
  const defaultAmount = Math.max(1, Math.floor(splitStackModal.item.quantity / 2));
  const inputRef = useRef<HTMLInputElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const submitRef = useRef<HTMLButtonElement | null>(null);
  const [amount, setAmount] = useState(defaultAmount);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!Number.isInteger(amount) || amount < 1 || amount > maxAmount) {
      setError(`Choose an amount from 1 to ${maxAmount}.`);
      return;
    }

    const didSplit = splitStack(splitStackModal.slot, amount);

    if (!didSplit) {
      setError("Unable to split this stack. Check for an empty backpack slot.");
      return;
    }

    closeSplitStackModal();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeSplitStackModal();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = [
      inputRef.current,
      cancelRef.current,
      submitRef.current,
    ].filter(
      (element): element is HTMLInputElement | HTMLButtonElement =>
        element !== null,
    );
    const currentIndex = focusableElements.indexOf(
      document.activeElement as HTMLInputElement | HTMLButtonElement,
    );

    if (focusableElements.length === 0 || currentIndex === -1) {
      return;
    }

    event.preventDefault();
    const nextIndex = event.shiftKey
      ? (currentIndex - 1 + focusableElements.length) % focusableElements.length
      : (currentIndex + 1) % focusableElements.length;

    focusableElements[nextIndex].focus();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
      onClick={closeSplitStackModal}
    >
      <form
        aria-labelledby="split-stack-heading"
        className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-950 p-5 shadow-2xl shadow-black/60"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
        onSubmit={handleSubmit}
      >
        <div>
          <h2
            className="text-lg font-semibold text-white"
            id="split-stack-heading"
          >
            Split Stack
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {splitStackModal.item.name} has {splitStackModal.item.quantity} items.
          </p>
        </div>

        <label className="mt-5 block text-sm font-medium text-slate-300">
          Amount to split
          <input
            className="mt-2 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none transition focus:border-emerald-400"
            max={maxAmount}
            min={1}
            onChange={(event) => {
              setAmount(Number(event.target.value));
              setError(null);
            }}
            ref={inputRef}
            type="number"
            value={amount}
          />
        </label>

        <div className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-sm text-slate-300">
          Result: {splitStackModal.item.quantity - amount} stays, {amount} moves.
        </div>

        {error ? (
          <div className="mt-3 rounded-md border border-red-500/60 bg-red-950/40 px-3 py-2 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            className="rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
            onClick={closeSplitStackModal}
            ref={cancelRef}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            ref={submitRef}
            type="submit"
          >
            Split
          </button>
        </div>
      </form>
    </div>
  );
}
