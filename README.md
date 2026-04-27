# Strava Year in Review

A personal dashboard to visualize your Strava activity statistics. Built with Next.js, React, TypeScript, and Tailwind CSS.

## Features

- **OAuth Authentication** - Connect securely via Strava's OAuth
- **Year Selection** - Filter and view stats by year
- **Activity Statistics**:
  - Total distance, time, elevation, activities
  - Average distance, longest activity, fastest pace
  - Calories burned, heart rate data (if available)
  - Current streak and longest streak
  - Weekend vs weekday breakdown
- **Visualizations**:
  - Monthly distance bar chart
  - Activities per month bar chart
  - Activity type distribution pie chart
  - Weekday distribution bar chart (Mon-Sun)
  - Year-over-year comparison line chart
  - GitHub-style activity heatmap
- **Activity List** - Filterable and sortable list of all activities
- **Dark/Light Mode** - Toggle between themes

## Getting Started

### Prerequisites

- Node.js 18+
- A Strava API application (free at https://www.strava.com/settings/api)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd strava_yearly_recap
```

2. Install dependencies:
```bash
npm install
```

3. Create your Strava API application:
   - Go to https://www.strava.com/settings/api
   - Create an application
   - Set Authorization Callback Domain to your domain (e.g., `localhost:3000` for development)

4. Configure environment variables:
```bash
# Edit .env.local with your credentials:
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_CALLBACK_URL=http://localhost:3000/api/auth/callback
```

5. Run the development server:
```bash
npm run dev
```

6. Open http://localhost:3000 and click "Connect with Strava"

### Building for Production

```bash
npm run build
npm start
```

## Tech Stack

- **Next.js 16** - App Router
- **React 19** with TypeScript
- **Tailwind CSS 4** - Styling
- **Recharts** - Charts and visualizations
- **Strava API v3** - Activity data

## License

This project is for personal use only. Not affiliated with Strava.

## Notes

- Activity data is cached in memory for 30 minutes to reduce API calls
- Tokens are stored in HTTP-only cookies for security
- Some statistics (calories, heart rate) require the activity to have that data recorded
- Week starts on Monday for all date-related calculations