const RouteApplication = require("../models/RouteApplication");
const Route = require("../models/Route");
const Student = require("../models/Student");

// Calculate time for new stop based on route start/end and distance
const calculateStopTime = (route, newStopCoords) => {
  const toRad = (deg) => deg * (Math.PI / 180);
  
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const stops = JSON.parse(route.stops || "[]");
  
  // Find nearest stops with coordinates
  let prevStop = null, nextStop = null;
  
  for (let i = 0; i < stops.length - 1; i++) {
    if (stops[i].coordinates && stops[i+1].coordinates && stops[i].time && stops[i+1].time) {
      prevStop = stops[i];
      nextStop = stops[i+1];
      break;
    }
  }

  // If no stops with coordinates, use route start/end
  if (!prevStop && route.departureTime && route.arrivalTime) {
    const totalDistance = route.distance;
    const totalTime = route.estimatedTime; // in minutes
    const avgSpeed = totalDistance / (totalTime / 60); // km/h
    
    // Assume start point is at 0,0 for calculation (you can add actual coordinates to route model)
    const distanceRatio = 0.5; // Default to midpoint if no coordinates
    const timeToNewStop = (totalTime * distanceRatio);
    
    const [depHour, depMin] = route.departureTime.split(':').map(Number);
    const depMinutes = depHour * 60 + depMin;
    const newStopMinutes = Math.round(depMinutes + timeToNewStop);
    
    const hour = Math.floor(newStopMinutes / 60) % 24;
    const min = newStopMinutes % 60;
    return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  }

  if (prevStop && nextStop) {
    const distToPrev = getDistance(prevStop.coordinates.lat, prevStop.coordinates.lng, newStopCoords.lat, newStopCoords.lng);
    const distToNext = getDistance(newStopCoords.lat, newStopCoords.lng, nextStop.coordinates.lat, nextStop.coordinates.lng);
    const totalDist = distToPrev + distToNext;
    
    const [prevHour, prevMin] = prevStop.time.split(':').map(Number);
    const [nextHour, nextMin] = nextStop.time.split(':').map(Number);
    const prevMinutes = prevHour * 60 + prevMin;
    const nextMinutes = nextHour * 60 + nextMin;
    const timeDiff = nextMinutes - prevMinutes;
    
    const avgSpeed = totalDist / (timeDiff / 60); // km/h
    const timeToNewStop = (distToPrev / avgSpeed) * 60; // minutes
    const newStopMinutes = Math.round(prevMinutes + timeToNewStop);
    
    const hour = Math.floor(newStopMinutes / 60) % 24;
    const min = newStopMinutes % 60;
    return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  }
  
  return null;
};

exports.applyForRoute = async (req, res) => {
  try {
    const { routeId, pickupStop, reason } = req.body;
    const studentId = req.user.id;

    const route = await Route.findById(routeId);
    if (!route) return res.status(404).json({ message: "Route not found" });

    const stops = JSON.parse(route.stops || "[]");
    let estimatedTime = null;
    let isNewStop = false;
    let stopCoordinates = null;

    // Check if pickupStop is object (new stop) or string (existing stop)
    const stopName = typeof pickupStop === 'object' ? pickupStop.name : pickupStop;
    stopCoordinates = typeof pickupStop === 'object' ? pickupStop.coordinates : null;

    if (!stopName) {
      return res.status(400).json({ message: "Pickup stop name is required" });
    }

    // Check if stop exists
    const existingStop = stops.find(s => s.name && s.name.toLowerCase() === stopName.toLowerCase());
    
    if (!existingStop && stopCoordinates) {
      isNewStop = true;
      estimatedTime = calculateStopTime(route, stopCoordinates);
      
      if (!estimatedTime) {
        return res.status(400).json({ 
          message: "Unable to calculate time. Please contact admin." 
        });
      }
    } else if (existingStop) {
      estimatedTime = existingStop.time;
      stopCoordinates = existingStop.coordinates || null;
    }

    const application = await RouteApplication.create({
      studentId,
      routeId,
      pickupStop: {
        name: stopName,
        coordinates: stopCoordinates,
        estimatedTime,
        isNewStop
      },
      reason
    });

    res.status(201).json({ 
      success: true, 
      message: isNewStop 
        ? `New stop added! Bus will arrive at approximately ${estimatedTime}` 
        : "Application submitted successfully",
      data: application 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await RouteApplication.find({ studentId: req.user.id })
      .populate('routeId')
      .sort('-createdAt');
    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const applications = await RouteApplication.find()
      .populate('studentId', 'name email studentId')
      .populate('routeId')
      .sort('-createdAt');
    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const application = await RouteApplication.findByIdAndUpdate(
      id,
      { status, adminResponse, responseDate: Date.now() },
      { new: true }
    );

    if (status === 'approved') {
      await Student.findByIdAndUpdate(application.studentId, {
        route: application.routeId,
        pickupLocation: application.pickupStop.name,
        busRegistrationStatus: 'approved'
      });
    }

    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
