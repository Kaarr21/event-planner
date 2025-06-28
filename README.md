# Event Planner Application

A full-stack web application for managing events, built with React frontend and Flask backend.

## Architecture

- **Frontend**: React with Vite (Port 3000)
- **Backend**: Flask with SQLAlchemy (Port 5000)
- **Database**: SQLite
- **Authentication**: JWT tokens

## Features

- User authentication (login/register)
- Event creation and management
- Task management for events
- RSVP functionality
- Past events view
- Dark/light theme toggle

## Prerequisites

- Python 3.8+
- Node.js and npm
- pipenv

## Quick Start

### Option 1: Use the startup script (Recommended)

```bash
./run_app.sh
```

This will start both the backend and frontend servers automatically.

### Option 2: Manual setup

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pipenv install
   ```

3. Run the Flask server:
   ```bash
   pipenv run python run.py
   ```

The backend will be available at `http://localhost:5000`

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## Issues Fixed

### Phase 1: Component and Import Issues
1. **Missing Export Statements**: Added missing `export default` statements to:
   - `EventList.jsx`
   - `Navbar.jsx`

2. **Missing Component**: Created `ProtectedRoute.jsx` component for authentication routing

3. **Import Path Errors**: Fixed incorrect import path for Navbar component in `App.jsx`

4. **Port Conflicts**: Added cleanup for existing processes on ports 3000 and 5000

### Phase 2: API and Backend Issues
5. **Date Format Handling**: Fixed date parsing issues between frontend and backend
   - Updated EventForm to properly handle datetime-local format
   - Enhanced backend date parsing to handle multiple formats
   - Added comprehensive error handling for invalid dates

6. **JWT Authentication**: Improved JWT token handling and error responses
   - Added proper error handling in authentication middleware
   - Enhanced user validation in protected routes
   - Added debugging logs to API calls

7. **Task Creation**: Fixed task creation and management
   - Corrected API endpoint calls with proper parameters
   - Added validation for required fields
   - Improved error handling and user feedback

8. **Environment Configuration**: Set up proper environment variables
   - Added required JWT and database configuration
   - Configured proper CORS and security settings

## API Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /events` - Get all events
- `POST /events` - Create new event
- `GET /events/<id>` - Get specific event
- `PUT /events/<id>` - Update event
- `DELETE /events/<id>` - Delete event
- `GET /tasks` - Get tasks
- `POST /tasks` - Create task
- `GET /rsvps` - Get RSVPs
- `POST /rsvps` - Create RSVP

## Environment Variables

The application uses `.env` files for configuration. Make sure to set up the required environment variables in both backend and root `.env` files.

## Development Notes

- The frontend uses Vite proxy configuration to forward API requests to the backend
- SQLite database is automatically created on first run
- JWT tokens are used for authentication
- The application supports both light and dark themes

## Troubleshooting

1. **Port already in use**: The startup script automatically kills existing processes, but you can manually free ports:
   ```bash
   lsof -ti:5000 | xargs kill -9  # Kill backend processes
   lsof -ti:3000 | xargs kill -9  # Kill frontend processes
   ```

2. **Import errors**: Make sure all components have proper export statements

3. **Database errors**: Delete the `instance/event_planner.db` file to reset the database

## Security Notes

- There are some npm audit warnings related to development dependencies
- These are non-critical for development but should be addressed for production
- The application is configured for development mode only
