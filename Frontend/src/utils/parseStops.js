export const parseStops = (stops) => {
  try {
    if (!stops) return [];
    if (Array.isArray(stops)) return stops;
    
    if (typeof stops === 'string') {
      // Skip empty strings
      if (!stops.trim()) return [];
      
      // Try multiple decoding approaches
      let decoded = stops;
      
      // Decode HTML entities
      decoded = decoded
        .replace(/&quot;/g, '"')
        .replace(/\\&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
      
      // Try to parse
      const parsed = JSON.parse(decoded);
      return Array.isArray(parsed) ? parsed : [];
    }
    
    return [];
  } catch (error) {
    console.error('Error parsing stops:', error, 'Input:', stops);
    return [];
  }
};
