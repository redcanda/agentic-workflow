export type WorkflowNodeType =
  | 'start'
  | 'end'
  | 'agent'
  | 'condition'
  | 'switch'
  | 'http'
  | 'rag'
  | 'code'
  | 'approval';

export type ConfigValue = string | number;
export type NodeConfig = Record<string, ConfigValue>;

type BaseConfigField = {
  key: string;
  label: string;
  description?: string;
  placeholder?: string;
};

export type ConfigField =
  | (BaseConfigField & { kind: 'text' | 'textarea' })
  | (BaseConfigField & { kind: 'number'; min?: number; max?: number; step?: number })
  | (BaseConfigField & {
      kind: 'select';
      options: { label: string; value: string }[];
    });

export type NodeDefinition = {
  type: WorkflowNodeType;
  label: string;
  description: string;
  color: string;
  config: NodeConfig;
  fields: ConfigField[];
};

export type NodeOutput = {
  id: string;
  label: string;
};

export const NODE_DEFINITIONS: Record<WorkflowNodeType, NodeDefinition> = {
  start: {
    type: 'start',
    label: 'Start',
    description: 'Workflow entry point',
    color: '#10b981',
    config: { inputName: 'input', inputDescription: '' },
    fields: [
      { key: 'inputName', kind: 'text', label: 'Input name', placeholder: 'input' },
      {
        key: 'inputDescription',
        kind: 'textarea',
        label: 'Input description',
        placeholder: 'Describe the data provided to this workflow',
      },
    ],
  },
  end: {
    type: 'end',
    label: 'End',
    description: 'Workflow exit point',
    color: '#f43f5e',
    config: { outputValue: '{{result}}' },
    fields: [
      {
        key: 'outputValue',
        kind: 'textarea',
        label: 'Output value',
        placeholder: 'Value to return when the workflow completes',
      },
    ],
  },
  agent: {
    type: 'agent',
    label: 'LLM',
    description: 'Generate a response with a language model',
    color: '#6366f1',
    config: { model: 'gpt-4o-mini', prompt: '', temperature: 0.7 },
    fields: [
      { key: 'model', kind: 'text', label: 'Model', placeholder: 'Model name' },
      {
        key: 'prompt',
        kind: 'textarea',
        label: 'Prompt',
        placeholder: 'Describe what the model should do',
      },
      {
        key: 'temperature',
        kind: 'number',
        label: 'Temperature',
        min: 0,
        max: 2,
        step: 0.1,
      },
    ],
  },
  condition: {
    type: 'condition',
    label: 'Condition',
    description: 'Branch based on a condition',
    color: '#f59e0b',
    config: { expression: '' },
    fields: [
      {
        key: 'expression',
        kind: 'textarea',
        label: 'Condition',
        placeholder: 'Enter an expression that evaluates to true or false',
      },
    ],
  },
  switch: {
    type: 'switch',
    label: 'Switch',
    description: 'Route by matching a value',
    color: '#eab308',
    config: { value: '', cases: '' },
    fields: [
      { key: 'value', kind: 'text', label: 'Value to match', placeholder: '{{input.value}}' },
      {
        key: 'cases',
        kind: 'textarea',
        label: 'Cases',
        placeholder: 'One case value per line',
        description: 'Create one outgoing route for each case.',
      },
    ],
  },
  http: {
    type: 'http',
    label: 'HTTP Request',
    description: 'Call an external API',
    color: '#0ea5e9',
    config: { method: 'GET', url: '', headers: '' },
    fields: [
      {
        key: 'method',
        kind: 'select',
        label: 'Method',
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'PATCH', value: 'PATCH' },
          { label: 'DELETE', value: 'DELETE' },
        ],
      },
      { key: 'url', kind: 'text', label: 'URL', placeholder: 'https://api.example.com' },
      {
        key: 'headers',
        kind: 'textarea',
        label: 'Headers (JSON)',
        placeholder: '{\n  "Content-Type": "application/json"\n}',
      },
    ],
  },
  rag: {
    type: 'rag',
    label: 'RAG',
    description: 'Retrieve relevant context',
    color: '#8b5cf6',
    config: { collection: '', query: '', topK: 5 },
    fields: [
      { key: 'collection', kind: 'text', label: 'Collection', placeholder: 'Knowledge base' },
      {
        key: 'query',
        kind: 'textarea',
        label: 'Search query',
        placeholder: 'What information should be retrieved?',
      },
      { key: 'topK', kind: 'number', label: 'Results', min: 1, max: 100, step: 1 },
    ],
  },
  code: {
    type: 'code',
    label: 'Code',
    description: 'Run a code step',
    color: '#64748b',
    config: { language: 'python', source: '' },
    fields: [
      {
        key: 'language',
        kind: 'select',
        label: 'Language',
        options: [
          { label: 'Python', value: 'python' },
          { label: 'JavaScript', value: 'javascript' },
        ],
      },
      {
        key: 'source',
        kind: 'textarea',
        label: 'Code',
        placeholder: 'Write the code for this step',
      },
    ],
  },
  approval: {
    type: 'approval',
    label: 'Approval',
    description: 'Pause for human approval',
    color: '#ec4899',
    config: { message: '', approvers: '' },
    fields: [
      {
        key: 'message',
        kind: 'textarea',
        label: 'Approval message',
        placeholder: 'Explain what needs approval',
      },
      {
        key: 'approvers',
        kind: 'textarea',
        label: 'Approvers',
        placeholder: 'One approver per line',
      },
    ],
  },
};

export const WORKFLOW_NODE_TYPES: WorkflowNodeType[] = [
  'start',
  'end',
  'agent',
  'condition',
  'switch',
  'http',
  'rag',
  'code',
  'approval',
];

export function isWorkflowNodeType(value: unknown): value is WorkflowNodeType {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(NODE_DEFINITIONS, value);
}

export function getNodeOutputs(type: WorkflowNodeType, config: NodeConfig): NodeOutput[] {
  switch (type) {
    case 'end':
      return [];
    case 'condition':
      return [
        { id: 'true', label: 'True' },
        { id: 'else', label: 'Else' },
      ];
    case 'switch': {
      const cases = String(config.cases ?? '')
        .split('\n')
        .map((value) => value.trim())
        .filter(Boolean);
      const occurrences = new Map<string, number>();
      const outputs = cases.map((value) => {
        const occurrence = occurrences.get(value) ?? 0;
        occurrences.set(value, occurrence + 1);
        return { id: `case-${encodeURIComponent(value)}-${occurrence}`, label: value };
      });
      return [...outputs, { id: 'default', label: 'Default' }];
    }
    default:
      return [{ id: 'next', label: 'Next' }];
  }
}
