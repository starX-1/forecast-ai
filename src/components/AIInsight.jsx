import React, { useEffect, useState, useCallback } from 'react';
import { generateTravelInsight } from '../services/geminiApi';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export default function AIInsight({ location, weatherData, unit }) {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchInsight = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const text = await generateTravelInsight(
        location.name,
        location.country,
        weatherData,
        unit,
        API_KEY
      );
      setInsight(text);
    } catch (err) {
      if (err.message === 'MISSING_API_KEY') {
        setError(
          'Add a free Gemini API key (VITE_GEMINI_API_KEY) in your .env file to enable AI travel insights. Get one at aistudio.google.com/app/apikey.'
        );
      } else {
        setError(`Could not generate AI insight: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [location, weatherData, unit]);

  useEffect(() => {
    setInsight('');
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
        <div className="ai-text" style={{ color: 'var(--color-text-muted)' }}>{error}</div>
      )}

      {!loading && !error && insight && (
        <div className="ai-text">
          {insight.split('\n').filter(Boolean).map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      <button className="ai-refresh" onClick={fetchInsight} disabled={loading}>
        {loading ? 'Generating...' : 'Regenerate insight'}
      </button>
    </div>
  );
}
