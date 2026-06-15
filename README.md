# TravelCast — Weather & AI Insights for Tourists

A clean, responsive React app that helps tourists check live weather, hourly/7-day
forecasts, and get AI-generated travel tips for any city in the world — plus
weather-aware advice on whether to visit indoor or outdoor attractions today.

## Features

- 🔍 **City search with autocomplete** — powered by Open-Meteo's free Geocoding API
- 🌤️ **Live current conditions** — temperature, feels-like, humidity, wind, UV index
- ⏱️ **24-hour forecast** and **7-day forecast** scrollers
- 🧠 **AI Travel Briefing** — Gemini (Google AI Studio free tier) generates a short,
  practical "what to wear / what to do today" summary based on real-time weather
- 🏛️ **Attraction recommendations** — sample indoor/outdoor attractions per city with
  weather-based suitability advice (e.g. "skip the outdoor tour today, it's raining")
- 🌡️ Celsius / Fahrenheit toggle
- 📱 Fully responsive, dark-themed UI

## APIs used (both free, no backend required)

| Purpose            | API                                  | Auth needed |
|--------------------|---------------------------------------|-------------|
| Geocoding / search | Open-Meteo Geocoding API              | No          |
| Weather forecast   | Open-Meteo Forecast API               | No          |
| AI insights        | Google AI Studio — Gemini API (free)  | Yes (free key) |

## Getting started

```bash
npm install
cp .env.example .env
```

Then add your free Gemini API key to `.env`:

```
VITE_GEMINI_API_KEY=your_key_here
```

Get a free key at https://aistudio.google.com/app/apikey (no billing required for the
free tier). The app works fully without a key — only the AI Insight card will show a
setup message instead.

Run the dev server:

```bash
npm run dev
```

## Project structure

```
src/
  components/
    SearchBar.jsx        – city search + autocomplete + quick-pick chips
    CurrentWeather.jsx   – current conditions hero card
    HourlyForecast.jsx   – 24h horizontal scroller
    DailyForecast.jsx    – 7-day horizontal scroller
    AIInsight.jsx        – Gemini-powered travel briefing card
    Attractions.jsx      – sample attractions + weather suitability advice
  services/
    weatherApi.js        – Open-Meteo geocoding + forecast calls
    geminiApi.js          – Gemini prompt construction + call, attraction heuristic
  data/
    attractions.js       – sample POI dataset per city
  utils/
    weatherCodes.js       – WMO weather code → label/icon mapping
  App.jsx
  index.css
```

## Design notes

- Dark, map-inspired color palette suited for a travel product
- Weather codes mapped from Open-Meteo's WMO standard to readable labels + emoji icons
  (avoids extra icon dependencies/assets)
- AI prompt is built from real numeric weather data (temps, UV, rain chance, 3-day
  outlook) so the response is grounded, not generic
- Attraction advice combines a Gemini-ready hook (`getAttractionAdvice`) with a
  rule-based fallback so the UI is never empty even without an API key
