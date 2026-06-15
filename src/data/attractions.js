// Curated sample of well-known attractions for a handful of popular tourist cities.
// In a production app this would come from a places/POI API (e.g. Google Places,
// OpenTripMap, Foursquare). Keyed by lowercase city name for simple lookup.

export const ATTRACTIONS_BY_CITY = {
  paris: [
    { name: 'Eiffel Tower', type: 'outdoor', tag: 'Landmark' },
    { name: 'Louvre Museum', type: 'indoor', tag: 'Museum' },
    { name: 'Luxembourg Gardens', type: 'outdoor', tag: 'Park' },
    { name: "Sainte-Chapelle", type: 'indoor', tag: 'Historic site' },
  ],
  london: [
    { name: 'Tower of London', type: 'outdoor', tag: 'Historic site' },
    { name: 'British Museum', type: 'indoor', tag: 'Museum' },
    { name: 'Hyde Park', type: 'outdoor', tag: 'Park' },
    { name: 'National Gallery', type: 'indoor', tag: 'Museum' },
  ],
  tokyo: [
    { name: 'Senso-ji Temple', type: 'outdoor', tag: 'Temple' },
    { name: 'Tokyo National Museum', type: 'indoor', tag: 'Museum' },
    { name: 'Shinjuku Gyoen Park', type: 'outdoor', tag: 'Park' },
    { name: 'teamLab Planets', type: 'indoor', tag: 'Art experience' },
  ],
  'new york': [
    { name: 'Central Park', type: 'outdoor', tag: 'Park' },
    { name: 'Metropolitan Museum of Art', type: 'indoor', tag: 'Museum' },
    { name: 'Statue of Liberty', type: 'outdoor', tag: 'Landmark' },
    { name: 'American Museum of Natural History', type: 'indoor', tag: 'Museum' },
  ],
  nairobi: [
    { name: 'Nairobi National Park', type: 'outdoor', tag: 'Wildlife reserve' },
    { name: 'Giraffe Centre', type: 'outdoor', tag: 'Wildlife' },
    { name: 'Nairobi National Museum', type: 'indoor', tag: 'Museum' },
    { name: 'Karen Blixen Museum', type: 'indoor', tag: 'Historic site' },
  ],
  rome: [
    { name: 'Colosseum', type: 'outdoor', tag: 'Historic site' },
    { name: 'Vatican Museums', type: 'indoor', tag: 'Museum' },
    { name: 'Roman Forum', type: 'outdoor', tag: 'Historic site' },
    { name: 'Galleria Borghese', type: 'indoor', tag: 'Museum' },
  ],
  dubai: [
    { name: 'Burj Khalifa', type: 'indoor', tag: 'Landmark' },
    { name: 'Dubai Mall Aquarium', type: 'indoor', tag: 'Attraction' },
    { name: 'Jumeirah Beach', type: 'outdoor', tag: 'Beach' },
    { name: 'Dubai Miracle Garden', type: 'outdoor', tag: 'Garden' },
  ],
  'cape town': [
    { name: 'Table Mountain', type: 'outdoor', tag: 'Landmark' },
    { name: 'V&A Waterfront', type: 'outdoor', tag: 'Shopping & dining' },
    { name: 'Zeitz MOCAA', type: 'indoor', tag: 'Museum' },
    { name: 'Boulders Beach', type: 'outdoor', tag: 'Beach' },
  ],
};

export const DEFAULT_ATTRACTIONS = [
  { name: 'City Centre Walking Tour', type: 'outdoor', tag: 'Tour' },
  { name: 'Local History Museum', type: 'indoor', tag: 'Museum' },
  { name: 'Central Park / Gardens', type: 'outdoor', tag: 'Park' },
  { name: 'Art Gallery', type: 'indoor', tag: 'Gallery' },
];

export function getAttractionsForCity(cityName) {
  const key = (cityName || '').trim().toLowerCase();
  return ATTRACTIONS_BY_CITY[key] || DEFAULT_ATTRACTIONS;
}
