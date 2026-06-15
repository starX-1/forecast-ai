# 🌤️ TravelCast — Weather & AI Insights for Tourists

TravelCast is a premium, responsive React web application that provides real-time weather forecasts, interactive 24-hour and 7-day outlooks, and dynamic AI-powered travel briefings. Built with modern UI aesthetics and rich features, it helps travelers plan smart and stay weather-wise.

---

## 🌟 Key Features

- **🔍 Smart Location Search** — Powered by the Open-Meteo Geocoding API, supporting autocomplete search and quick-pick chips for popular cities.
- **🌤️ Live Weather Metrics** — Shows current temperature, "feels-like" temperature, humidity, wind speed, and UV index.
- **⏱️ Forecast Scrollers** — Visual 24-hour hourly outlooks and 7-day forecasts.
- **🧠 Gemini AI Travel Briefing** — Generates personalized "what to wear / what to do" advice in real-time based on current weather data.
- **🏛️ Dynamic Attraction Advisor** — Recommends popular local attractions (landmarks, museums, parks, beaches, tours) with weather-aware suitability advice.
- **🖼️ Real Attraction Imagery** — Dynamically fetches real photos of attractions on-the-fly using the Wikimedia Commons API.
- **⚡ Smart Caching & Rate-Limit Protection**:
  - **In-Memory Cache**: Caches AI insights and attraction details per location/city to save API quota.
  - **Rate-Limit Countdown**: Detects Gemini free-tier rate limits, shows a live visual countdown timer, and automatically retries when the limit expires.
  - **Graceful Fallback**: Automatically falls back to high-quality curated static data if the API is unavailable, keeping the UI fully functional.
- **🌡️ Unit Toggle** — Switch effortlessly between Celsius and Fahrenheit.
- **📱 Premium Responsive Design** — Sleek dark-mode aesthetic with vibrant backdrop glow orbs, responsive layouts, hover animations, and shimmer skeleton loading states.

---

## 🛠️ Technology Stack

- **Frontend Core**: React 18 & Vite
- **HTTP Client**: Axios (for robust, structured API requests)
- **Styling**: Modern Vanilla CSS (custom variables, glassmorphism, glowing backdrop orbs, skeleton shimmers)
- **APIs**:
  - **Open-Meteo Weather & Geocoding** (Free, no API key required)
  - **Gemini API (Google AI Studio)** (Free tier key required for AI features)
  - **Wikimedia Commons API** (Free, no key required, for attraction photos)

---

## 🚀 Getting Started & Setup

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v16+ recommended).

### 2. Clone the Repository
```bash
git clone https://github.com/starX-1/forecast-ai.git
cd forecast-ai
```
*(Note: If you are already inside the project directory, proceed to the next step.)*

### 3. Install Dependencies
Install all package dependencies using npm:
```bash
npm install
```

### 4. Configure Environment Variables
Create a .env file in the forecast-ai folder and add your Gemini API key to it. 

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

> [!TIP]
> **How to get a free Gemini API Key:**
> 1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
> 2. Create a free API key (no billing details required).
> 3. Paste it into your `.env` file.
> 
> *Note: If no API key is provided, the app remains fully functional and will gracefully display static local attraction recommendations and prompt instructions for the API key setup.*

---

## 💻 Running the Application

### Start Development Server
To launch the app locally with hot reloading:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173` (or the URL shown in your terminal).

### Build for Production
To generate a highly-optimized production build in the `dist` folder:
```bash
npm run build
```

---

## 📂 Project Structure

```
forecast-ai/
├── src/
│   ├── components/
│   │   ├── SearchBar.jsx        – City search with autocomplete & quick chips
│   │   ├── CurrentWeather.jsx   – Current conditions hero card
│   │   ├── HourlyForecast.jsx   – 24h scrollable forecast
│   │   ├── DailyForecast.jsx    – 7-day scrollable forecast
│   │   ├── AIInsight.jsx        – Gemini-powered travel briefing and countdown timer
│   │   └── Attractions.jsx      – Dynamic attractions list with Wikimedia images & fallbacks
│   ├── services/
│   │   ├── weatherApi.js        – Open-Meteo forecast and geocoding services
│   │   ├── geminiApi.js         – Gemini prompting, model config, and response parser
│   │   └── wikiImageApi.js      – Wikimedia Commons search API for attraction photos
│   ├── data/
│   │   └── attractions.js       – Curated static attractions database for fallback
│   ├── utils/
│   │   └── weatherCodes.js      – WMO weather code mapping to labels and emojis
│   ├── App.jsx                  – Main app wrapper and layout assembler
│   ├── index.css                – Core styling, design tokens, and shimmer animations
│   └── main.jsx                 – React app entry point
├── public/                      – Curated category placeholder images
├── vite.config.js               – Vite builder settings
├── .env                         – Configuration 
└── package.json                 – Scripts and project dependencies
```

---

## 🌍 Deployment & Publishing
The production bundle is fully static and can be deployed directly to modern hosting providers such as Vercel, Netlify, or GitHub Pages.
