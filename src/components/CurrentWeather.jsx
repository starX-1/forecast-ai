import React from 'react';
import { getWeatherInfo, formatFullDate } from '../utils/weatherCodes';

export default function CurrentWeather({ location, weatherData, unit }) {
  const { current } = weatherData;
  const info = getWeatherInfo(current.weather_code);
  const unitSymbol = unit === 'fahrenheit' ? '°F' : '°C';
  const speedUnit = unit === 'fahrenheit' ? 'mph' : 'km/h';

  return (
    <div className="card weather-hero">
      <div className="location-info">
        <h2>{location.name}{location.country ? `, ${location.country}` : ''}</h2>
        <div className="date">{formatFullDate(weatherData.current.time)}</div>
        <div className="desc">{info.label}</div>
      </div>

      <div className="temp-display">
        <span className="weather-icon">{info.icon}</span>
        <span className="temp-value">{Math.round(current.temperature_2m)}{unitSymbol}</span>
      </div>

      <div className="weather-meta-grid" style={{ width: '100%' }}>
        <div className="weather-meta-item">
          <div className="label">Feels like</div>
          <div className="value">{Math.round(current.apparent_temperature)}{unitSymbol}</div>
        </div>
        <div className="weather-meta-item">
          <div className="label">Humidity</div>
          <div className="value">{current.relative_humidity_2m}%</div>
        </div>
        <div className="weather-meta-item">
          <div className="label">Wind</div>
          <div className="value">{Math.round(current.wind_speed_10m)} {speedUnit}</div>
        </div>
        <div className="weather-meta-item">
          <div className="label">UV Index</div>
          <div className="value">{current.uv_index?.toFixed?.(1) ?? current.uv_index}</div>
        </div>
      </div>
    </div>
  );
}
