# Nuclear Exam Quiz Application

A comprehensive quiz application for nuclear engineering exam preparation with 1,319 questions across 22 topics.

## Features

- ✅ **1,319 Nuclear Engineering Questions** across 22 topics
- ✅ **Topic Selection** with checkboxes and select all/deselect all
- ✅ **Multiple Quiz Modes**:
  - Immediate feedback (Duolingo-style)
  - Practice test mode (50 questions, no feedback until end)
- ✅ **Configurable Quiz Length** (50 questions button + custom input)
- ✅ **Smart Question Distribution** across selected topics
- ✅ **Score Tracking & History** by topic and overall
- ✅ **Preserved Formatting**:
  - Multi-line questions and answers
  - Superscript and subscript text
  - Special characters (°, ², ³, etc.)
  - Indented columns for given information
  - Column headers for answer choices
- ✅ **Image Support** for diagram-based questions
- ✅ **Azure Hosting** ready

## Topics Covered

- Basic Energy Concepts
- Breakers, Relays, and Disconnects
- Control Rods
- Controllers and Positioners
- Core Thermal Limits
- Demins and Ion Exchange
- Fluid Statics and Dynamics
- Heat Exchangers
- Heat Transfer
- Motors and Generators
- Neutron Life Cycle
- Neutrons
- Pumps
- Reactivity Coefficients
- Reactor Kinetics and Neutron Sources
- Reactor Operational Physics
- Sensors and Detectors
- Thermal Hydraulics
- Thermodynamic Cycles
- Thermodynamic Processes
- Thermodynamic Units and Properties
- Valves

## Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Hosting**: Azure App Service + Static Web Apps
- **Images**: Azure Blob Storage

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
nuclear-quiz-app/
├── frontend/          # React application
├── backend/           # Node.js API
├── data/              # Question data and images
├── database/          # Schema and migrations
└── deployment/        # Azure deployment configs
```

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up database: `npm run db:setup`
4. Start development: `npm run dev`

## Deployment

The application is configured for Azure deployment with:
- Frontend: Azure Static Web Apps
- Backend: Azure App Service
- Database: Azure Database for PostgreSQL
- Images: Azure Blob Storage

## License

All rights reserved. Nuclear exam content used with permission for educational purposes.