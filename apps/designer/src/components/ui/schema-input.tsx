import { useId } from 'react';
import type {
  JsonSchemaObject,
  SchemaPropertyType,
} from '../nodes/registry';
import { Button } from './button';
import './schema-input.css';

export type { JsonSchemaObject, SchemaPropertyType } from '../nodes/registry';

export type SchemaEditorPropertyType = SchemaPropertyType | 'any';

export type SchemaProperty = {
  name: string;
  type: SchemaEditorPropertyType;
  required: boolean;
};

export function isJsonSchemaObject(value: unknown): value is JsonSchemaObject {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value) ||
    !('type' in value) ||
    value.type !== 'object' ||
    !('properties' in value) ||
    typeof value.properties !== 'object' ||
    value.properties === null ||
    Array.isArray(value.properties) ||
    !('additionalProperties' in value) ||
    value.additionalProperties !== false
  ) {
    return false;
  }

  const properties = value.properties as Record<string, unknown>;
  const propertyTypesAreValid = Object.values(properties).every(
    (property) =>
      typeof property === 'object' &&
      property !== null &&
      !Array.isArray(property) &&
      ((!('type' in property) && Object.keys(property).length === 0) ||
        ('type' in property &&
          typeof property.type === 'string' &&
          isSchemaPropertyType(property.type) &&
          Object.keys(property).length === 1)),
  );
  if (!propertyTypesAreValid) return false;

  if (!('required' in value)) return true;
  return (
    Array.isArray(value.required) &&
    value.required.every(
      (property) => typeof property === 'string' && Object.hasOwn(properties, property),
    )
  );
}

type SchemaInputProps = {
  label: string;
  value: SchemaProperty[];
  onChange: (schema: JsonSchemaObject | null, properties: SchemaProperty[]) => void;
};

const PROPERTY_TYPES: SchemaPropertyType[] = ['string', 'number', 'boolean', 'null'];
const EDITOR_PROPERTY_TYPES: SchemaEditorPropertyType[] = ['any', ...PROPERTY_TYPES];

function isSchemaPropertyType(value: string): value is SchemaPropertyType {
  return PROPERTY_TYPES.some((type) => type === value);
}

function isSchemaEditorPropertyType(value: string): value is SchemaEditorPropertyType {
  return EDITOR_PROPERTY_TYPES.some((type) => type === value);
}

function getPropertyError(properties: SchemaProperty[], index: number): string | null {
  const name = properties[index].name;
  if (!name.trim()) return 'Property name is required.';
  if (
    properties.some(
      (property, propertyIndex) => propertyIndex !== index && property.name === name,
    )
  ) {
    return 'Property names must be unique.';
  }
  return null;
}

function createJsonSchema(properties: SchemaProperty[]): JsonSchemaObject | null {
  if (properties.some((_, index) => getPropertyError(properties, index))) return null;

  const schemaProperties: JsonSchemaObject['properties'] = {};
  for (const { name, type } of properties) {
    schemaProperties[name] = type === 'any' ? {} : { type };
  }

  const definition: JsonSchemaObject = {
    type: 'object',
    properties: schemaProperties,
    additionalProperties: false,
  };
  const required = properties
    .filter((property) => property.required)
    .map((property) => property.name);

  if (required.length > 0) {
    definition.required = required;
  }

  return definition;
}

export function SchemaInput({ label, value, onChange }: SchemaInputProps) {
  const inputId = useId();
  const updateProperties = (properties: SchemaProperty[]) => {
    onChange(createJsonSchema(properties), properties);
  };

  return (
    <div className="schema-input">
      <div className="schema-input-rows">
        {value.map((property, index) => {
          const error = getPropertyError(value, index);
          const errorId = `${inputId}-property-${index}-error`;

          return (
            <div className="schema-input-row" key={index}>
              <div className="schema-input-property">
                <input
                  aria-describedby={error ? errorId : undefined}
                  aria-invalid={error ? true : undefined}
                  aria-label={`${label} property ${index + 1} name`}
                  className="schema-input-name"
                  placeholder="Property name"
                  value={property.name}
                  onChange={(event) =>
                    updateProperties(
                      value.map((current, propertyIndex) =>
                        propertyIndex === index
                          ? { ...current, name: event.target.value }
                          : current,
                      ),
                    )
                  }
                />
                <select
                  aria-label={`${label} property ${index + 1} type`}
                  className="schema-input-type"
                  value={property.type}
                  onChange={(event) => {
                    const type = event.target.value;
                    if (!isSchemaEditorPropertyType(type)) return;

                    updateProperties(
                      value.map((current, propertyIndex) =>
                        propertyIndex === index ? { ...current, type } : current,
                      ),
                    );
                  }}
                >
                  {EDITOR_PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <label className="schema-input-required">
                <input
                  aria-label={`${label} property ${index + 1} required`}
                  checked={property.required}
                  type="checkbox"
                  onChange={(event) =>
                    updateProperties(
                      value.map((current, propertyIndex) =>
                        propertyIndex === index
                          ? { ...current, required: event.target.checked }
                          : current,
                      ),
                    )
                  }
                />
                Required
              </label>
              <Button
                aria-label={`Remove ${label.toLowerCase()} property ${index + 1}`}
                className="list-input-remove schema-input-remove size-9 shrink-0 px-0"
                onClick={() =>
                  updateProperties(value.filter((_, propertyIndex) => propertyIndex !== index))
                }
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
              {error && (
                <span className="schema-input-error" id={errorId} role="alert">
                  {error}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <Button
        aria-label={`Add property to ${label}`}
        className="w-full gap-2"
        onClick={() =>
          updateProperties([...value, { name: '', type: 'string', required: true }])
        }
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
        Add property
      </Button>
    </div>
  );
}
