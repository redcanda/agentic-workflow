import { useLayoutEffect } from 'react';
import {
  Handle,
  Position,
  useUpdateNodeInternals,
  type Node as FlowNode,
  type NodeProps,
} from '@xyflow/react';
import { getNodeOutputs } from './registry';
import type { WorkflowNodeData } from './node';
import './workflow-canvas-node.css';

type WorkflowCanvasFlowNode = FlowNode<WorkflowNodeData, 'workflow'>;

export function WorkflowCanvasNode({ id, data }: NodeProps<WorkflowCanvasFlowNode>) {
  const updateNodeInternals = useUpdateNodeInternals();
  const outputs = getNodeOutputs(data.nodeType, data.config);
  const outputHandleKey = outputs.map((output) => output.id).join('\0');

  useLayoutEffect(() => {
    updateNodeInternals(id);
  }, [id, outputHandleKey, updateNodeInternals]);

  return (
    <>
      {data.nodeType !== 'start' && (
        <Handle aria-label="Input" position={Position.Top} type="target" />
      )}
      <span className="workflow-canvas-node-label">{data.label}</span>
      {outputs.map((output, index) => {
        const left = `${((index + 1) / (outputs.length + 1)) * 100}%`;

        return (
          <span className="workflow-canvas-output" key={output.id} style={{ left }}>
            <Handle
              aria-label={output.label}
              className="workflow-canvas-output-handle"
              id={output.id}
              position={Position.Bottom}
              type="source"
            />
          </span>
        );
      })}
    </>
  );
}
