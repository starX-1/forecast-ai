import React, { useState, useEffect, useCallback } from 'react';
import { getCityAttractions, getAttractionAdvice } from '../services/geminiApi';
import { getAttractionImage } from '../services/wikiImageApi';
import { ATTRACTIONS_BY_CITY, DEFAULT_ATTRACTIONS } from '../data/attractions';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Module-level cache: keyed by lowercase city name.
// Shared across renders — survives re-mounts but resets on page reload.
const attractionsCache = new Map();

// Tag-based fallback images (our generated ones in /public/images/)
function getFallbackImage(tag) {
  const t = (tag || '').toLowerCase();
  if (t.includes('landmark') || t.includes('historic')) return '/images/landmark.png';
  if (t.includes('museum') || t.includes('art') || t.includes('gallery')) return '/images/museum.png';
  if (t.includes('park') || t.includes('garden') || t.includes('wildlife') || t.includes('nature')) return '/images/park.png';
  if (t.includes('beach') || t.includes('water') || t.includes('ocean')) return '/images/beach.png';
  return '/images/tour.png';
}

function getStaticAttractions(cityName) {
  const key = (cityName || '').trim().toLowerCase();
  return ATTRACTIONS_BY_CITY[key] || DEFAULT_ATTRACTIONS;
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
  const [notice, setNotice] = useState(''); // soft notice (not a blocking error)

  const loadAttractions = useCallback(async (force = false) => {
    const cacheKey = location.name.trim().toLowerCase();

    // Serve from cache if available and not forced
    if (!force && attractionsCache.has(cacheKey)) {
      setAttractions(attractionsCache.get(cacheKey));
      setLoading(false);
      setNotice('');
      return;
    }

    setLoading(true);
    setNotice('');
    setAttractions([]);

    // If no API key, skip the Gemini call entirely
    if (!API_KEY) {
      const fallback = getStaticAttractions(location.name);
      setAttractions(fallback);
      setNotice('Add VITE_GEMINI_API_KEY to load live AI-curated attractions.');
      setLoading(false);
      return;
    }

    try {
      const data = await getCityAttractions(location.name, location.country, API_KEY);
      attractionsCache.set(cacheKey, data);
      setAttractions(data);
    } catch (err) {
      // On ANY error (rate limit, network, parse), fall back to static data
      const fallback = getStaticAttractions(location.name);
      attractionsCache.set(cacheKey, fallback); // cache fallback too to stop hammering
      setAttractions(fallback);

      const isRateLimit = err?.response?.status === 429 || err?.message?.toLowerCase().includes('quota');
      setNotice(
        isRateLimit
          ? '⚠️ AI quota reached — showing curated attractions. Live AI picks will resume shortly.'
          : '⚠️ Could not reach AI — showing curated attractions instead.'
      );
    } finally {
      setLoading(false);
    }
  }, [location.name, location.country]);

  useEffect(() => {
    loadAttractions(false);
  }, [loadAttractions]);

  return (
    <div className="card attractions-card">
      <div className="attractions-header">
        <h3 className="section-title">✨ Attractions in {location.name}</h3>
        {!loading && (
          <button
            className="ai-refresh attractions-refresh"
            onClick={() => {
              // Force a fresh API call on manual refresh
              attractionsCache.delete(location.name.trim().toLowerCase());
              loadAttractions(true);
            }}
          >
            🔄 Refresh
          </button>
        )}
      </div>

      {notice && (
        <div className="attractions-notice">{notice}</div>
      )}

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

      {!loading && attractions.length > 0 && (
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
