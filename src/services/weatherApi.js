// Thin wrapper around Open-Meteo's free Geocoding and Forecast APIs.
// No API key required. See https://open-meteo.com/
import axios from 'axios';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Search for cities/places by name. Used for the search-bar autocomplete.
 * @param {string} query
 * @returns {Promise<Array>} list of location results
 */
export async function searchLocations(query) {
  if (!query || query.trim().length < 2) return [];

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
  try {
    const res = await axios.get(url);
    const data = res.data;
    return (data.results || []).map((r) => ({
      id: `${r.id}`,
      name: r.name,
      country: r.country,
      admin1: r.admin1,
      latitude: r.latitude,
      longitude: r.longitude,
      timezone: r.timezone,
    }));
  } catch (error) {
    throw new Error('Failed to search locations');
  }
}

/**
 * Fetch current, hourly, and daily forecast data for a given location.
 * @param {number} latitude
 * @param {number} longitude
 * @param {'celsius'|'fahrenheit'} unit
 * @returns {Promise<Object>} forecast data
 */
export async function fetchWeather(latitude, longitude, unit = 'celsius') {
  const params = {
    latitude: latitude,
    longitude: longitude,
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'weather_code',
      'wind_speed_10m',
      'uv_index',
      'is_day',
    ].join(','),
    hourly: ['temperature_2m', 'weather_code', 'precipitation_probability'].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'uv_index_max',
      'sunrise',
      'sunset',
    ].join(','),
    timezone: 'auto',
    forecast_days: 7,
    temperature_unit: unit === 'fahrenheit' ? 'fahrenheit' : 'celsius',
    wind_speed_unit: unit === 'fahrenheit' ? 'mph' : 'kmh',
  };

  try {
    const res = await axios.get(FORECAST_URL, { params });
    return res.data;
  } catch (error) {
    throw new Error('Failed to fetch weather data');
  }
}
