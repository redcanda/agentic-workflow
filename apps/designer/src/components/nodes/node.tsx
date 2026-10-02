import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Edge, Node as FlowNode } from '@xyflow/react';
import {
  NODE_DEFINITIONS,
  type ConfigField,
  type ConfigValue,
  type NodeConfig,
  type WorkflowNodeType,
} from './registry';
import { Button } from '../ui/button';
import { ListInput } from '../ui/list-input';
import './node.css';

export type WorkflowNodeData = {
  label: string;
  nodeType: WorkflowNodeType;
  config: NodeConfig;
};

type NodeDetailsProps = {
  node: FlowNode<WorkflowNodeData>;
  edges: Edge[];
  connectionError: string | null;
  onLabelChange: (label: string) => void;
  onConfigChange: (key: string, value: ConfigValue) => void;
  onClose: () => void;
};

type ConfigFieldProps = {
  field: ConfigField;
  value: ConfigValue;
  onChange: (value: ConfigValue) => void;
};

function FieldHelp({ label, description }: { label: string; description: string }) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });

  useLayoutEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    setPosition({
      left: Math.max(8, Math.min(trigger.left, window.innerWidth - tooltip.width - 8)),
      top: Math.max(8, Math.min(trigger.top - tooltip.height - 6, window.innerHeight - tooltip.height - 8)),
    });
  }, [isVisible]);

  return (
    <>
      <span
        onBlur={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        ref={triggerRef}
      >
        <Button
          aria-label={`Help for ${label}`}
          className="node-list-field-help-trigger size-5 rounded-full p-0 text-xs text-muted-foreground"
          type="button"
          variant="ghost"
        >
          i
        </Button>
      </span>
      {isVisible &&
        createPortal(
          <span
            className="node-list-field-help-tooltip"
            ref={tooltipRef}
            role="tooltip"
            style={position}
          >
            {description}
          </span>,
          document.body,
        )}
    </>
  );
}

function ConfigFieldInput({ field, value, onChange }: ConfigFieldProps) {
  const className =
    'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring';

  if (field.kind === 'list') {
    return (
      <div className="space-y-1.5">
        <div className="node-list-field-heading">
          <span className="text-xs font-medium text-muted-foreground">{field.label}</span>
          {field.description && (
            <FieldHelp description={field.description} label={field.label} />
          )}
        </div>
        <ListInput
          label={field.label}
          onChange={onChange}
          placeholder={field.placeholder}
          value={
            Array.isArray(value)
              ? value
              : String(value)
                ? String(value).split('\n')
                : []
          }
        />
      </div>
    );
  }

  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{field.label}</span>
      {field.kind === 'textarea' ? (
        <textarea
          aria-label={field.label}
          className={`${className} node-config-textarea`}
          placeholder={field.placeholder}
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : field.kind === 'select' ? (
        <select
          aria-label={field.label}
          className={`${className} h-9`}
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
        >
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          aria-label={field.label}
          className={`${className} h-9`}
          max={field.kind === 'number' ? field.max : undefined}
          min={field.kind === 'number' ? field.min : undefined}
          placeholder={field.placeholder}
          step={field.kind === 'number' ? field.step : undefined}
          type={field.kind === 'number' ? 'number' : 'text'}
          value={String(value)}
          onChange={(event) =>
            onChange(
              field.kind === 'number' && event.target.value !== ''
                ? event.target.valueAsNumber
                : event.target.value,
            )
          }
        />
      )}
      {field.description && (
        <span className="block text-xs leading-relaxed text-muted-foreground">
          {field.description}
        </span>
      )}
    </label>
  );
}

export function Node({
  node,
  edges,
  connectionError,
  onLabelChange,
  onConfigChange,
  onClose,
}: NodeDetailsProps) {
  const definition = NODE_DEFINITIONS[node.data.nodeType];
  const connectionCount = edges.filter(
    (edge) => edge.source === node.id || edge.target === node.id,
  ).length;

  return (
    <>
      <div className="drawer-header flex h-16 items-center justify-between px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: definition.color }}
          />
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">NODE DETAILS</p>
            <h2 className="truncate text-sm font-semibold">{definition.label}</h2>
          </div>
        </div>
        <Button
          aria-label="Close node details"
          className="drawer-close-button h-10 w-12 shrink-0 rounded-md px-0"
          onClick={onClose}
          variant="ghost"
        >
          <span aria-hidden="true" className="drawer-close-icon" />
        </Button>
      </div>

      <div className="space-y-6 overflow-y-auto p-4">
        <section className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Configuration
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {definition.description}
            </p>
          </div>
          {connectionError && (
            <p className="text-xs leading-relaxed text-destructive" role="alert">
              {connectionError}
            </p>
          )}

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Label</span>
            <input
              aria-label="Node label"
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={node.data.label}
              onChange={(event) => onLabelChange(event.target.value)}
            />
          </label>

          {definition.fields.map((field) => (
            <ConfigFieldInput
              field={field}
              key={field.key}
              onChange={(value) => onConfigChange(field.key, value)}
              value={node.data.config[field.key] ?? ''}
            />
          ))}
        </section>

        <section className="space-y-3 border-t border-border pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Properties
          </h3>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Node ID</p>
            <p className="break-all font-mono text-xs">{node.id}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Type</p>
            <p className="text-sm">{definition.label}</p>
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
        </section>
      </div>
    </>
  );
}
