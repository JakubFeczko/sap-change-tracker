# SAP Change Tracker

Local web app for tracking SAP/Fiori project objects, verification status, comments, and dependencies.

## Goal

This tool helps track manual synchronization between internal SAP/Fiori development objects and a client environment where GitHub or external integrations are not available.

Planned object types include:

- CDS views
- ABAP classes
- Data elements
- Domains
- Programs
- UI5 files
- Object dependencies

## Current Scope

- Track SAP/Fiori objects in a clear structure view.
- Mark verification status for manual client synchronization.
- Keep comments on changed or blocked objects.
- Display object dependencies in a graph view.
- Prepare the application structure for a later local database-backed API.

## Development

Install dependencies:

```bash
npm install
```

Run the app locally and expose it to the local network:

```bash
npm run dev
```

Vite will print a local URL and a network URL. Other devices in the same network can open the network URL, for example `http://192.168.1.50:5173`.

## Tech Stack

- React
- TypeScript
- Vite
- React Flow through `@xyflow/react`
- Lucide React icons
