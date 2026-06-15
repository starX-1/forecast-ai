import React, { useState, useRef, useEffect } from 'react';
import { searchLocations } from '../services/weatherApi';

const QUICK_CITIES = [
  { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York' },
  { name: 'Nairobi', country: 'Kenya', latitude: -1.2921, longitude: 36.8219, timezone: 'Africa/Nairobi' },
  { name: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
];

export default function SearchBar({ onSelectLocation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const locations = await searchLocations(query);
        setResults(locations);
        setActiveIndex(-1);
      } catch {
        setResults([]);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(location) {
    onSelectLocation(location);
    setQuery(`${location.name}, ${location.country || ''}`.replace(/, $/, ''));
    setShowSuggestions(false);
    setResults([]);
  }

  function handleKeyDown(e) {
    if (!showSuggestions || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }

  return (
    <div className="search-section">
      <div className="search-bar" ref={containerRef}>
        <input
          className="search-input"
          type="text"
          placeholder="Search for a city or attraction destination..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          aria-label="Search for a city"
        />
        <span className="search-icon">🔍</span>

        {showSuggestions && results.length > 0 && (
          <div className="suggestions" role="listbox">
            {results.map((loc, idx) => (
              <div
                key={loc.id}
                role="option"
                aria-selected={idx === activeIndex}
                className={`suggestion-item ${idx === activeIndex ? 'active' : ''}`}
                onMouseDown={() => handleSelect(loc)}
                onMouseEnter={() => setActiveIndex(idx)}
              >
                <span>{loc.name}{loc.admin1 ? `, ${loc.admin1}` : ''}</span>
                <span className="country">{loc.country}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="quick-cities">
        {QUICK_CITIES.map((city) => (
          <button key={city.name} className="chip" onClick={() => handleSelect(city)}>
            {city.name}
          </button>
        ))}
      </div>
    </div>
  );
}
