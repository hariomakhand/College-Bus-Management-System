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
    return {
      distance: '0',
      eta: 0,
      isNear: false,
      isVeryNear: false,
      shouldNotify: false
    };
  }

  // Validate coordinates
  const busLat = parseFloat(busLocation.lat);
  const busLng = parseFloat(busLocation.lng);
  const stopLat = parseFloat(studentStop.coordinates.lat);
  const stopLng = parseFloat(studentStop.coordinates.lng);

  if (isNaN(busLat) || isNaN(busLng) || isNaN(stopLat) || isNaN(stopLng)) {
    return {
      distance: '0',
      eta: 0,
      isNear: false,
      isVeryNear: false,
      shouldNotify: false
    };
  }

  const distance = calculateDistance(busLat, busLng, stopLat, stopLng);

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
  const etaNum = parseInt(eta);
  if (isNaN(etaNum) || etaNum <= 0) return '0 min';
  if (etaNum < 1) return 'Arriving now!';
  if (etaNum === 1) return '1 min';
  if (etaNum < 60) return `${etaNum} min`;
  const hours = Math.floor(etaNum / 60);
  const mins = etaNum % 60;
  return `${hours}h ${mins}m`;
};
