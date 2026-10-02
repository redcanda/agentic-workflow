import { Button } from './button';
import './list-input.css';

type ListInputProps = {
  label: string;
  placeholder?: string;
  value: string[];
  onChange: (value: string[]) => void;
};

export function ListInput({ label, placeholder, value, onChange }: ListInputProps) {
  return (
    <div className="space-y-2">
      {value.map((item, index) => (
        <div className="flex items-center gap-2" key={index}>
          <input
            aria-label={`${label} ${index + 1}`}
            className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={placeholder}
            value={item}
            onChange={(event) =>
              onChange(value.map((current, itemIndex) => (itemIndex === index ? event.target.value : current)))
            }
          />
          <Button
            aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
            className="list-input-remove size-9 shrink-0 px-0"
            onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
            variant="outline"
          >
            <svg
              aria-hidden="true"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.6"
              viewBox="0 0 24 24"
            >
              <path d="M4 7h16" />
              <path d="M10 11v6M14 11v6" />
              <path d="m5 7 1 14h12l1-14M9 7V4h6v3" />
            </svg>
          </Button>
        </div>
      ))}
      <Button
        className="w-full gap-2"
        onClick={() => onChange([...value, ''])}
        variant="outline"
      >
        <svg
          aria-hidden="true"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add case
      </Button>
    </div>
  );
}
