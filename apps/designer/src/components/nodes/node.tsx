import type { Edge, Node as FlowNode } from '@xyflow/react';
import { Button } from '../ui/button';

type NodeDetailsProps = {
  node: FlowNode;
  nodeType: string;
  edges: Edge[];
  onLabelChange: (label: string) => void;
  onClose: () => void;
};

export function Node({
  node,
  nodeType,
  edges,
  onLabelChange,
  onClose,
}: NodeDetailsProps) {
  const connectionCount = edges.filter(
    (edge) => edge.source === node.id || edge.target === node.id,
  ).length;

  return (
    <>
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
    </>
  );
}
