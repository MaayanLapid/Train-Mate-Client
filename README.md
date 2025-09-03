# TrainMate Client

This is the **React frontend** for the TrainMate fitness tracking application.  
It communicates with the ASP.NET Core backend to manage trainees, exercises, exercise types, and workouts.

---

## Key Features

- React + React Router for navigation
- Material UI (MUI) for modern UI and RTL (Right-to-Left) Hebrew support
- Authentication & authorization (Admin / Client roles)
- Forms and lists for managing:
  - Trainees
  - Exercise types
  - Exercises
  - Workouts

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- NPM (comes with Node)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Train-Mate-Client.git
   cd Train-Mate-Client
2. Install dependencies
npm install
3. Run the client app
npm start

# Make sure the backend server (TrainMateServer) is running locally (default: https://localhost:7225).

## Project Structure
src/
├── components/      # Reusable components (Forms, Lists, etc.)
├── pages/           # Admin / Client / Login pages
├── services/        # API functions
├── context/         # Auth context
├── theme/           # MUI theme setup
└── config.js        # API base URLs

## Technologies Used
- React 18
- React Router
- Material UI (MUI)
- Context API (Auth)
- Create React App

## Notes
- The backend API must be running before starting the React client.
- API base URLs are defined in src/config.js.
