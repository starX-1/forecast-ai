// Calls the Google AI Studio (Gemini) free-tier API to generate travel insights
// based on the current weather and forecast for a location.
//
// Get a free API key at: https://aistudio.google.com/app/apikey
// Set it as VITE_GEMINI_API_KEY in a .env file at the project root.
import axios from 'axios';

const GEMINI_MODEL = 'gemini-3.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Builds a compact weather summary string used as context for the AI prompt.
 */
function buildWeatherContext(locationName, country, weatherData, unit) {
  const { current, daily } = weatherData;
  const unitLabel = unit === 'fahrenheit' ? '°F' : '°C';

  const todayMax = daily?.temperature_2m_max?.[0];
  const todayMin = daily?.temperature_2m_min?.[0];
  const rainChance = daily?.precipitation_probability_max?.[0];
  const uvMax = daily?.uv_index_max?.[0];

  const next3Days = (daily?.time || []).slice(1, 4).map((date, i) => {
    const idx = i + 1;
    return `${date}: ${daily.temperature_2m_min[idx]}-${daily.temperature_2m_max[idx]}${unitLabel}, rain chance ${daily.precipitation_probability_max[idx]}%`;
  }).join('; ');

  return `
Location: ${locationName}, ${country}
Current temperature: ${current.temperature_2m}${unitLabel} (feels like ${current.apparent_temperature}${unitLabel})
Current humidity: ${current.relative_humidity_2m}%
Current wind speed: ${current.wind_speed_10m}
UV index now: ${current.uv_index}
Today's range: ${todayMin}-${todayMax}${unitLabel}, rain chance ${rainChance}%, max UV ${uvMax}
Next 3 days: ${next3Days}
`.trim();
}

/**
 * Generates a short AI travel insight using Gemini based on current weather data.
 * @param {string} locationName
 * @param {string} country
 * @param {Object} weatherData - raw Open-Meteo response (must include current + daily)
 * @param {'celsius'|'fahrenheit'} unit
 * @param {string} apiKey - Gemini API key
 * @returns {Promise<string>} AI-generated insight text
 */
export async function generateTravelInsight(locationName, country, weatherData, unit, apiKey) {
  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  const context = buildWeatherContext(locationName, country, weatherData, unit);

  const prompt = `You are a friendly local travel advisor. Based on the following live weather data, write a short, practical briefing (max 120 words) for a tourist visiting today. Cover: (1) what to wear/pack, (2) whether it's a good day for outdoor sightseeing vs indoor attractions, (3) one specific tip related to the conditions (e.g. sun protection, rain gear, heat). Be warm and concise, use plain text with short paragraphs, no markdown headers.

Weather data:
${context}`;

  let data;
  try {
    const res = await axios.post(`${GEMINI_URL}?key=${apiKey}`, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 250,
      },
    });
    data = res.data;
  } catch (err) {
    const errBody = err.response?.data || {};
    const message = errBody?.error?.message || `Gemini request failed (${err.response?.status || err.message})`;
    throw new Error(message);
  }

  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';

  if (!text) {
    throw new Error('Gemini returned an empty response');
  }

  return text.trim();
}

/**
 * Generates AI suitability advice for a specific attraction type given current conditions.
 * Returns a short verdict + reason. Falls back to a rule-based heuristic if the AI call fails,
 * so the UI never breaks even without an API key.
 */
export function getAttractionAdvice(attraction, weatherData) {
  const { current } = weatherData;
  const code = current.weather_code;
  const isRainy = [51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(code);
  const isSnowy = [71,73,75,77,85,86].includes(code);
  const isHot = current.temperature_2m >= 32;
  const isCold = current.temperature_2m <= 5;
  const highUV = current.uv_index >= 6;

  if (attraction.type === 'outdoor') {
    if (isRainy || isSnowy) {
      return { verdict: 'bad', text: 'Not ideal today — wet conditions. Consider rescheduling or bring rain gear.' };
    }
    if (isHot && highUV) {
      return { verdict: 'neutral', text: 'Doable, but go early morning or late afternoon to avoid peak heat and UV.' };
    }
    if (isCold) {
      return { verdict: 'neutral', text: 'Cold conditions — dress warmly in layers.' };
    }
    return { verdict: 'good', text: 'Great conditions for visiting outdoors today.' };
  }

  // indoor
  if (isRainy || isSnowy || isHot) {
    return { verdict: 'good', text: 'Perfect choice today — a comfortable indoor escape from the conditions outside.' };
  }
  return { verdict: 'neutral', text: 'A solid option any time, though it\'s also pleasant outside today.' };
}

/**
 * Dynamically queries the Gemini API to get 4 real, popular attractions for any city.
 * Returns a JSON array of attractions.
 */
export async function getCityAttractions(cityName, countryName, apiKey) {
  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  const prompt = `List 4 popular real tourist attractions or landmarks in ${cityName}, ${countryName}. 
For each attraction, provide:
1. "name": The official name of the attraction.
2. "type": Must be exactly 'indoor' or 'outdoor'.
3. "tag": Must be a short 1-2 word category (e.g. 'Museum', 'Park', 'Landmark', 'Beach', 'Historic site', 'Art gallery', 'Wildlife', 'Market').

Respond ONLY with a valid JSON array of objects. Do not include markdown formatting (like \`\`\`json), explanations, or trailing commas. Example output:
[
  {"name": "Eiffel Tower", "type": "outdoor", "tag": "Landmark"},
  {"name": "Louvre Museum", "type": "indoor", "tag": "Museum"}
]`;

  try {
    const res = await axios.post(`${GEMINI_URL}?key=${apiKey}`, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 400,
        responseMimeType: "application/json"
      },
    });

    const text = res.data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
    const data = JSON.parse(text.trim());
    if (Array.isArray(data)) {
      return data;
    }
    throw new Error('Invalid format returned by Gemini');
  } catch (err) {
    console.error('Failed to parse Gemini attractions list:', err);
    throw err;
  }
}

