import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import './drawer.css';

const MIN_WIDTH = 240;
const MAX_WIDTH = 560;

type DrawerProps = {
  children: ReactNode;
};

export function Drawer({ children }: DrawerProps) {
  const [width, setWidth] = useState(288);
  const resizeStart = useRef<{ pointerId: number; x: number; width: number } | null>(null);

  const clampWidth = (nextWidth: number) =>
    Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, nextWidth));

  const startResize = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeStart.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      width,
    };
  };

  const resize = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = resizeStart.current;
    if (!start || start.pointerId !== event.pointerId) return;

    setWidth(clampWidth(start.width + start.x - event.clientX));
  };

  const stopResize = (event: React.PointerEvent<HTMLDivElement>) => {
    if (resizeStart.current?.pointerId === event.pointerId) {
      resizeStart.current = null;
    }
  };

  const handleResizeKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 48 : 16;
    let nextWidth: number;

    switch (event.key) {
      case 'ArrowLeft':
        nextWidth = width + step;
        break;
      case 'ArrowRight':
        nextWidth = width - step;
        break;
      case 'Home':
        nextWidth = MIN_WIDTH;
        break;
      case 'End':
        nextWidth = MAX_WIDTH;
        break;
      default:
        return;
    }

    event.preventDefault();
    setWidth(clampWidth(nextWidth));
  };

  return (
    <div className="drawer-enter relative flex shrink-0" style={{ width }}>
      <div
        aria-label="Resize node details panel"
        aria-orientation="vertical"
        aria-valuemax={MAX_WIDTH}
        aria-valuemin={MIN_WIDTH}
        aria-valuenow={width}
        className="group absolute inset-y-0 left-0 z-20 flex w-2 -translate-x-1/2 cursor-col-resize touch-none items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        onKeyDown={handleResizeKeyDown}
        onPointerCancel={stopResize}
        onPointerDown={startResize}
        onPointerMove={resize}
        onPointerUp={stopResize}
        role="separator"
        tabIndex={0}
      >
        <span className="drawer-resize-grip h-10 w-1 rounded-full transition-colors group-hover:bg-primary group-focus-visible:bg-primary" />
      </div>
      <aside
        aria-label="Selected node drawer"
        className="drawer-panel z-10 flex min-w-0 flex-1 flex-col bg-card"
      >
        {children}
      </aside>
    </div>
  );
}
