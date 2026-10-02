import { useCallback, useRef, useState } from 'react';
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
} from '@xyflow/react';
import { Button } from './components/ui/button';
import { Drawer } from './components/drawer/drawer';
import './App.css';
import { Node as NodeComponent } from './components/nodes/node';

type WorkflowNodeType = 'start' | 'agent' | 'condition' | 'http' | 'end';

const nodeColors: Record<WorkflowNodeType, string> = {
  start: '#10b981',
  agent: '#6366f1',
  condition: '#f59e0b',
  http: '#0ea5e9',
  end: '#f43f5e',
};

const initialNodes: Node[] = [
  {
    id: 'start',
    type: 'input',
    position: { x: 80, y: 170 },
    data: { label: 'Start' },
    style: { borderColor: nodeColors.start },
  },
  {
    id: 'agent',
    position: { x: 360, y: 170 },
    data: { label: 'AI Agent' },
    style: { borderColor: nodeColors.agent },
  },
  {
    id: 'end',
    type: 'output',
    position: { x: 640, y: 170 },
    data: { label: 'End' },
    style: { borderColor: nodeColors.end },
  },
];

const initialEdges: Edge[] = [
  { id: 'start-agent', source: 'start', target: 'agent', animated: true },
  { id: 'agent-end', source: 'agent', target: 'end', animated: true },
];

const nodeOptions: { type: WorkflowNodeType; label: string }[] = [
  { type: 'start', label: 'Start' },
  { type: 'agent', label: 'AI Agent' },
  { type: 'condition', label: 'Condition' },
  { type: 'http', label: 'HTTP Request' },
  { type: 'end', label: 'End' },
];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [workflowName, setWorkflowName] = useState('Untitled workflow');
  const nextNodeId = useRef(1);
  const selectedEdgeCount = edges.filter((edge) => edge.selected).length;
  const selectedNode = nodes.find((node) => node.selected);
  const selectedNodeType = selectedNode
    ? nodeOptions.find(({ type }) => type === selectedNode.id.split('-')[0])?.type
    : undefined;

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((currentEdges) =>
        addEdge({ ...connection, animated: true }, currentEdges),
      );
    },
    [setEdges],
  );

  const addNode = (type: WorkflowNodeType, label: string) => {
    const id = `${type}-${nextNodeId.current++}`;
    const flowType = type === 'start' ? 'input' : type === 'end' ? 'output' : 'default';

    setNodes((currentNodes) => [
      ...currentNodes,
      {
        id,
        type: flowType,
        position: { x: 180 + currentNodes.length * 36, y: 80 + (currentNodes.length % 4) * 90 },
        data: { label },
        style: {
          borderColor: nodeColors[type],
        },
      },
    ]);
  };

  const clearWorkflow = () => {
    setNodes([]);
    setEdges([]);
    setWorkflowName('Untitled workflow');
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

  const closeNodeDetails = () => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => (node.selected ? { ...node, selected: false } : node)),
    );
  };

  return (
    <main className="flex h-screen min-h-[520px] flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-5">
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
        <aside className="z-10 flex w-60 shrink-0 flex-col gap-5 border-r bg-card p-4">
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
            {nodeOptions.map(({ type, label }) => (
              <Button
                className="w-full justify-start gap-2"
                key={type}
                onClick={() => addNode(type, label)}
                variant="outline"
              >
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: nodeColors[type] }}
                />
                {label}
                <span className="ml-auto text-muted-foreground">+</span>
              </Button>
            ))}
          </div>
          <div className="mt-auto rounded-lg border bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
            Tip: drag from a node handle to another node to create a connection.
          </div>
        </aside>

        <section aria-label="Workflow canvas" className="min-w-0 flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
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
                const nodeType = nodeOptions.find(
                  ({ type }) => type === node.id.split('-')[0],
                )?.type;
                return nodeType ? nodeColors[nodeType] : '#94a3b8';
              }}
              maskColor="rgb(15 23 42 / 8%)"
            />
          </ReactFlow>
        </section>

        {selectedNode && (
          <Drawer
          >
            <NodeComponent
              edges={edges}
              node={selectedNode}
              nodeType={
                selectedNodeType
                  ? nodeOptions.find(({ type }) => type === selectedNodeType)?.label ?? selectedNodeType
                  : selectedNode.type ?? 'Workflow node'
              }
              onClose={closeNodeDetails}
              onLabelChange={updateSelectedNodeLabel}
            />
          </Drawer>
        )}
      </div>
    </main>
  );
}
