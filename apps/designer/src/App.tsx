import { useCallback, useRef, useState, type DragEvent } from 'react';
import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from '@xyflow/react';
import { Button } from './components/ui/button';
import { Drawer } from './components/drawer/drawer';
import './App.css';
import { Node as NodeDetails } from './components/nodes/node';
import { NodeTypeIcon } from './components/nodes/node-type-icon';
import { WorkflowCanvasNode } from './components/nodes/workflow-canvas-node';
import {
  getNodeOutputs,
  isWorkflowNodeType,
  NODE_DEFINITIONS,
  WORKFLOW_NODE_TYPES,
  type ConfigValue,
  type WorkflowNodeType,
} from './components/nodes/registry';
import type { WorkflowNodeData } from './components/nodes/node';

const edgeArrow = 'workflow-edge-arrow';
const workflowNodeTransferType = 'application/workflow-node';

const nodeTypes = { workflow: WorkflowCanvasNode };

const initialNodes: Node<WorkflowNodeData>[] = [
  {
    id: 'start',
    type: 'workflow',
    position: { x: 80, y: 170 },
    data: {
      label: NODE_DEFINITIONS.start.label,
      nodeType: 'start',
      config: { ...NODE_DEFINITIONS.start.config },
    },
    style: { borderColor: NODE_DEFINITIONS.start.color },
  },
  {
    id: 'agent',
    type: 'workflow',
    position: { x: 360, y: 170 },
    data: {
      label: NODE_DEFINITIONS.agent.label,
      nodeType: 'agent',
      config: { ...NODE_DEFINITIONS.agent.config },
    },
    style: { borderColor: NODE_DEFINITIONS.agent.color },
  },
  {
    id: 'end',
    type: 'workflow',
    position: { x: 640, y: 170 },
    data: {
      label: NODE_DEFINITIONS.end.label,
      nodeType: 'end',
      config: { ...NODE_DEFINITIONS.end.config },
    },
    style: { borderColor: NODE_DEFINITIONS.end.color },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'start-agent',
    source: 'start',
    sourceHandle: 'next',
    target: 'agent',
    markerEnd: edgeArrow,
  },
  {
    id: 'agent-end',
    source: 'agent',
    sourceHandle: 'next',
    target: 'end',
    markerEnd: edgeArrow,
  },
];

const nodeOptions = WORKFLOW_NODE_TYPES.map((type) => NODE_DEFINITIONS[type]);

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<WorkflowNodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [workflowName, setWorkflowName] = useState('Untitled workflow');
  const [isLeftPaneOpen, setIsLeftPaneOpen] = useState(true);
  const [connectionError, setConnectionError] = useState<{
    nodeId: string;
    message: string;
  } | null>(null);
  const flowInstance = useRef<ReactFlowInstance<Node<WorkflowNodeData>, Edge> | null>(null);
  const nextNodeId = useRef(1);
  const selectedEdgeCount = edges.filter((edge) => edge.selected).length;
  const selectedNode = nodes.find((node) => node.selected);

  const isConnectionValid = useCallback(
    (connection: Connection | Edge) => {
      const source = nodes.find((node) => node.id === connection.source);
      const target = nodes.find((node) => node.id === connection.target);

      if (
        !source ||
        !target ||
        !isWorkflowNodeType(source.data.nodeType) ||
        !isWorkflowNodeType(target.data.nodeType) ||
        target.data.nodeType === 'start'
      ) {
        return false;
      }

      const outputs = getNodeOutputs(source.data.nodeType, source.data.config);
      const sourceHandle =
        connection.sourceHandle ??
        (outputs.length === 1 ? outputs[0].id : undefined);

      if (!sourceHandle || !outputs.some((output) => output.id === sourceHandle)) {
        return false;
      }

      return !edges.some(
        (edge) =>
          edge.id !== ('id' in connection ? connection.id : undefined) &&
          edge.source === connection.source &&
          (edge.sourceHandle ?? 'next') === sourceHandle,
      );
    },
    [edges, nodes],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!isConnectionValid(connection)) return;

      const source = nodes.find((node) => node.id === connection.source);
      const sourceOutput =
        source && isWorkflowNodeType(source.data.nodeType)
          ? getNodeOutputs(source.data.nodeType, source.data.config).find(
              (output) => output.id === connection.sourceHandle,
            )
          : undefined;
      const edgeLabel =
        source &&
        isWorkflowNodeType(source.data.nodeType) &&
        (source.data.nodeType === 'condition' || source.data.nodeType === 'switch')
          ? sourceOutput?.label
          : undefined;

      setEdges((currentEdges) =>
        addEdge(
          {
            ...connection,
            label: edgeLabel,
            labelStyle: { fill: 'var(--foreground)', fontSize: 10 },
            labelBgStyle: { fill: 'var(--background)', fillOpacity: 0.95 },
            labelBgPadding: [4, 2],
            labelBgBorderRadius: 4,
            markerEnd: edgeArrow,
          },
          currentEdges,
        ),
      );
    },
    [isConnectionValid, nodes, setEdges],
  );

  const addNode = (
    type: WorkflowNodeType,
    position?: { x: number; y: number },
  ) => {
    const definition = NODE_DEFINITIONS[type];
    const id = `${type}-${nextNodeId.current++}`;
    setNodes((currentNodes) => [
      ...currentNodes,
      {
        id,
        type: 'workflow',
        position:
          position ??
          { x: 180 + currentNodes.length * 36, y: 80 + (currentNodes.length % 4) * 90 },
        data: {
          label: definition.label,
          nodeType: type,
          config: { ...definition.config },
        },
        style: { borderColor: definition.color },
      },
    ]);
  };

  const handleNodeDragStart = (
    event: DragEvent<HTMLButtonElement>,
    type: WorkflowNodeType,
  ) => {
    event.dataTransfer.setData(workflowNodeTransferType, type);
    event.dataTransfer.effectAllowed = 'copy';

    const definition = NODE_DEFINITIONS[type];
    const preview = document.createElement('div');
    preview.className = 'react-flow__node workflow-drag-preview';
    preview.style.borderColor = definition.color;
    preview.style.left = '-10000px';
    preview.style.top = '-10000px';

    if (type !== 'start') {
      const input = document.createElement('span');
      input.className = 'workflow-drag-preview-handle workflow-drag-preview-input';
      preview.append(input);
    }

    const content = document.createElement('div');
    content.className = 'workflow-canvas-node-content';

    const label = document.createElement('span');
    label.className = 'workflow-canvas-node-label';
    label.textContent = definition.label;
    content.append(label);

    if (type !== 'start' && type !== 'end') {
      const nodeType = document.createElement('span');
      nodeType.className = 'workflow-canvas-node-type';
      nodeType.textContent = definition.label;
      content.append(nodeType);
    }
    preview.append(content);

    const outputs = getNodeOutputs(type, definition.config);
    outputs.forEach((_, index) => {
      const handle = document.createElement('span');
      handle.className = 'workflow-drag-preview-handle workflow-drag-preview-output';
      handle.style.left = `${((index + 1) / (outputs.length + 1)) * 100}%`;
      preview.append(handle);
    });

    document.body.append(preview);
    event.dataTransfer.setDragImage(
      preview,
      preview.offsetWidth / 2,
      preview.offsetHeight / 2,
    );
    window.setTimeout(() => preview.remove(), 0);
  };

  const handleCanvasDragOver = (event: DragEvent<HTMLElement>) => {
    if (!event.dataTransfer.types.includes(workflowNodeTransferType)) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    const type = event.dataTransfer.getData(workflowNodeTransferType);
    if (!isWorkflowNodeType(type) || !flowInstance.current) return;

    addNode(
      type,
      flowInstance.current.screenToFlowPosition({ x: event.clientX, y: event.clientY }),
    );
  };

  const clearWorkflow = () => {
    setNodes([]);
    setEdges([]);
    setWorkflowName('Untitled workflow');
    setConnectionError(null);
    nextNodeId.current = 1;
  };

  const deleteSelectedEdges = () => {
    setEdges((currentEdges) => currentEdges.filter((edge) => !edge.selected));
  };

  const updateSelectedNodeLabel = (label: string) => {
    if (!selectedNode) return;

    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === selectedNode.id
          ? { ...node, data: { ...node.data, label } }
          : node,
      ),
    );
  };

  const updateSelectedNodeConfig = (key: string, value: ConfigValue) => {
    if (!selectedNode) return;

    const config = { ...selectedNode.data.config, [key]: value };
    if (
      selectedNode.data.nodeType === 'switch' &&
      key === 'cases' &&
      edges.some(
        (edge) =>
          edge.source === selectedNode.id &&
          !getNodeOutputs(selectedNode.data.nodeType, config).some(
            (output) => output.id === (edge.sourceHandle ?? 'next'),
          ),
      )
    ) {
      setConnectionError({
        nodeId: selectedNode.id,
        message: 'Disconnect routes for removed cases before changing the Switch cases.',
      });
      return;
    }

    setConnectionError(null);
    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                config,
              },
            }
          : node,
      ),
    );
  };

  const closeNodeDetails = () => {
    setConnectionError(null);
    setNodes((currentNodes) =>
      currentNodes.map((node) => (node.selected ? { ...node, selected: false } : node)),
    );
  };

  return (
    <main className="flex h-screen min-h-[520px] flex-col overflow-hidden bg-background text-foreground">
      <header className="designer-top-pane z-20 flex h-16 shrink-0 items-center justify-between bg-card px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
            A
        </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">WORKFLOW DESIGNER</p>
            <input
              aria-label="Workflow name"
              className="w-64 max-w-full truncate bg-transparent text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={workflowName}
              onChange={(event) => setWorkflowName(event.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:inline">All changes saved</span>
          <Button
            disabled={selectedEdgeCount === 0}
            onClick={deleteSelectedEdges}
            variant="outline"
          >
            Delete edge{selectedEdgeCount === 1 ? '' : 's'}
            {selectedEdgeCount > 0 && ` (${selectedEdgeCount})`}
          </Button>
          <Button variant="outline" onClick={clearWorkflow}>New workflow</Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div
          className={`designer-left-pane-slot${isLeftPaneOpen ? ' is-open' : ''}`}
          id="node-palette"
        >
          <aside
            aria-hidden={!isLeftPaneOpen}
            className="designer-left-pane z-10 flex h-full w-60 flex-col gap-5 bg-card p-4"
            inert={!isLeftPaneOpen}
          >
            <div>
              <h1 className="text-sm font-semibold">Build your workflow</h1>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Add steps to the canvas, then connect them by dragging between handles.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Nodes
              </h2>
              {nodeOptions.map(({ type, label, color, description }) => (
                <Button
                  aria-label={`${label}: ${description}. Drag onto the canvas to add.`}
                  className="palette-node"
                  draggable
                  key={type}
                  onClick={() => addNode(type)}
                  onDragStart={(event) => handleNodeDragStart(event, type)}
                  style={{
                    borderColor: `color-mix(in oklch, ${color} 24%, var(--border))`,
                  }}
                  title={`${description} — drag onto the canvas to add`}
                  variant="outline"
                >
                  <span
                    aria-hidden="true"
                    className="node-type-icon-badge"
                    style={{
                      backgroundColor: `color-mix(in oklch, ${color} 13%, var(--card))`,
                      color,
                    }}
                  >
                    <NodeTypeIcon type={type} />
                  </span>
                  <span className="palette-node-copy">
                    <span className="palette-node-label">{label}</span>
                    <span className="palette-node-description">{description}</span>
                  </span>
                  <svg
                    aria-hidden="true"
                    className="palette-node-grip"
                    fill="currentColor"
                    viewBox="0 0 12 18"
                  >
                    <circle cx="3" cy="3" r="1.2" />
                    <circle cx="9" cy="3" r="1.2" />
                    <circle cx="3" cy="9" r="1.2" />
                    <circle cx="9" cy="9" r="1.2" />
                    <circle cx="3" cy="15" r="1.2" />
                    <circle cx="9" cy="15" r="1.2" />
                  </svg>
                </Button>
              ))}
            </div>
            <div className="mt-auto rounded-lg border bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
              Tip: drag from a node handle to another node to create a connection.
            </div>
          </aside>
          <Button
            aria-controls="node-palette"
            aria-expanded={isLeftPaneOpen}
            aria-label={isLeftPaneOpen ? 'Collapse node palette' : 'Expand node palette'}
            className="designer-left-pane-toggle"
            onClick={() => setIsLeftPaneOpen((open) => !open)}
            variant="outline"
          >
            <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
              {isLeftPaneOpen ? (
                <path d="m14.5 5-7 7 7 7" />
              ) : (
                <path d="m9.5 5 7 7-7 7" />
              )}
            </svg>
          </Button>
        </div>

        <section
          aria-label="Workflow canvas"
          className="min-w-0 flex-1"
          onDragOver={handleCanvasDragOver}
          onDrop={handleCanvasDrop}
        >
          <svg aria-hidden="true" className="designer-svg-definitions">
            <defs>
              <marker
                id={edgeArrow}
                markerHeight="20"
                markerUnits="userSpaceOnUse"
                markerWidth="20"
                orient="auto"
                refX="0"
                refY="0"
                viewBox="-10 -10 20 20"
              >
                <polyline
                  fill="none"
                  points="-8,-2 0,0 -8,2"
                  stroke="var(--primary)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </marker>
            </defs>
          </svg>
          <ReactFlow
            onInit={(instance) => {
              flowInstance.current = instance;
            }}
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isValidConnection={isConnectionValid}
            deleteKeyCode={['Backspace', 'Delete']}
            fitView
            fitViewOptions={{ padding: 0.25 }}
            className="bg-background"
          >
            <Background color="var(--muted-foreground)" gap={20} size={1} variant={BackgroundVariant.Dots} />
            <Controls className="!overflow-hidden !rounded-lg !border !bg-card !shadow-sm [&>button]:!border-b [&>button]:!bg-card [&>button]:!fill-foreground" />
            <MiniMap
              className="!overflow-hidden !rounded-lg !border !bg-card"
              nodeColor={(node) => {
                const nodeType = node.data.nodeType;
                return isWorkflowNodeType(nodeType)
                  ? NODE_DEFINITIONS[nodeType].color
                  : '#94a3b8';
              }}
              maskColor="rgb(15 23 42 / 8%)"
            />
          </ReactFlow>
        </section>

        {selectedNode && (
          <Drawer>
            <NodeDetails
              connectionError={
                connectionError?.nodeId === selectedNode.id ? connectionError.message : null
              }
              edges={edges}
              node={selectedNode}
              onConfigChange={updateSelectedNodeConfig}
              onClose={closeNodeDetails}
              onLabelChange={updateSelectedNodeLabel}
            />
          </Drawer>
        )}
      </div>
    </main>
  );
}
