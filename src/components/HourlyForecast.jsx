import React, { useMemo } from 'react';
import { getWeatherInfo, formatHour } from '../utils/weatherCodes';

export default function HourlyForecast({ weatherData, unit }) {
  const unitSymbol = unit === 'fahrenheit' ? '°F' : '°C';

  const next24 = useMemo(() => {
    const { hourly } = weatherData;
    if (!hourly?.time) return [];

    const nowIso = weatherData.current.time;
    const startIdx = hourly.time.findIndex((t) => t >= nowIso);
    const start = startIdx === -1 ? 0 : startIdx;

    return hourly.time.slice(start, start + 24).map((time, i) => ({
      time,
      temp: hourly.temperature_2m[start + i],
      code: hourly.weather_code[start + i],
      precipChance: hourly.precipitation_probability?.[start + i],
    }));
  }, [weatherData]);

  return (
    <div className="card">
      <h3>Hourly Forecast (Next 24h)</h3>
      <div className="scroll-row">
        {next24.map((h, i) => {
          const info = getWeatherInfo(h.code);
          return (
            <div className="hour-card" key={h.time}>
              <div className="time">{i === 0 ? 'Now' : formatHour(h.time)}</div>
              <div className="icon">{info.icon}</div>
              <div className="temp">{Math.round(h.temp)}{unitSymbol}</div>
              {typeof h.precipChance === 'number' && h.precipChance > 0 && (
                <div className="range">💧{h.precipChance}%</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
