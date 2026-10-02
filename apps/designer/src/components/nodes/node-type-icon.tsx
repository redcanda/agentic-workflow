import type { WorkflowNodeType } from './registry';
import './node-type-icon.css';

type NodeTypeIconProps = {
  type: WorkflowNodeType;
};

export function NodeTypeIcon({ type }: NodeTypeIconProps) {
  return (
    <svg
      aria-hidden="true"
      className="node-type-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      {renderIcon(type)}
    </svg>
  );
}

function renderIcon(type: WorkflowNodeType) {
  switch (type) {
    case 'start':
      return (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="m10 8.5 5.5 3.5-5.5 3.5z" />
        </>
      );
    case 'end':
      return (
        <>
          <path d="M6 4.5v15" />
          <path d="M6.5 5h10l-2 3.5 2 3.5h-10" />
          <path d="M10 17.5h8" />
        </>
      );
    case 'agent':
      return (
        <>
          <rect x="5" y="7" width="14" height="12" rx="3" />
          <path d="M12 4v3M9 12h.01M15 12h.01M9 16h6M3 11v4M21 11v4" />
        </>
      );
    case 'condition':
      return (
        <>
          <path d="m12 3.5 8.5 8.5-8.5 8.5L3.5 12 12 3.5Z" />
          <path d="M12 8v4l3 2" />
        </>
      );
    case 'switch':
      return (
        <>
          <path d="M5 6h14M5 12h14M5 18h14" />
          <path d="m15 4 2 2-2 2M9 10l-2 2 2 2m6 2 2 2-2 2" />
        </>
      );
    case 'http':
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M3.5 9h17M3.5 15h17M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3Z" />
        </>
      );
    case 'rag':
      return (
        <>
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m15.5 15.5 5 5M8 9h5M8 12h3" />
        </>
      );
    case 'code':
      return (
        <>
          <path d="m8.5 7-5 5 5 5M15.5 7l5 5-5 5M14 4l-4 16" />
        </>
      );
    case 'approval':
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 2.5 2.5L16.5 9" />
        </>
      );
  }
}
