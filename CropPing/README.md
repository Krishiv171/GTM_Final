# CropPing Demo v2

A lightweight React + Vite prototype for a farm input reminder service. It helps simulate a farmer onboarding flow, generate crop-stage calendars, and preview reminder delivery logic for a crop advisory workflow.

## Overview

CropPing Demo v2 is a browser-based prototype designed to showcase how a field service could:

- collect basic farmer and crop information
- generate a crop stage timeline from sowing date
- simulate reminder delivery via WhatsApp or SMS
- track reminder usefulness and feedback
- show pilot economics and operational metrics

The app stores demo data locally in the browser using `localStorage`, making it easy to test without a backend.

## Features

- Farmer profile setup with consent acknowledgement
- Crop-specific stage calendars for Wheat, Rice, Cotton, Vegetables, and Other
- Current/upcoming stage tracking based on the sowing date
- Reminder preview and simulated delivery workflow
- Feedback capture for message usefulness
- Operations dashboard with pilot cost and recent activity
- Reset demo control for quick testing

## Project Structure

```text
.
├── index.html
├── package.json
├── src/
│   ├── main.jsx
│   └── styles.css
├── dist/
├── node_modules/
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal (typically `http://localhost:5173`).

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## How the Demo Works

1. Open the app and add a farmer profile.
2. Select a crop and enter the sowing date.
3. The app automatically creates a crop calendar with relevant stages.
4. Review the overview and reminder page.
5. Simulate reminder delivery and capture farmer feedback.
6. Monitor pilot metrics in the operations view.

## Notes

This is a prototype and not connected to any real messaging backend or database. It is intentionally designed for UI and workflow demonstration, with all state kept in-browser for local experimentation.