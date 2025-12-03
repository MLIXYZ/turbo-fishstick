# Video Game Key Distribution Platform
**Group 5 Project**

design https://drive.google.com/drive/folders/1vAHhsOOfu9PDQofsiP6NyjCGvk6msfY9?usp=sharing

## Overview

This platform provides a seamless marketplace for buying and selling digital video game keys. Users can browse available games, make secure purchases, and instantly receive their game activation keys.

## Tech Stack

### Frontend
- **React**
- **Material UI**
- **Zustand**
- **Axios**
- **Luxon**
- **Kysely**

### Backend
- **Express.js**
- **MySQL**
- **TypeScript**
- **Nodemon**

### Development Tools
- **Prettier**
- **ESLint**
- **Vite**
- **Concurrently**

## Quick Start

### Installation

**Install all dependencies at once:**
```bash
npm run install:all
```

Or install manually:
```bash
npm install              # Root dependencies
cd client && npm install # Frontend dependencies
cd ../server && npm install # Backend dependencies
```

### Running the Application

**Development Mode (Recommended):**
```bash
npm run dev
```
This starts both servers:
- React frontend → `http://localhost:5173`
- Express backend → `http://localhost:3000`

**Run Separately:**
```bash
npm run server  # Express only
npm run client  # React only
```

**Build:**
```bash
npm run build:client  # Build React app
npm run build:server  # Build Express app
```

