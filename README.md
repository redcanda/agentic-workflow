# agentic-workflow

Visual workflow designer and Python execution-engine project. The designer is an
early scaffold; the engine and workflow persistence/API integration are not yet
implemented.

## Technology

- **Designer:** React, TypeScript, React Flow (`@xyflow/react`), shadcn/ui-style
  components, Tailwind CSS v4, and Vite.
- **Engine:** Python (implementation and dependency setup pending).
- **Workflow format:** JSON validated against
  [`packages/workflow-schema/schema.json`](./packages/workflow-schema/schema.json).

## Prerequisites

- Node.js and npm. Use a current Node.js LTS release compatible with the installed
  Vite version.
- Python will be needed for the engine once its package configuration is in place.

## Run the designer

From the repository root:

```powershell
cd apps/designer
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173/`). Keep the
development server running while using the designer.

To check a production build:

```powershell
cd apps/designer
npm run build
```

## Designer features

- The canvas starts with a sample **Start → AI Agent → End** workflow.
- Add nodes from the left palette. Connect nodes by dragging from one node handle to
  another.
- Select a node to open its details drawer on the right. The drawer shows its type,
  ID, position, and connection count, and lets you edit its label.
- Close the drawer with its X button. Resize it by dragging the left divider, or
  focus the divider and use the arrow keys. Hold Shift for larger keyboard steps;
  Home and End set the minimum and maximum widths.
- Select an edge and press Delete or Backspace, or use the Delete edge button.
- The current designer keeps edits in browser memory; saving, exporting, and
  connecting to the engine are not implemented yet.

The schema includes node types beyond the ones currently available in the designer.
The schema does not yet define per-node `config` fields.

## Project layout

```text
apps/
  designer/
    src/
      components/
        drawer/       Resizable node-details panel
        nodes/        Selected-node details content
        ui/           Reusable UI components
      App.tsx         Designer layout and workflow state
      App.css         Designer and React Flow canvas styles
      index.css       Tailwind setup, theme tokens, and global reset
      main.tsx        React application entry point
  engine/             Python engine scaffold; setup is pending
packages/
  workflow-schema/
    schema.json       Workflow JSON Schema
    examples/         Example workflow JSON
```

## Designer development guidance

### Component organization

- Put reusable UI in `apps/designer/src/components/`, grouped by purpose. Keep the
  node-details content in `components/nodes/node.tsx` and the resizable panel
  container in `components/drawer/drawer.tsx`.
- Keep workflow state and coordination in `App.tsx`; keep reusable presentation and
  interaction details in their respective components.
- Use TypeScript types for component props and workflow data. Prefer existing
  dependencies and helpers over adding duplicate utilities.
- Keep components focused and reusable. Use semantic HTML and accessible labels for
  interactive controls.

### Styling

- Every UI `.tsx` file should have a same-directory, same-basename `.css` file
  (for example, `components/drawer/drawer.tsx` and
  `components/drawer/drawer.css`) and import that stylesheet from the component.
- Put component-specific styles in that component stylesheet. Keep
  `src/index.css` for Tailwind setup, shared theme tokens, and global element styles.
- Use Tailwind utilities for straightforward layout and styling; use the paired CSS
  file for component-specific effects or styles that are awkward to express as
  utilities.
- Reuse the shared theme variables (such as `--background`, `--foreground`,
  `--border`, and `--ring`) so components stay visually consistent.
- `main.tsx` is the application bootstrap rather than a UI component; global styles
  are loaded there through `index.css`.

### UI components

- `components.json` contains the shadcn/ui configuration. Reusable UI primitives
  live in `components/ui/`; follow their established variants and accessibility
  patterns when adding controls.
- Keep React Flow's required stylesheet imported by the application entry point.
  Put project-specific node, edge, and canvas styling in the designer stylesheet.

### Workflow data

- Keep workflow JSON aligned with `packages/workflow-schema/schema.json`.
- A workflow currently requires `version`, `name`, `nodes`, and `edges`.
- Nodes require an `id`, supported `type`, and numeric `position` (`x` and `y`);
  edges require an `id`, `source`, and `target`.
- Keep additional node and edge fields within the schema. Update the schema and
  example workflows alongside changes to the workflow data format.

## Engine status

The Python engine is not ready to run yet: its package/dependency configuration and
application entry point still need implementation. Add the Python project setup
before documenting or relying on an engine start command.
