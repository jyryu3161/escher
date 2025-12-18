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
- December 18, 2025: Initial Replit setup
  - Configured webpack-dev-server for port 5000 with host 0.0.0.0
  - Added disableHostCheck for proxy compatibility
  - Set up Node.js 18 with OpenSSL legacy provider
