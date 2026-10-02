import { Handle, Position, type Node as FlowNode, type NodeProps } from '@xyflow/react';
import { getNodeOutputs } from './registry';
import type { WorkflowNodeData } from './node';
import './workflow-canvas-node.css';

type WorkflowCanvasFlowNode = FlowNode<WorkflowNodeData, 'workflow'>;

export function WorkflowCanvasNode({ data }: NodeProps<WorkflowCanvasFlowNode>) {
  const outputs = getNodeOutputs(data.nodeType, data.config);

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
            {(data.nodeType === 'condition' || data.nodeType === 'switch') && (
              <span className="workflow-canvas-output-label">{output.label}</span>
            )}
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
