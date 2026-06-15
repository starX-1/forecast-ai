import React, { useState, useEffect, useCallback } from 'react';
import { getCityAttractions, getAttractionAdvice } from '../services/geminiApi';
import { getAttractionImage } from '../services/wikiImageApi';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Tag-based fallback images (our generated ones in /public/images/)
function getFallbackImage(tag) {
  const t = (tag || '').toLowerCase();
  if (t.includes('landmark') || t.includes('historic')) return '/images/landmark.png';
  if (t.includes('museum') || t.includes('art') || t.includes('gallery')) return '/images/museum.png';
  if (t.includes('park') || t.includes('garden') || t.includes('wildlife') || t.includes('nature')) return '/images/park.png';
  if (t.includes('beach') || t.includes('water') || t.includes('ocean')) return '/images/beach.png';
  return '/images/tour.png';
}

function AttractionCard({ attraction, weatherData }) {
  const [imageUrl, setImageUrl] = useState(null);
  const advice = getAttractionAdvice(attraction, weatherData);

  useEffect(() => {
    let cancelled = false;
    setImageUrl(null);
    getAttractionImage(attraction.name).then((url) => {
      if (!cancelled) {
        setImageUrl(url || getFallbackImage(attraction.tag));
      }
    });
    return () => { cancelled = true; };
  }, [attraction.name, attraction.tag]);

  return (
    <div className="attraction-card-item">
      <div className="attraction-image-container">
        {imageUrl ? (
          <img src={imageUrl} alt={attraction.name} className="attraction-img" />
        ) : (
          <div className="attraction-img-skeleton" />
        )}
        <span className="attraction-badge">{attraction.tag}</span>
        <span className={`verdict-badge ${advice.verdict}`}>
          {advice.verdict === 'good' ? '🟢 Recommended' : advice.verdict === 'bad' ? '🔴 Caution' : '🟡 Neutral'}
        </span>
      </div>
      <div className="attraction-details">
        <div className="attraction-name">{attraction.name}</div>
        <div className="attraction-type">
          {attraction.type === 'outdoor' ? '🌳 Outdoor Activity' : '🏛️ Indoor Activity'}
        </div>
        <div className={`attraction-advice-box ${advice.verdict}`}>
          {advice.text}
        </div>
      </div>
    </div>
  );
}

export default function Attractions({ location, weatherData }) {
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAttractions = useCallback(async () => {
    setLoading(true);
    setError('');
    setAttractions([]);
    try {
      const data = await getCityAttractions(location.name, location.country, API_KEY);
      setAttractions(data);
    } catch (err) {
      if (err.message === 'MISSING_API_KEY') {
        setError('Add a free Gemini API key (VITE_GEMINI_API_KEY) to load live attractions.');
      } else {
        setError('Could not load attractions for this city. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [location.name, location.country]);

  useEffect(() => {
    loadAttractions();
  }, [loadAttractions]);

  return (
    <div className="card attractions-card">
      <div className="attractions-header">
        <h3 className="section-title">✨ Attractions in {location.name}</h3>
        {!loading && !error && (
          <button className="ai-refresh attractions-refresh" onClick={loadAttractions}>
            🔄 Refresh
          </button>
        )}
      </div>

      {loading && (
        <div className="attractions-loading">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="attraction-skeleton">
              <div className="skeleton-img" />
              <div className="skeleton-body">
                <div className="skeleton-line skeleton-title" />
                <div className="skeleton-line skeleton-sub" />
                <div className="skeleton-line skeleton-advice" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="attractions-error">{error}</div>
      )}

      {!loading && !error && attractions.length > 0 && (
        <div className="attraction-grid">
          {attractions.map((attraction) => (
            <AttractionCard
              key={attraction.name}
              attraction={attraction}
              weatherData={weatherData}
            />
          ))}
        </div>
      )}
    </div>
  );
}
