import type { Edge, Node } from '@xyflow/react';
import type { WorkflowNodeData } from '../components/nodes/node';
import {
  isWorkflowNodeType,
  NODE_DEFINITIONS,
  type NodeConfig,
  type WorkflowNodeType,
} from '../components/nodes/registry';

export const WORKFLOW_FORMAT_VERSION = 1;

export type WorkflowDefinition = {
  version: number;
  name: string;
  nodes: WorkflowDefinitionNode[];
  edges: WorkflowDefinitionEdge[];
};

export type WorkflowDefinitionNode = {
  id: string;
  type: WorkflowNodeType;
  label?: string;
  position: { x: number; y: number };
  config?: NodeConfig;
};

export type WorkflowDefinitionEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  label?: string;
};

export type WorkflowEditorState = {
  name: string;
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
};

export function createWorkflowDefinition(
  name: string,
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[],
): WorkflowDefinition {
  const workflow: WorkflowDefinition = {
    version: WORKFLOW_FORMAT_VERSION,
    name,
    nodes: nodes.map((node) => {
      if (!isWorkflowNodeType(node.data.nodeType)) {
        throw new Error(`Cannot save unsupported node type on node "${node.id}".`);
      }

      return {
        id: node.id,
        type: node.data.nodeType,
        label: node.data.label,
        position: { x: node.position.x, y: node.position.y },
        config: { ...node.data.config },
      };
    }),
    edges: edges.map((edge) => {
      if (edge.label !== undefined && typeof edge.label !== 'string') {
        throw new Error(`Cannot save non-string label on edge "${edge.id}".`);
      }

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        ...(edge.sourceHandle !== null && edge.sourceHandle !== undefined
          ? { sourceHandle: edge.sourceHandle }
          : {}),
        ...(typeof edge.label === 'string' ? { label: edge.label } : {}),
      };
    }),
  };
  assertWorkflowDefinition(workflow);
  return workflow;
}

export function createWorkflowEditorState(workflow: WorkflowDefinition): WorkflowEditorState {
  return {
    name: workflow.name,
    nodes: workflow.nodes.map((node) => {
      const definition = NODE_DEFINITIONS[node.type];

      return {
        id: node.id,
        type: 'workflow',
        position: { ...node.position },
        data: {
          label: node.label ?? definition.label,
          nodeType: node.type,
          config: { ...definition.config, ...node.config },
        },
        style: { borderColor: definition.color },
      };
    }),
    edges: workflow.edges.map((edge) => ({
      ...edge,
      markerEnd: 'workflow-edge-arrow',
      ...(edge.label
        ? {
            labelStyle: { fill: 'var(--foreground)', fontSize: 10 },
            labelBgStyle: { fill: 'var(--background)', fillOpacity: 0.95 },
            labelBgPadding: [4, 2],
            labelBgBorderRadius: 4,
          }
        : {}),
    })),
  };
}

export function parseWorkflowDefinition(json: string): WorkflowDefinition {
  const value: unknown = JSON.parse(json);
  assertWorkflowDefinition(value);
  return value;
}

function assertWorkflowDefinition(value: unknown): asserts value is WorkflowDefinition {
  if (!isRecord(value)) {
    throw new Error('Workflow must be a JSON object.');
  }
  assertOnlyKeys(value, ['version', 'name', 'nodes', 'edges'], 'Workflow');

  if (typeof value.version !== 'number' || !Number.isInteger(value.version) || value.version < 1) {
    throw new Error('Workflow version must be a positive integer.');
  }

  if (typeof value.name !== 'string' || value.name.trim().length === 0) {
    throw new Error('Workflow name must be a non-empty string.');
  }

  if (!Array.isArray(value.nodes) || !Array.isArray(value.edges)) {
    throw new Error('Workflow must include nodes and edges arrays.');
  }

  const nodeIds = new Set<string>();
  for (const node of value.nodes) {
    if (!isRecord(node) || typeof node.id !== 'string' || !isWorkflowNodeType(node.type)) {
      throw new Error('Each workflow node must have a string id and a supported type.');
    }
    assertOnlyKeys(node, ['id', 'type', 'label', 'position', 'config'], `Node "${node.id}"`);
    if (nodeIds.has(node.id)) {
      throw new Error(`Workflow contains duplicate node id "${node.id}".`);
    }
    nodeIds.add(node.id);

    if (
      !isRecord(node.position) ||
      typeof node.position.x !== 'number' ||
      !Number.isFinite(node.position.x) ||
      typeof node.position.y !== 'number' ||
      !Number.isFinite(node.position.y)
    ) {
      throw new Error(`Node "${node.id}" must have a numeric x/y position.`);
    }
    assertOnlyKeys(node.position, ['x', 'y'], `Node "${node.id}" position`);
    if (node.label !== undefined && typeof node.label !== 'string') {
      throw new Error(`Node "${node.id}" label must be a string when provided.`);
    }
    if (node.config !== undefined && !isNodeConfig(node.config)) {
      throw new Error(`Node "${node.id}" config must contain string, number, or string-array values.`);
    }
  }

  const edgeIds = new Set<string>();
  for (const edge of value.edges) {
    if (
      !isRecord(edge) ||
      typeof edge.id !== 'string' ||
      typeof edge.source !== 'string' ||
      typeof edge.target !== 'string'
    ) {
      throw new Error('Each workflow edge must have string id, source, and target values.');
    }
    assertOnlyKeys(edge, ['id', 'source', 'target', 'sourceHandle', 'label'], `Edge "${edge.id}"`);
    if (edgeIds.has(edge.id)) {
      throw new Error(`Workflow contains duplicate edge id "${edge.id}".`);
    }
    edgeIds.add(edge.id);
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      throw new Error(`Edge "${edge.id}" references a node that does not exist.`);
    }
    if (edge.sourceHandle !== undefined && typeof edge.sourceHandle !== 'string') {
      throw new Error(`Edge "${edge.id}" sourceHandle must be a string when provided.`);
    }
    if (edge.label !== undefined && typeof edge.label !== 'string') {
      throw new Error(`Edge "${edge.id}" label must be a string when provided.`);
    }
  }
}

function isNodeConfig(value: unknown): value is NodeConfig {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (item) =>
        typeof item === 'string' ||
        (typeof item === 'number' && Number.isFinite(item)) ||
        (Array.isArray(item) && item.every((entry) => typeof entry === 'string')),
    )
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertOnlyKeys(
  value: Record<string, unknown>,
  allowedKeys: string[],
  description: string,
): void {
  const extraKeys = Object.keys(value).filter((key) => !allowedKeys.includes(key));
  if (extraKeys.length > 0) {
    throw new Error(`${description} contains unsupported field(s): ${extraKeys.join(', ')}.`);
  }
}
