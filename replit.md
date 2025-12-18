# Escher - Metabolic Pathway Visualization

## Overview
Escher is a web application for building, sharing, and embedding data-rich visualizations of metabolic pathways. Built with D3.js, Preact, and webpack.

## Project Structure
- `src/` - Main source code (React/Preact components, D3 visualizations)
- `dev-server/` - Development server entry point
- `docs/` - Documentation and example data
- `py/` - Python package for Jupyter integration
- `jupyter/` - Jupyter notebook extensions
- `icons/` - Icon fonts
- `jsonschema/` - JSON schema definitions

## Development Setup
- **Runtime**: Node.js 18
- **Build System**: Webpack 4
- **Package Manager**: npm
- **Dev Server Port**: 5000

## Key Commands
- `npm start` - Start development server (port 5000)
- `npm run build` - Build production bundle
- `npm test` - Run tests with Mocha

## Configuration Notes
- Uses `NODE_OPTIONS=--openssl-legacy-provider` for OpenSSL compatibility with Node.js 18
- webpack-dev-server configured with `disableHostCheck: true` for Replit proxy compatibility
- Host set to `0.0.0.0` to allow external access

## Dependencies
- D3.js (d3-selection, d3-zoom, d3-brush, etc.)
- Preact for UI components
- Babel for JSX transformation
- Webpack for bundling

## Recent Changes
- December 18, 2025: UX Improvement - Two-step reaction addition
  - Click on a reaction name in the dropdown now SELECTS it (highlights) instead of immediately adding
  - A green "Add" button appears when a reaction is selected
  - Click the "Add" button or press Enter to add the reaction to the canvas
  - Keyboard navigation (arrow keys) also updates the selection
  - Files modified: completely.js

- December 18, 2025: UX Improvement - Multi-selection drag for reaction labels
  - When dragging a reaction label, all selected nodes and text labels now move together
  - Undo/redo properly restores all moved elements
  - Files modified: Behavior.js (getReactionLabelDrag)

- December 18, 2025: UX Improvement - Single-click reaction selection
  - Reaction dropdown now supports single-click to select and add reactions (previously required double-click)
  - Shift+click on dropdown items preserves Build mode for continuous additions
  - Files modified: completely.js

- December 18, 2025: UX Improvement - Auto-switch to Select mode
  - Add Reaction mode: After adding a reaction, automatically switches to Select (brush) mode
  - Text mode: After adding a new text label, automatically switches to Select mode
  - Hold Shift key while adding to stay in the current mode for continuous additions
  - Files modified: BuildInput.js, TextEditInput.js, Behavior.js, Builder.jsx, completely.js

- December 18, 2025: Initial Replit setup
  - Configured webpack-dev-server for port 5000 with host 0.0.0.0
  - Added disableHostCheck for proxy compatibility
  - Set up Node.js 18 with OpenSSL legacy provider
