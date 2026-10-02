# agentic-workflow

## Implementation
Designer
- typescript
- UI: react + react flow + shadcn/ui + tailwind CSS

Engine
- python

## Designer UI
The workflow designer opens with a sample Start → AI Agent → End flow. Add nodes from
the left panel and connect nodes by dragging between their handles. Select a node to
open its details drawer on the right.

The node details drawer displays the node type, ID, canvas position, and connection
count. Edit the node label directly in the drawer. Close it with the X button, or
resize it by dragging its left edge. For keyboard resizing, focus the divider and use
the left/right arrow keys; hold Shift for larger steps, or use Home/End for the
minimum/maximum width.

## Running
### Terminal 1
```
cd apps/designer
npm install
npm run dev
```

### Terminal 2
```
cd apps/engine
uvicorn app.main:app --reload
```