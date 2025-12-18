# Command Center (Vanilla)

## Features
- Editable notes (autosaved with debounce)
- Inline editable title
- Per-note delete
- Clear all notes (with confirmation)
- Persistent state via localStorage
- No frameworks, no build tools

## Architecture
- Centralized application state (`appState`)
- Deterministic render cycle
- Event delegation for dynamic UI
- Defensive DOM guards (fail-fast)
- Debounced persistence to avoid excessive writes

## Why Vanilla JS?
This project intentionally avoids frameworks to demonstrate:
- DOM manipulation fundamentals
- Event bubbling & delegation
- State-driven UI rendering
- Real-world autosave patterns

## Getting Started
Open `index.html` in a browser  
(or serve locally with any static server).

## Future Enhancements
- Additional widget types (checklists, timers)
- Drag-and-drop layout
- Keyboard shortcuts
- Export / import state
