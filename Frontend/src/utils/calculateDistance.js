// Haversine formula to calculate distance between two GPS coordinates
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Calculate distances between consecutive stops
export const calculateStopDistances = (stops) => {
  if (!stops || stops.length < 2) return [];
  
  const distances = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const stop1 = stops[i];
    const stop2 = stops[i + 1];
    
    if (stop1.coordinates && stop2.coordinates) {
      const distance = calculateDistance(
        stop1.coordinates.lat,
        stop1.coordinates.lng,
        stop2.coordinates.lat,
        stop2.coordinates.lng
      );
      
      // Calculate time difference in minutes
      const time1 = stop1.time || stop1.timing;
      const time2 = stop2.time || stop2.timing;
      let timeDiff = 0;
      
      if (time1 && time2 && time1 !== 'TBD' && time2 !== 'TBD') {
        const [h1, m1] = time1.split(':').map(Number);
        const [h2, m2] = time2.split(':').map(Number);
        timeDiff = (h2 * 60 + m2) - (h1 * 60 + m1);
      }
      
      const speed = timeDiff > 0 ? (distance / timeDiff) * 60 : 0; // km/h
      
      distances.push({
        from: stop1.name || stop1.stopName,
        to: stop2.name || stop2.stopName,
        distance: distance.toFixed(2),
        timeDiff,
        speed: speed.toFixed(1)
      });
    }
  }
  
  return distances;
};
