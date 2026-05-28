const VIEWPORT_MARGIN_PX = 8;
const POINTER_OFFSET_PX = 16;

interface FloatingPosition {
  x: number;
  y: number;
}

interface FloatingSize {
  height: number;
  width: number;
}

export function clampFloatingPosition(
  position: FloatingPosition,
  size: FloatingSize,
): FloatingPosition {
  if (typeof window === "undefined") {
    return position;
  }

  return {
    x: clamp(position.x, VIEWPORT_MARGIN_PX, window.innerWidth - size.width),
    y: clamp(position.y, VIEWPORT_MARGIN_PX, window.innerHeight - size.height),
  };
}

export function getPointerFloatingPosition(
  position: FloatingPosition,
  size: FloatingSize,
): FloatingPosition {
  return clampFloatingPosition(
    {
      x: position.x + POINTER_OFFSET_PX,
      y: position.y + POINTER_OFFSET_PX,
    },
    size,
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, Math.max(min, max - VIEWPORT_MARGIN_PX)));
}
