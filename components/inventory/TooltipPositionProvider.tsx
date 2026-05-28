"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from "react";

interface TooltipPosition {
  x: number;
  y: number;
}

interface TooltipPositionContextValue {
  positionRef: MutableRefObject<TooltipPosition>;
  tooltipElementRef: MutableRefObject<HTMLDivElement | null>;
  updateTooltipPosition: (position: TooltipPosition) => void;
}

const TooltipPositionContext =
  createContext<TooltipPositionContextValue | null>(null);

interface TooltipPositionProviderProps {
  children: ReactNode;
}

export function TooltipPositionProvider({
  children,
}: TooltipPositionProviderProps) {
  const positionRef = useRef<TooltipPosition>({ x: 0, y: 0 });
  const tooltipElementRef = useRef<HTMLDivElement | null>(null);
  const updateTooltipPosition = useCallback((position: TooltipPosition) => {
    positionRef.current = position;

    if (tooltipElementRef.current) {
      tooltipElementRef.current.style.transform = getTooltipTransform(position);
    }
  }, []);
  const contextValue = useMemo(
    () => ({
      positionRef,
      tooltipElementRef,
      updateTooltipPosition,
    }),
    [updateTooltipPosition],
  );

  return (
    <TooltipPositionContext.Provider value={contextValue}>
      {children}
    </TooltipPositionContext.Provider>
  );
}

export function useTooltipPosition() {
  const contextValue = useContext(TooltipPositionContext);

  if (!contextValue) {
    throw new Error("useTooltipPosition must be used inside TooltipPositionProvider");
  }

  return contextValue;
}

export function getTooltipTransform(position: TooltipPosition): string {
  return `translate3d(${position.x + 16}px, ${position.y + 16}px, 0)`;
}
