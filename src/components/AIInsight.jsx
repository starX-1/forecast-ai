import React, { useEffect, useState, useCallback, useRef } from 'react';
import { generateTravelInsight } from '../services/geminiApi';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Module-level cache: keyed by "lat,lng,unit" so switching units or city
// re-fetches, but returning to the same city uses the cached result.
const insightCache = new Map();

function getCacheKey(location, unit) {
  return `${location.latitude},${location.longitude},${unit}`;
}

// Extract retry seconds from Gemini rate-limit error messages.
function parseRetrySeconds(message) {
  const match = message?.match(/retry in ([\d.]+)s/i);
  return match ? Math.ceil(parseFloat(match[1])) : null;
}

export default function AIInsight({ location, weatherData, unit }) {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryIn, setRetryIn] = useState(null);
  const timerRef = useRef(null);

  // Clear countdown timer on unmount
  useEffect(() => () => clearInterval(timerRef.current), []);

  const startCountdown = useCallback((seconds) => {
    setRetryIn(seconds);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRetryIn((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const fetchInsight = useCallback(async () => {
    const cacheKey = getCacheKey(location, unit);

    // Serve from cache if available
    if (insightCache.has(cacheKey)) {
      setInsight(insightCache.get(cacheKey));
      setError('');
      return;
    }

    setLoading(true);
    setError('');
    setRetryIn(null);

    try {
      const text = await generateTravelInsight(
        location.name,
        location.country,
        weatherData,
        unit,
        API_KEY
      );
      insightCache.set(cacheKey, text);
      setInsight(text);
    } catch (err) {
      if (err.message === 'MISSING_API_KEY') {
        setError('Add a free Gemini API key (VITE_GEMINI_API_KEY) in your .env file to enable AI travel insights. Get one at aistudio.google.com/app/apikey.');
      } else {
        const secs = parseRetrySeconds(err.message);
        if (secs) {
          setError(`Rate limit reached — free tier allows 20 requests/min. Auto-retry in:`);
          startCountdown(secs);
        } else {
          setError(`Could not generate AI insight: ${err.message}`);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [location, weatherData, unit, startCountdown]);

  // Auto-retry once the countdown hits zero
  useEffect(() => {
    if (retryIn === null && error.startsWith('Rate limit')) {
      fetchInsight();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryIn]);

  useEffect(() => {
    setInsight('');
    setError('');
    setRetryIn(null);
    clearInterval(timerRef.current);
    fetchInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.latitude, location.longitude, unit]);

  return (
    <div className="card ai-card">
      <div className="ai-header">
        <span className="ai-badge">AI INSIGHT</span>
        <h3 style={{ margin: 0 }}>Today's Travel Briefing</h3>
      </div>

      {loading && <div className="ai-text">Generating your personalized travel tips...</div>}

      {!loading && error && (
        <div className="ai-text" style={{ color: 'var(--color-text-muted)' }}>
          {error}
          {retryIn !== null && (
            <span className="retry-countdown"> {retryIn}s</span>
          )}
        </div>
      )}

      {!loading && !error && insight && (
        <div className="ai-text">
          {insight.split('\n').filter(Boolean).map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      <button
        className="ai-refresh"
        onClick={fetchInsight}
        disabled={loading || retryIn !== null}
      >
        {loading ? 'Generating...' : retryIn !== null ? `Retry in ${retryIn}s` : 'Regenerate insight'}
      </button>
    </div>
  );
}
