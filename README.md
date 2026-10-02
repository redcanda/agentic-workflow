# agentic-workflow

## Implementation
Designer
- typescript
- UI: react + react flow + shadcn/ui + tailwind CSS

Engine
- python

## Running
### Terminal 1
```
cd apps/designer
npm run dev
```

### Terminal 2
```
cd apps/engine
uvicorn app.main:app --reload
```