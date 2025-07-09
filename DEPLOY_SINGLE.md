# Single Service Deployment on Render (Free Tier)

This guide will help you deploy your Event Planner app as a single service on Render's free tier.

## What We've Set Up

1. **Combined Frontend + Backend**: Flask now serves both the API endpoints (under `/api/`) and the React frontend as static files
2. **Build Process**: The build script installs dependencies for both Python and Node.js, then builds the React app
3. **Single Service**: Everything runs as one web service, making it free tier compatible
4. **Fixed Python Version**: Uses Python 3.12.11 to avoid compatibility issues
5. **Modern PostgreSQL Driver**: Uses latest psycopg3 with binary extensions
6. **Flexible Dependencies**: Uses latest compatible versions

## Deployment Steps

### 1. Push Your Code to GitHub

```bash
git add .
git commit -m "Fix Python version and PostgreSQL driver compatibility"
git push origin main
```

### 2. Create a Web Service on Render

1. Go to [render.com](https://render.com) and log in
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `event-planner`
   - **Environment**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `cd backend && gunicorn -w 4 -b 0.0.0.0:$PORT run:app`
   - **Instance Type**: Free

### 3. Add Environment Variables

In the Render dashboard, add these environment variables:

- `FLASK_ENV` = `production`
- `SECRET_KEY` = (click "Generate" for a random value)
- `JWT_SECRET_KEY` = (click "Generate" for a random value)
- `DATABASE_URL` = (will be provided by Render's PostgreSQL - see next step)

### 4. Add PostgreSQL Database

1. In your Render dashboard, click "New" → "PostgreSQL"
2. Configure:
   - **Name**: `event-planner-db`
   - **Database Name**: `event_planner`
   - **User**: `event_planner_user`
   - **Region**: Same as your web service
3. After creation, copy the "External Database URL"
4. Go back to your web service settings
5. Add environment variable: `DATABASE_URL` = (paste the database URL)

### 5. Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your app
3. The build process will:
   - Install Python dependencies
   - Install Node.js dependencies
   - Build the React frontend
   - Start the Flask server

## How It Works

- **Frontend**: React app is built into `/frontend/dist/` and served by Flask
- **API**: All API endpoints are available under `/api/` prefix
- **Database**: PostgreSQL database with automatic table creation
- **Single URL**: Everything is served from one URL (e.g., `https://event-planner.onrender.com`)

## Free Tier Limitations

- **Spinning Down**: Service spins down after 15 minutes of inactivity
- **Spin Up Time**: Takes 30-60 seconds to wake up from sleep
- **Database**: Free PostgreSQL has limited storage and connections
- **Build Time**: 500 build hours per month

## Troubleshooting

1. **Build Fails**: Check the build logs for Node.js or Python errors
2. **App Won't Start**: Verify environment variables are set correctly
3. **Database Connection**: Ensure DATABASE_URL is properly formatted
4. **Static Files**: Make sure React build completed successfully

## Testing Locally

To test the single service setup locally:

```bash
# Build the frontend
./build.sh

# Start the Flask server
cd backend
python run.py
```

Visit `http://localhost:5000` to see both frontend and API working together.
