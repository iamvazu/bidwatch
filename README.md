# ⚡ BidWatch: California Janitorial Contract Monitor

BidWatch is an AI-powered platform designed to monitor, aggregate, and analyze government janitorial contract opportunities across California. It synchronizes data from **11 PlanetBids portals** and **SAM.gov** into a unified, high-performance dashboard.

## 🚀 Live Demo
- **Frontend:** [bidwatchapp.vercel.app](https://bidwatchapp.vercel.app)
- **API:** [bidwatch-api-production.up.railway.app](https://bidwatch-api-production.up.railway.app/)

## ✨ Key Features
- **Real-time Monitoring**: Aggregates bids from multiple California government portals.
- **AI Intelligence**: Automated bid analysis and "Go/No-Go" scoring (Powered by Claude 3.5 Sonnet).
- **Parallel Scrapers**: Robust Playwright-based batching for high-speed data extraction.
- **CAPTCHA Bypass**: Integrated 2Captcha solving for Amazon WAF protected portals.
- **Mobile Responsive**: Sleek, glassmorphic dashboard built with Next.js 16 and Tailwind CSS 4.

## 🛠 Tech Stack
- **Frontend**: Next.js 16 (App Router), Tailwind CSS 4, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript.
- **Database**: PostgreSQL (Neon.tech).
- **Scraping**: Playwright, Playwright-Extra (Stealth).
- **Deployment**: Vercel (Frontend), Railway (API).

## 📦 Project Structure
```text
.
├── bidwatch-api/         # Node.js API & Playwright Scrapers
├── bidwatch-frontend/    # Next.js 16 Dashboard UI
├── railway.json          # Deployment configuration
└── package.json          # Root monorepo definition
```

## ⚙️ Setup & Deployment

### Environment Variables
Configure the following in your `.env` (API) and Vercel/Railway dashboards:

#### API (Railway)
- `DATABASE_URL`: Your Neon.tech PostgreSQL connection string.
- `SAM_GOV_API_KEY`: Your SAM.gov API key.
- `CAPTCHA_API_KEY`: Your 2Captcha API key.
- `ANTHROPIC_API_KEY`: Your Anthropic (Claude) API key.

#### Frontend (Vercel)
- `NEXT_PUBLIC_API_URL`: The URL of your Railway API.

### Local Development
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Start API: `cd bidwatch-api && npm run dev`.
4. Start Frontend: `cd bidwatch-frontend && npm run dev`.

## 📜 License
Private - All Rights Reserved.
