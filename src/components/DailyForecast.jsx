import React from 'react';
import { getWeatherInfo, formatDay } from '../utils/weatherCodes';

export default function DailyForecast({ weatherData, unit }) {
  const { daily } = weatherData;
  const unitSymbol = unit === 'fahrenheit' ? '°F' : '°C';

  if (!daily?.time) return null;

  return (
    <div className="card">
      <h3>7-Day Forecast</h3>
      <div className="scroll-row">
        {daily.time.map((date, i) => {
          const info = getWeatherInfo(daily.weather_code[i]);
          return (
            <div className="day-card" key={date}>
              <div className="day">{i === 0 ? 'Today' : formatDay(date)}</div>
              <div className="icon">{info.icon}</div>
              <div className="temp">{Math.round(daily.temperature_2m_max[i])}{unitSymbol}</div>
              <div className="range">
                {Math.round(daily.temperature_2m_min[i])}{unitSymbol} min
              </div>
              {daily.precipitation_probability_max[i] > 0 && (
                <div className="range">💧{daily.precipitation_probability_max[i]}%</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
