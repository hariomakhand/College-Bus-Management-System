// Calculate distance between two GPS coordinates (Haversine formula)
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

// Calculate ETA based on distance and average speed
export const calculateETA = (distanceKm, avgSpeedKmh = 25) => {
  const timeHours = distanceKm / avgSpeedKmh;
  const timeMinutes = Math.round(timeHours * 60);
  return timeMinutes;
};

// Get bus distance and ETA to student's stop
export const getBusDistanceToStop = (busLocation, studentStop) => {
  if (!busLocation || !studentStop || !studentStop.coordinates) {
    return null;
  }

  const distance = calculateDistance(
    busLocation.lat,
    busLocation.lng,
    studentStop.coordinates.lat,
    studentStop.coordinates.lng
  );

  const eta = calculateETA(distance);

  return {
    distance: distance.toFixed(2),
    eta,
    isNear: distance <= 5, // Within 5 km
    isVeryNear: distance <= 2, // Within 2 km
    shouldNotify: distance <= 5 && distance > 0.5 // Notify between 0.5-5 km
  };
};

// Format ETA message
export const formatETAMessage = (eta) => {
  if (eta < 1) return 'Arriving now!';
  if (eta === 1) return '1 minute away';
  if (eta < 60) return `${eta} minutes away`;
  const hours = Math.floor(eta / 60);
  const mins = eta % 60;
  return `${hours}h ${mins}m away`;
};
