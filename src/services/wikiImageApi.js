import axios from 'axios';

/**
 * Fetches a real thumbnail image URL from Wikimedia Commons for a given search query.
 * Uses the Wikipedia REST API — no API key required.
 * @param {string} query - attraction or place name to search
 * @returns {Promise<string|null>} image URL or null if not found
 */
export async function getAttractionImage(query) {
  try {
    // Wikipedia page summary API - gives us the main image for any topic
    const title = encodeURIComponent(query);
    const res = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`,
      { timeout: 5000 }
    );
    const imageUrl = res.data?.thumbnail?.source || res.data?.originalimage?.source || null;
    return imageUrl;
  } catch {
    return null;
  }
}
