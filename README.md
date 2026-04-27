# Strava Year in Review

A personal dashboard to visualize your Strava activity statistics. Connect with your Strava account and explore your yearly activity data with charts, heatmaps, and detailed stats.

![Strava Year in Review](https://via.placeholder.com/800x400?text=Strava+Year+in+Review)

## Features

- **OAuth Authentication** - Secure Strava login (no password stored)
- **Year Selection** - Filter data by any year
- **Activity Statistics**:
  - Total distance, time, elevation
  - Average distance per activity
  - Longest activity (with date)
  - Fastest pace (Run only, with date)
  - Calories burned
  - Heart rate stats (if available)
  - Current and longest streak
  
- **Visualizations**:
  - Monthly distance bar chart
  - Activities per month chart
  - Weekday vs weekend distribution
  - Year-over-year comparison
  - Activity type pie chart
  - GitHub-style activity heatmap

- **Dark/Light Mode** - Toggle between themes
- **Activity List** - Filterable and sortable activity table

## Getting Started

### Prerequisites

- Node.js 18+
- A Strava API application (free to create at https://www.strava.com/settings/api)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd strava_yearly_recap
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_CALLBACK_URL=http://localhost:3000/api/auth/callback
```

4. Run the development server:
```bash
npm run dev
```

5. Open http://localhost:3000 in your browser

### Setting up Strava API

1. Go to https://www.strava.com/settings/api
2. Create an application
3. Set Authorization Callback Domain to `localhost:3000`
4. Copy the Client ID and Client Secret to your `.env.local`

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── activities/       # Activity data API
│   │   └── auth/             # OAuth routes
│   ├── connect/              # Login page
│   ├── Dashboard.tsx         # Main dashboard
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/
│   ├── ActivityList.tsx      # Activity table
│   ├── Charts.tsx            # Recharts visualizations
│   ├── Heatmap.tsx           # GitHub-style heatmap
│   ├── StatCard.tsx          # Stat display card
│   ├── ThemeProvider.tsx     # Dark mode context
│   └── ThemeToggle.tsx       # Theme switch button
└── lib/
    ├── oauth.ts              # OAuth URL helper
    ├── server-auth.ts        # Token storage
    ├── strava.ts             # Stats calculations
    └── types.ts              # TypeScript types
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Tech Stack

- [Next.js 16](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Recharts](https://recharts.org/) - Charts and graphs
- [Strava API v3](https://developers.strava.com/) - Activity data

## License

MIT License - Personal use only. This project is not affiliated with Strava.

## Disclaimer

This project is for personal use only. It is not affiliated with, endorsed by, or connected to Strava. All activity data belongs to the user.