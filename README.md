# agentic-workflow

Visual workflow designer and Python execution-engine project. The designer is an
early scaffold; workflow file/API persistence and the execution engine are not yet
implemented.

## Technology

- **Designer:** React, TypeScript, React Flow (`@xyflow/react`), shadcn/ui-style
  components, Tailwind CSS v4, and Vite.
- **Engine:** Python (implementation and dependency setup pending).
- **Workflow format:** JSON validated against
  [`packages/workflow-schema/schema.json`](./packages/workflow-schema/schema.json).
  The JSON Schema is the source of truth for the persisted workflow format.

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
- Add Start, End, LLM, If, Switch, HTTP Request, RAG, Code, and Approval nodes from
  the left palette by dragging them onto the canvas; clicking a palette item adds
  it using the default placement. Connect nodes by dragging from one node handle
  to another.
- Canvas nodes use a subtle raised-card treatment; selecting a node adds a visible
  focus ring while retaining its shadow.
- Canvas nodes display the editable label first and node type beneath it, except
  Start and End, whose type is omitted.
- Connections follow node-type output rules: Start has one outgoing route and no
  incoming routes, End has no outgoing route, If has separate True and Else routes,
  Switch has one route per configured case plus Default, and other nodes have one
  outgoing route. Each output route can be connected once. If and Switch edge labels
  identify the branch used by each connection.
- Configure Switch cases as individual values in the node details; add or remove
  case rows to control the node's outgoing routes. Case values are stored as an
  array in the Switch node's config.
- Define the Start node's input payload as a JSON Schema object by adding
  properties, selecting their types (including **Any** for unconstrained values),
  and marking required fields.
- Select a node to open its details drawer on the right. The drawer shows its type,
  ID, position, and connection count, and lets you edit its label and
  type-specific configuration.
- Close the drawer with its X button. Resize it by dragging the left divider, or
  focus the divider and use the arrow keys. Hold Shift for larger keyboard steps;
  Home and End set the minimum and maximum widths.
- Select an edge and press Delete or Backspace, or use the Delete edge button.
- The current designer keeps edits in browser memory; saving, exporting, and
  connecting to the engine are not implemented yet.

The designer maps **LLM** to the schema's `agent` type and **If** to `condition`.
Each node's editable settings are held in its `config` object. The schema allows
type-specific configuration as an object but does not yet validate individual config
fields. The typed persisted model and React Flow adapters are in
[`apps/designer/src/workflow/workflow.ts`](apps/designer/src/workflow/workflow.ts).
The adapters keep canvas-only properties out of workflow JSON and preserve labels,
configuration, edge branch handles, and edge labels. Node labels are optional in the
schema for compatibility with workflows that predate editable labels.

## Project layout

```text
apps/
  designer/
    src/
      components/
        drawer/       Resizable node-details panel
        nodes/        Node type registry and type-specific detail fields
        ui/           Reusable controls, including editable lists and JSON Schema input
      workflow/
        workflow.ts   Persisted workflow types and React Flow adapters
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
  Put project-specific node, edge, and canvas styling in `App.css`. Preserve React
  Flow's positioning and interaction behavior when styling nodes; use shadows and
  outlines for depth and selection rather than overriding its transforms.
- When a custom node adds, removes, or moves handles dynamically, call React Flow's
  `useUpdateNodeInternals` after the rendered handles change so connection hit-testing
  and validation use the current handle positions.

### Workflow data

- Keep workflow JSON aligned with `packages/workflow-schema/schema.json`.
- A workflow currently requires `version`, `name`, `nodes`, and `edges`.
- Nodes require an `id`, supported `type`, and numeric `position` (`x` and `y`);
  edges require an `id`, `source`, and `target`.
- Add node types to `components/nodes/registry.ts` so the palette, color, defaults,
  and type-specific inspector fields have one source of truth. Use only node types
  permitted by the schema, and map friendly UI labels to their schema type there.
- Define node output handles through `getNodeOutputs` in the registry. Enforce
  connection limits in both the React Flow connection validator and the connect
  callback; Start must not receive connections, and End must not emit them.
- Give each node type its own appropriate configuration fields and sensible
  defaults. Keep configuration values under `node.data.config` so they can be
  translated to the schema's node `config` when workflow serialization is added.
- Keep additional node and edge fields within the schema. Update the schema and
  example workflows alongside changes to the workflow data format.

## Software engineering guidance

Follow this checklist when implementing or changing behavior:

- **Understand before editing.** Read the relevant component, its callers, tests,
  and nearby conventions first. Trace the behavior from input to output so the
  change addresses the cause rather than only a visible symptom.
- **Keep the change focused.** State the behavior being changed, make cohesive
  edits, and avoid unrelated cleanup. Prefer a clear, direct solution over
  speculative features or abstractions.
- **Solve the current problem simply.** Prefer the smallest clear implementation
  that meets an observed requirement. Delay speculative extension points and
  abstractions until a real use case needs them; see Martin Fowler's explanation
  of [YAGNI](https://martinfowler.com/bliki/Yagni.html).
- **Use patterns deliberately.** Check whether an existing pattern fits the
  recurring problem, and weigh its trade-offs before introducing it. Do not add
  layers, factories, interfaces, or indirection solely to make code appear
  extensible; prefer the simplest design that remains easy to test and change.
- **Keep one source of truth for UI state.** Derive values from existing React state
  instead of storing duplicate state. Keep data flow explicit, and move related,
  increasingly complex state transitions into a reducer only when that complexity
  is present. See React's guidance on
  [managing state](https://react.dev/learn/managing-state).
- **Make boundaries explicit.** Validate workflow JSON at import/API boundaries.
  Keep React Flow's interactive canvas state separate from the persisted workflow
  format; map between them explicitly rather than saving library-specific fields.
- **Keep the workflow schema in sync.** Whenever a change adds, removes, or
  modifies persisted workflow fields or their constraints, update
  [`packages/workflow-schema/schema.json`](./packages/workflow-schema/schema.json)
  in the same change. Keep the TypeScript workflow types, serialization/loading
  adapters, and example workflows consistent with that schema, and verify that
  representative workflow JSON validates against it. Changes limited to
  editor-only state do not require a schema update.
- **Preserve type safety.** Keep TypeScript strict, describe component and workflow
  data with types, and avoid suppressing errors with broad casts. TypeScript's
  [Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) explains its
  role in catching type errors before runtime.
- **Validate at boundaries.** Treat user input, imported workflow files, and
  external responses as untrusted. Validate them where they enter the system,
  enforce workflow invariants in the UI and data layer, and do not rely on visual
  controls alone for correctness.
- **Make security part of implementation.** Minimize sensitive data, use
  established platform APIs for encoding and validation, and avoid custom
  cryptography or unsafe evaluation of user-provided code. Use the
  [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) for practical,
  topic-specific security guidance.
- **Handle failures visibly.** Surface validation, network, and execution failures
  through a clear error result or user-facing state. Don't silently discard errors
  or return success-shaped fallbacks.
- **Test behavior at the appropriate level.** Unit-test isolated transformations
  and node logic, integration-test schema/API/execution boundaries, and reserve
  browser tests for important user workflows. Keep tests automated and focused;
  Martin Fowler's [practical test pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
  discusses balancing test levels.
- **Make changes reviewable.** Keep changes cohesive, preserve nearby conventions,
  update directly related documentation, and verify the exact behavior changed
  with focused tests plus the relevant build or type check (for example,
  `npm run build`). Review the final diff for unintended changes. Google's
  [code review standard](https://google.github.io/eng-practices/review/reviewer/standard.html)
  emphasizes maintainability and overall code health.

## Design patterns

Patterns are tools for recurring problems, not requirements to apply everywhere.
Choose one when it makes current behavior easier to understand, extend, or test;
otherwise prefer straightforward functions and components.

- **Composition (designer UI):** Assemble the canvas, palette, drawer, and node
  details from focused components. Pass data and callbacks through clear props;
  avoid coupling reusable UI to the whole application state.
- **Controlled state (designer UI):** Keep workflow nodes and edges in the
  React Flow state already owned by the application. Inspector fields should
  receive their current value and report edits through callbacks rather than
  maintaining a competing copy.
- **Adapter / boundary mapper (workflow format):** Translate between React Flow
  nodes/edges and the schema's workflow JSON through the typed conversion helpers.
  This keeps editor-only data out of saved files. Update the schema, adapters, and
  examples together whenever the persisted format changes.
- **Strategy (engine node execution):** If node implementations need different
  execution algorithms behind the same contract, use a typed node-handler
  interface and dispatch by node type. Keep handlers independently testable; avoid
  creating a class hierarchy if a simple function map is sufficient.
- **Registry (engine handlers):** A node-type-to-handler map can make supported
  node types explicit and avoid a growing chain of conditionals. Introduce it when
  the engine has enough handlers to benefit; keep it aligned with schema-supported
  types and report unsupported types explicitly.

For pattern definitions and trade-offs, see the
[design-pattern catalog](https://refactoring.guru/design-patterns/catalog).
Its [overview](https://refactoring.guru/design-patterns/what-is-pattern) describes
patterns as adaptable solutions rather than copy-and-paste code.
Use the examples above as guidance for where a pattern may fit this project, not
as a requirement to introduce every listed pattern.

## Engine status

The Python engine is not ready to run yet: its package/dependency configuration and
application entry point still need implementation. Add the Python project setup
before documenting or relying on an engine start command.

## Further reading

- [React: Thinking in React](https://react.dev/learn/thinking-in-react) — component
  boundaries and building UI from a design.
- [React: Managing State](https://react.dev/learn/managing-state) — structuring
  state and avoiding redundant state.
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) —
  types and compiler behavior.
- [Google Engineering Practices: Code Review Standard](https://google.github.io/eng-practices/review/reviewer/standard.html) —
  maintainability and review principles.
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) — practical
  application-security guidance organized by topic.
- [Martin Fowler: YAGNI](https://martinfowler.com/bliki/Yagni.html) — avoid
  speculative features and abstractions.
- [Martin Fowler: Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html) —
  balancing automated test levels.
- [Refactoring.Guru: Design Patterns](https://refactoring.guru/design-patterns/catalog) —
  pattern catalog and examples.
