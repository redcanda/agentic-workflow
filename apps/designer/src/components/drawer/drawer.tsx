import { useRef, useState } from 'react';
import type { Edge, Node } from '@xyflow/react';
import { Button } from '../ui/button';

const MIN_WIDTH = 240;
const MAX_WIDTH = 560;

type DrawerProps = {
  node: Node;
  nodeType: string;
  edges: Edge[];
  onLabelChange: (label: string) => void;
  onClose: () => void;
};

export function Drawer({ node, nodeType, edges, onLabelChange, onClose }: DrawerProps) {
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

  const connectionCount = edges.filter(
    (edge) => edge.source === node.id || edge.target === node.id,
  ).length;

  return (
    <div className="relative flex shrink-0" style={{ width }}>
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
        aria-label="Selected node details"
        className="drawer-panel z-10 flex min-w-0 flex-1 flex-col bg-card"
      >
        <div className="drawer-header flex h-16 items-center justify-between px-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">NODE DETAILS</p>
            <h2 className="text-sm font-semibold">{nodeType}</h2>
          </div>
          <Button
            aria-label="Close node details"
            className="drawer-close-button h-10 w-12 rounded-md px-0"
            onClick={onClose}
            variant="ghost"
          >
            <span aria-hidden="true" className="drawer-close-icon" />
          </Button>
        </div>

        <div className="space-y-5 overflow-y-auto p-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Label</span>
            <input
              aria-label="Node label"
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={String(node.data.label ?? '')}
              onChange={(event) => onLabelChange(event.target.value)}
            />
          </label>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Properties
            </h3>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Node ID</p>
              <p className="break-all font-mono text-xs">{node.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="text-sm">{nodeType}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Position</p>
              <p className="font-mono text-xs">
                x: {Math.round(node.position.x)}, y: {Math.round(node.position.y)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Connections</p>
              <p className="text-sm">{connectionCount}</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
