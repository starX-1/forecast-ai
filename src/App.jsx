import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import AIInsight from './components/AIInsight';
import Attractions from './components/Attractions';
import { fetchWeather } from './services/weatherApi';

const DEFAULT_LOCATION = {
  name: 'Nairobi',
  country: 'Kenya',
  latitude: -1.2921,
  longitude: 36.8219,
  timezone: 'Africa/Nairobi',
};

export default function App() {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [weatherData, setWeatherData] = useState(null);
  const [unit, setUnit] = useState('celsius');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWeather = useCallback(async (loc, unitChoice) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchWeather(loc.latitude, loc.longitude, unitChoice);
      setWeatherData(data);
    } catch (err) {
      setError('Unable to load weather data. Please try again or pick another location.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather(location, unit);
  }, [location, unit, loadWeather]);

  return (
    <div className="app">
      <div className="glow-orb glow-orb-1"></div>
      <div className="glow-orb glow-orb-2"></div>

      <header className="app-header">
        <div className="logo-container">
          <span className="logo-icon">🌍</span>
          <h1>Travel<span>Cast</span></h1>
        </div>
        <p className="tagline">Explore Weather-Wise • Plan Smart</p>
        <p className="description">
          Real-time weather forecasts combined with instant AI travel briefings and destination checklists.
        </p>
      </header>

      <main className="main-content">
        <SearchBar onSelectLocation={setLocation} />

        <div className="units-toggle">
          <button
            className={unit === 'celsius' ? 'active' : ''}
            onClick={() => setUnit('celsius')}
          >
            °C
          </button>
          <button
            className={unit === 'fahrenheit' ? 'active' : ''}
            onClick={() => setUnit('fahrenheit')}
          >
            °F
          </button>
        </div>

        <div style={{ height: 24 }} />

        {error && <div className="error-banner">{error}</div>}

        {loading && (
          <div className="state-message">
            <div className="spinner" />
            Loading weather for {location.name}...
          </div>
        )}

        {!loading && weatherData && (
          <div className="grid" style={{ gap: 20 }}>
            <CurrentWeather location={location} weatherData={weatherData} unit={unit} />

            <div className="grid grid-2">
              <HourlyForecast weatherData={weatherData} unit={unit} />
              <DailyForecast weatherData={weatherData} unit={unit} />
            </div>

            <AIInsight location={location} weatherData={weatherData} unit={unit} />

            <Attractions location={location} weatherData={weatherData} />
          </div>
        )}
      </main>

      <footer className="app-footer">
        Weather data from Open-Meteo · AI insights powered by Google Gemini · Built with React
      </footer>
    </div>
  );
}
