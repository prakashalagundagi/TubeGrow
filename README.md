# TubeGrow - YouTube Creator Growth Tool

A comprehensive web application that helps YouTube creators optimize their content with SEO tools, video analysis, and growth insights.

## Features

- **SEO Generator**: Create optimized titles, descriptions, tags, and thumbnail text
- **Video Analysis**: Analyze YouTube videos for performance metrics
- **Comment Sentiment Analysis**: Understand audience engagement
- **User Dashboard**: Track history and manage projects
- **Premium Features**: Unlimited searches, bulk analysis, competitor comparison

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Responsive Design
- Dark Mode

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication

### APIs
- YouTube Data API (accessed through the server-side proxy)
- Razorpay/Stripe for payments

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB
- YouTube Data API Key

### Installation

1. Clone the repository
2. Copy `backend/.env.example` to `backend/.env` and set `YOUTUBE_API_KEY`. The key stays server-side and is never rendered in the browser.
3. Start the backend and frontend servers

```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm start
```

## Project Structure

```
TubeGrow/
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
├── shared/            # Shared utilities and types
└── docs/              # Documentation
```

## License

MIT License
