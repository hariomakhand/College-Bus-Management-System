// Convert 24-hour format to 12-hour AM/PM format
export const formatTime = (time) => {
  if (!time || time === 'TBD' || time === 'N/A') return time;
  
  try {
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return time;
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  } catch (e) {
    return time;
  }
};

// Get student's pickup time from route stops
export const getStudentPickupTime = (preferredStop, routeStops) => {
  if (!preferredStop || !routeStops) return null;
  
  // Parse stops if string
  let stops = routeStops;
  if (typeof routeStops === 'string') {
    try {
      stops = JSON.parse(routeStops);
    } catch (e) {
      return null;
    }
  }
  
  if (!Array.isArray(stops)) return null;
  
  // Find matching stop (case-insensitive, trim whitespace)
  const studentStop = stops.find(stop => 
    stop.name?.toLowerCase().trim() === preferredStop?.toLowerCase().trim() ||
    stop.stopName?.toLowerCase().trim() === preferredStop?.toLowerCase().trim()
  );
  
  if (!studentStop) return null;
  
  const time = studentStop.time || studentStop.timing;
  return time ? formatTime(time) : null;
};
