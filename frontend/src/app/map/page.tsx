"use client"
import React, { useState, useEffect, useRef, useCallback } from "react"
import axios from "axios"
import mapboxgl from "mapbox-gl"
import { useRouter } from "next/navigation"
import { MapPin, Navigation, Search, Loader2, Truck, Bed, Coffee, User, Clock, Droplet } from "lucide-react"
import "mapbox-gl/dist/mapbox-gl.css"

interface Location {
  name: string
  coordinates: [number, number]
}

interface Route {
  geometry: {
    coordinates: [number, number][]
    type: "LineString"
  }
  distance: number // Distance in meters
  duration: number // Duration in seconds
}

interface Suggestion {
  place_name: string
  center: [number, number]
}

interface LogEntry {
  time: string // Format: "YYYY-MM-DD HH:MM"
  status: "Driving" | "Resting" | "Pickup" | "Dropoff" | "Off Duty" | "Refueling"
  description: string
}

// Keep MAPBOX_TOKEN outside the component
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
if (typeof window !== 'undefined' && MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN
}

export default function TripPlanner() {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null)
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null)
  const [currentCycleUsed, setCurrentCycleUsed] = useState<string>("")
  const [pickupToDropoffRoute, setPickupToDropoffRoute] = useState<Route | null>(null)
  const [currentToPickupRoute, setCurrentToPickupRoute] = useState<Route | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [activeInput, setActiveInput] = useState<"pickup" | "dropoff" | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [logs, setLogs] = useState<LogEntry[]>([]) // Detailed logs
  const [stops, setStops] = useState<Location[]>([]) // Stops for the trip
  const [totalHOSUsed, setTotalHOSUsed] = useState(0) // Hours of service tracking
  const [apiError, setApiError] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/'

  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({})
  const routeLayers = useRef<string[]>([])
  const router = useRouter()
  const mapInitializedRef = useRef(false) // Use ref instead of state to avoid re-renders

  // Authentication check - Run only once when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && !authChecked) {
      try {
        const userString = localStorage.getItem('user');
        if (!userString) {
          // No user found, redirect to login page
          console.log('No user found, redirecting to login...');
          router.push('/login');
        } else {
          // User exists, parse the data
          const parsedData = JSON.parse(userString);
          setUserData(parsedData);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // If there's an error, better to redirect to login
        router.push('/login');
      } finally {
        setAuthChecked(true);
      }
    }
  }, [router, authChecked]);

  // Initialize map - only after auth check and only once
  useEffect(() => {
    // Only run if auth is checked, user data exists, map container exists, and map not already initialized
    if (authChecked && userData && mapContainer.current && !map.current && !mapInitializedRef.current) {
      console.log("Initializing map...");
      
      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/streets-v11",
          center: [-87.9931, 41.6736], // Lemont, Illinois, USA
          zoom: 3,
        });

        map.current.on('load', () => {
          console.log("Map loaded successfully");
          mapInitializedRef.current = true;
        });

        map.current.addControl(new mapboxgl.NavigationControl());
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    }

    // Cleanup function - only run when component unmounts
    return () => {
      if (map.current) {
        Object.values(markers.current).forEach(marker => marker.remove());
        map.current.remove();
        map.current = null;
        mapInitializedRef.current = false;
      }
    };
  }, [authChecked, userData]); // Only depend on auth state and user data

  const detectCurrentLocation = useCallback(() => {
    if (!map.current || !mapInitializedRef.current) {
      console.log("Map not initialized yet");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await axios.get(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`
          );
          const placeName = response.data.features[0].place_name;
          setCurrentLocation({
            name: placeName,
            coordinates: [longitude, latitude],
          });

          if (map.current) {
            map.current.flyTo({
              center: [longitude, latitude],
              zoom: 12,
            });

            // Update or create marker
            if (markers.current.current) markers.current.current.remove();
            markers.current.current = new mapboxgl.Marker({ color: "#FF0000" })
              .setLngLat([longitude, latitude])
              .addTo(map.current);
          }
        } catch (error) {
          console.error("Error reverse geocoding:", error);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsLoading(false);
      }
    );
  }, []);

  const searchLocations = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${MAPBOX_TOKEN}`
      )
      setSuggestions(response.data.features)
    } catch (error) {
      console.error("Error searching locations:", error)
    }
  }, [])
  // Modified saveTripData function with explicit null values to match API expectations
  const saveTripData = async (tripLogs: LogEntry[], tripStops: Location[]): Promise<boolean> => {
    if (!pickupLocation || !dropoffLocation || !tripLogs.length) return false;

    try {
      setIsLoading(true);
      setApiError(null);
      // Format the data for the API
      const tripData = {
        user: userData?.user_id,
        pickup_location_name: pickupLocation.name,
        pickup_lat: pickupLocation.coordinates[1],
        pickup_lng: pickupLocation.coordinates[0],
        dropoff_location_name: dropoffLocation.name,
        dropoff_lat: dropoffLocation.coordinates[1],
        dropoff_lng: dropoffLocation.coordinates[0],
        total_distance: Number(((currentToPickupRoute?.distance || 0) / 1609.34 + (pickupToDropoffRoute?.distance || 0) / 1609.34).toFixed(2)),
        total_duration: Number(tripLogs.length > 1 ?
          ((new Date(tripLogs[tripLogs.length - 1].time).getTime() - new Date(tripLogs[0].time).getTime()) / (1000 * 60 * 60)).toFixed(2) :
          ((currentToPickupRoute?.duration || 0) / 3600 + (pickupToDropoffRoute?.duration || 0) / 3600).toFixed(2)),
        driving_time: Number(tripLogs.filter(log => log.status === "Driving")
          .reduce((acc, log) => {
            const timeMatch = log.description.match(/Driving for (\d+) minutes/);
            return timeMatch ? acc + (parseInt(timeMatch[1]) / 60) : acc;
          }, 0).toFixed(2)),
        rest_time: Number(tripLogs.filter(log => ["Resting", "Off Duty"].includes(log.status))
          .reduce((acc, log) => {
            if (log.status === "Resting") return acc + 0.5;
            if (log.description.includes("10-hour")) return acc + 10;
            if (log.description.includes("34-hour")) return acc + 34;
            return acc + 0.5;
          }, 0).toFixed(2)),
        total_hos_used: Number(totalHOSUsed.toFixed(2)),
        initial_hos: parseFloat(currentCycleUsed) || 0,
        start_time: new Date(tripLogs[0].time).toISOString(),
        end_time: new Date(tripLogs[tripLogs.length - 1].time).toISOString()
      };
      // Create the trip first
      const tripResponse = await axios.post(`${API_URL}user/${tripData?.user}/trips/`, tripData);
      console.log('Trip saved successfully!', tripResponse.data);
      const tripId = tripResponse.data.trip_id;

      // Ensure all timestamps are consistent
      // First, determine the reference date from the first log
      const referenceDate = new Date(tripLogs[0].time);

      // Format the logs for API exactly matching the format from Postman
      const logsForApi = tripLogs.map((log, index) => {
        // Parse the date from the log time
        // Ensure dates are consistently increasing - some logs in the sample data had date inconsistencies
        const logTime = new Date(log.time);

        // Fix inconsistent dates by using the reference date + offset
        // For simplicity, we'll assume logs are in chronological order
        if (index > 0) {
          const prevLog = new Date(tripLogs[index - 1].time);
          if (logTime < prevLog) {
            // If the current log time is before the previous log time, adjust it
            // This fixes dates jumping back and forth between days
            const timeDiff = logTime.getTime() - referenceDate.getTime();
            logTime.setTime(prevLog.getTime() + (timeDiff > 0 ? 3600000 : 1800000)); // Add 1 hour or 30 min
          }
        }

        // Default coordinates to null (not undefined) to match the expected API format
        let latitude = null;
        let longitude = null;

        // For pickup, use pickup location
        if (log.status === "Pickup" && pickupLocation) {
          latitude = pickupLocation.coordinates[1];
          longitude = pickupLocation.coordinates[0];
        }
        // For dropoff, use dropoff location
        else if (log.status === "Dropoff" && dropoffLocation) {
          latitude = dropoffLocation.coordinates[1];
          longitude = dropoffLocation.coordinates[0];
        }
        // For stops, look up the matching stop
        else if ((log.status === "Resting" || log.status === "Refueling") && tripStops.length > 0) {
          // Try to find a matching stop
          const matchingStop = tripStops.find(stop =>
            stop.name.includes(log.status === "Resting" ? "Rest" : "Refueling")
          );

          if (matchingStop) {
            latitude = matchingStop.coordinates[1];
            longitude = matchingStop.coordinates[0];
          }
        }

        // Extract miles remaining if available
        let milesRemaining = null;  // Default to null to match expected format
        const milesMatch = log.description.match(/\((\d+(\.\d+)?) miles remaining\)/);
        if (milesMatch && milesMatch[1]) {
          milesRemaining = parseFloat(milesMatch[1]);
        }

        // Return an object exactly matching the Postman format
        return {
          log_time: logTime.toISOString(),
          status: log.status,
          description: log.description,
          latitude: latitude,
          longitude: longitude,
          miles_remaining: milesRemaining
        };
      });
      // Save the logs
      const logsResponse = await axios.post(`${API_URL}trip/${tripId}/logs/`, logsForApi);
      console.log('Logs saved successfully!', logsResponse.data);
      setApiError(null);
      return true;
    } catch (error) {
      console.error('Error saving trip data:', error);
      setApiError('Failed to save trip data. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Updated calculateRoute to handle API saving with TypeScript
  const calculateRoute = async (): Promise<void> => {
    if (!pickupLocation || !dropoffLocation) return;

    setIsLoading(true);
    setApiError(null);
    // Clear existing stops and logs
    setStops([]);
    setLogs([]);

    // Clear existing stop markers
    Object.keys(markers.current).forEach(key => {
      if (key.startsWith('stop')) {
        markers.current[key].remove();
        delete markers.current[key];
      }
    });

    try {
      // Calculate route from current location to pickup (if current location is available)
      let currentToPickupData: Route | null = null;
      if (currentLocation) {
        currentToPickupData = await calculateCurrentToPickupRoute();
      }

      // Calculate route from pickup to dropoff
      const pickupToDropoffData = await calculatePickupToDropoffRoute();

      if (pickupToDropoffData) {
        // Fit map to show entire route
        if (map.current) {
          const bounds = new mapboxgl.LngLatBounds();

          // Include current location if available
          if (currentLocation) {
            bounds.extend(currentLocation.coordinates);
          }

          // Include pickup and dropoff locations
          bounds.extend(pickupLocation.coordinates);
          bounds.extend(dropoffLocation.coordinates);

          map.current.fitBounds(bounds, { padding: 100 });
        }

        // Calculate logs and stops
        const initialCycleUsed = parseFloat(currentCycleUsed) || 0;
        let tripStartDistance = 0;
        let tripStartDuration = 0;

        // Add current to pickup leg if available
        if (currentToPickupData) {
          tripStartDistance = currentToPickupData.distance / 1609.34; // Convert meters to miles
          tripStartDuration = currentToPickupData.duration / 3600; // Convert seconds to hours
        }

        const mainTripDistance = pickupToDropoffData.distance / 1609.34; // Convert meters to miles
        const mainTripDuration = pickupToDropoffData.duration / 3600; // Convert seconds to hours

        const result = generateLogsAndStops(
          pickupToDropoffData,
          mainTripDistance,
          mainTripDuration,
          initialCycleUsed,
          tripStartDistance,
          tripStartDuration
        );

        const generatedLogs = result.logs;
        const generatedStops = result.stops;
        const calculatedHOSUsed = result.totalHOSUsed;

        setLogs(generatedLogs);
        setStops(generatedStops);
        setTotalHOSUsed(calculatedHOSUsed);

        // Add stops to the map along the route
        generatedStops.forEach((stop, index) => {
          if (map.current) {
            markers.current[`stop${index}`] = new mapboxgl.Marker({ color: "#FFA500" })
              .setLngLat(stop.coordinates)
              .setPopup(new mapboxgl.Popup().setHTML(`<strong>Stop ${index + 1}</strong><br>${stop.name}`))
              .addTo(map.current);
          }
        });

        // Save trip and log data right away after calculating the route
        await saveTripData(generatedLogs, generatedStops);
      }
    } catch (error) {
      console.error("Error calculating route:", error);
      setApiError("Error calculating route. Please try again.");
    }

    setIsLoading(false);
  };

  const handleLocationSelect = (suggestion: Suggestion, type: "pickup" | "dropoff") => {
    const location: Location = {
      name: suggestion.place_name,
      coordinates: suggestion.center,
    }

    if (type === "pickup") {
      setPickupLocation(location)
      if (markers.current.pickup) markers.current.pickup.remove()
      markers.current.pickup = new mapboxgl.Marker({ color: "#00FF00" })
        .setLngLat(suggestion.center)
        .addTo(map.current!)
    } else {
      setDropoffLocation(location)
      if (markers.current.dropoff) markers.current.dropoff.remove()
      markers.current.dropoff = new mapboxgl.Marker({ color: "#0000FF" })
        .setLngLat(suggestion.center)
        .addTo(map.current!)
    }

    setSuggestions([])
    setSearchTerm("")
    setActiveInput(null)

    // Update map view to show all markers
    if (map.current) {
      const bounds = new mapboxgl.LngLatBounds()
      Object.values(markers.current).forEach(marker => {
        bounds.extend(marker.getLngLat())
      })
      map.current.fitBounds(bounds, { padding: 100 })
    }
  }

  // Helper function to add a route to the map
  const addRouteToMap = (routeData: Route, sourceId: string, layerId: string, color: string) => {
    if (!map.current) return;
    const mapInstance = map.current;

    // Remove existing layer and source if they exist
    if (mapInstance.getLayer(layerId)) {
      mapInstance.removeLayer(layerId);
    }
    if (mapInstance.getSource(sourceId)) {
      mapInstance.removeSource(sourceId);
    }

    // Add new source and layer
    mapInstance.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: routeData.geometry,
      },
    });

    mapInstance.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": color,
        "line-width": 4,
        "line-opacity": 0.8,
      },
    });

    // Keep track of the layer for cleanup
    routeLayers.current.push(layerId);
  };

  // Calculate route from current location to pickup
  const calculateCurrentToPickupRoute = async () => {
    if (!currentLocation || !pickupLocation) return null;

    try {
      const coordinates = `${currentLocation.coordinates.join(",")};${pickupLocation.coordinates.join(",")}`;
      const response = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
      );

      if (response.data.routes?.[0]) {
        const routeData = response.data.routes[0];
        setCurrentToPickupRoute(routeData);
        addRouteToMap(routeData, "current-to-pickup-route", "current-to-pickup-layer", "#FFA500");
        return routeData;
      }
    } catch (error) {
      console.error("Error calculating current to pickup route:", error);
    }
    return null;
  };

  // Calculate route from pickup to dropoff
  const calculatePickupToDropoffRoute = async () => {
    if (!pickupLocation || !dropoffLocation) return null;

    try {
      const coordinates = `${pickupLocation.coordinates.join(",")};${dropoffLocation.coordinates.join(",")}`;
      const response = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
      );

      if (response.data.routes?.[0]) {
        const routeData = response.data.routes[0];
        setPickupToDropoffRoute(routeData);
        addRouteToMap(routeData, "pickup-to-dropoff-route", "pickup-to-dropoff-layer", "#3b82f6");
        return routeData;
      }
    } catch (error) {
      console.error("Error calculating pickup to dropoff route:", error);
    }
    return null;
  };

  // Function to interpolate a point along a route at a given distance
  const interpolatePointAlongRoute = (route: Route, distance: number): [number, number] => {
    const coordinates = route.geometry.coordinates;
    let distanceTraveled = 0;

    for (let i = 0; i < coordinates.length - 1; i++) {
      const start = coordinates[i];
      const end = coordinates[i + 1];

      // Calculate distance between these two points
      const segmentDistance = calculateDistance(start, end);

      if (distanceTraveled + segmentDistance >= distance) {
        // Interpolate between these points
        const remainingDistance = distance - distanceTraveled;
        const ratio = remainingDistance / segmentDistance;

        return [
          start[0] + (end[0] - start[0]) * ratio,
          start[1] + (end[1] - start[1]) * ratio
        ];
      }

      distanceTraveled += segmentDistance;
    }

    // If we get here, return the last point
    return coordinates[coordinates.length - 1];
  };

  // Calculate distance between two points (in meters)
  const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
    const lon1 = point1[0] * Math.PI / 180;
    const lat1 = point1[1] * Math.PI / 180;
    const lon2 = point2[0] * Math.PI / 180;
    const lat2 = point2[1] * Math.PI / 180;

    // Haversine formula
    const dlon = lon2 - lon1;
    const dlat = lat2 - lat1;
    const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = 6371000 * c; // Earth radius in meters

    return distance;
  };

  // const calculateRoute = async () => {
  //   if (!pickupLocation || !dropoffLocation) return;

  //   setIsLoading(true);
  //   setApiError(null);
  //   // Clear existing stops and logs
  //   setStops([]);
  //   setLogs([]);

  //   // Clear existing stop markers
  //   Object.keys(markers.current).forEach(key => {
  //     if (key.startsWith('stop')) {
  //       markers.current[key].remove();
  //       delete markers.current[key];
  //     }
  //   });

  //   try {
  //     // Calculate route from current location to pickup (if current location is available)
  //     let currentToPickupData = null;
  //     if (currentLocation) {
  //       currentToPickupData = await calculateCurrentToPickupRoute();
  //     }

  //     // Calculate route from pickup to dropoff
  //     const pickupToDropoffData = await calculatePickupToDropoffRoute();

  //     if (pickupToDropoffData) {
  //       // Fit map to show entire route
  //       if (map.current) {
  //         const bounds = new mapboxgl.LngLatBounds();

  //         // Include current location if available
  //         if (currentLocation) {
  //           bounds.extend(currentLocation.coordinates);
  //         }

  //         // Include pickup and dropoff locations
  //         bounds.extend(pickupLocation.coordinates);
  //         bounds.extend(dropoffLocation.coordinates);

  //         map.current.fitBounds(bounds, { padding: 100 });
  //       }

  //       // Calculate logs and stops
  //       const initialCycleUsed = parseFloat(currentCycleUsed) || 0;
  //       let tripStartDistance = 0;
  //       let tripStartDuration = 0;

  //       // Add current to pickup leg if available
  //       if (currentToPickupData) {
  //         tripStartDistance = currentToPickupData.distance / 1609.34; // Convert meters to miles
  //         tripStartDuration = currentToPickupData.duration / 3600; // Convert seconds to hours
  //       }

  //       const mainTripDistance = pickupToDropoffData.distance / 1609.34; // Convert meters to miles
  //       const mainTripDuration = pickupToDropoffData.duration / 3600; // Convert seconds to hours

  //       const { logs, stops, totalHOSUsed } = generateLogsAndStops(
  //         pickupToDropoffData,
  //         mainTripDistance,
  //         mainTripDuration,
  //         initialCycleUsed,
  //         tripStartDistance,
  //         tripStartDuration
  //       );

  //       setLogs(logs);
  //       setStops(stops);
  //       setTotalHOSUsed(totalHOSUsed);

  //       // Add stops to the map along the route
  //       stops.forEach((stop, index) => {
  //         markers.current[`stop${index}`] = new mapboxgl.Marker({ color: "#FFA500" })
  //           .setLngLat(stop.coordinates)
  //           .setPopup(new mapboxgl.Popup().setHTML(`<strong>Stop ${index + 1}</strong><br>${stop.name}`))
  //           .addTo(map.current!);
  //       });
  //       await saveTripData();
  //     }
  //   } catch (error) {
  //     console.error("Error calculating route:", error);
  //     setApiError("Error calculating route. Please try again.");
  //   }

  //   setIsLoading(false);
  // };

  const generateLogsAndStops = (route: Route, tripDistance: number, tripDuration: number, initialHOSUsed: number, tripStartDistance: number = 0, tripStartDuration: number = 0) => {
    const logs: LogEntry[] = [];
    const stops: Location[] = [];

    let totalDistance = tripStartDistance + tripDistance;
    let remainingDistance = totalDistance;
    let remainingDuration = tripStartDuration + tripDuration;
    let currentTime = new Date();

    // Property-carrying driver assumptions:
    // - Driver can work for 70 hours in 8 days
    // - Driver must take a 30-minute break after 8 hours of driving
    // - Driver must rest for 10 hours after 14 hours of duty
    // - Driver must refuel at least once every 1,000 miles
    // - Pickup and drop-off take 1 hour each
    // - Refueling takes 30 minutes

    const averageSpeed = 55; // mph
    const maxDrivingHours = 8; // Max driving hours before a break
    const maxDutyHours = 14; // Max duty hours before rest
    const maxRefuelingDistance = 1000; // miles

    let drivingHours = 0;
    let dutyHours = initialHOSUsed;
    let totalHOSUsed = initialHOSUsed;
    let distanceSinceLastRefuel = 0;

    // Track distance traveled for stop placement
    let distanceTraveled = 0;

    // If there's a trip from current location to pickup
    if (tripStartDistance > 0) {
      // Starting the journey
      logs.push({
        time: formatTime(currentTime),
        status: "Driving",
        description: `Starting trip to pickup location (${tripStartDistance.toFixed(1)} miles)`
      });

      // Calculate duration and update time based on the start journey
      const startJourneyHours = Math.min(maxDrivingHours, tripStartDuration);
      drivingHours += startJourneyHours;
      dutyHours += startJourneyHours;
      totalHOSUsed += startJourneyHours;
      currentTime = addHours(currentTime, startJourneyHours);
      remainingDistance -= (startJourneyHours * averageSpeed);
      distanceSinceLastRefuel += (startJourneyHours * averageSpeed);

      // Check if refueling is needed during journey to pickup
      if (distanceSinceLastRefuel >= maxRefuelingDistance) {
        const refuelPoint = interpolatePointAlongRoute(route, distanceTraveled + tripStartDistance * 0.8);

        logs.push({
          time: formatTime(currentTime),
          status: "Refueling",
          description: "30-minute refueling stop"
        });

        stops.push({
          name: "Refueling Stop",
          coordinates: refuelPoint
        });

        currentTime = addMinutes(currentTime, 30);
        dutyHours += 0.5;
        totalHOSUsed += 0.5;
        distanceSinceLastRefuel = 0;
      }

      // Add break if driving hours exceeded
      if (drivingHours >= maxDrivingHours) {
        logs.push({
          time: formatTime(currentTime),
          status: "Resting",
          description: "30-minute break (required after 8 hours driving)"
        });

        currentTime = addMinutes(currentTime, 30);
        drivingHours = 0;
        dutyHours += 0.5;
        totalHOSUsed += 0.5;
      }

      // Add required rest if duty hours exceeded
      if (dutyHours >= maxDutyHours) {
        logs.push({
          time: formatTime(currentTime),
          status: "Off Duty",
          description: "10-hour required rest period (14-hour duty limit reached)"
        });

        currentTime = addHours(currentTime, 10);
        drivingHours = 0;
        dutyHours = 0;
      }
    }

    // Add pickup log
    logs.push({
      time: formatTime(currentTime),
      status: "Pickup",
      description: "Pickup at origin"
    });

    currentTime = addHours(currentTime, 1); // 1 hour for pickup
    dutyHours += 1;
    totalHOSUsed += 1;

    // Reset distance traveled for the main trip
    distanceTraveled = 0;
    const segmentDistance = tripDistance / Math.ceil(tripDistance / 500); // Divide route into segments

    while (distanceTraveled < tripDistance) {
      // Check if HOS limit reached (70 hours in 8 days)
      if (totalHOSUsed >= 70) {
        logs.push({
          time: formatTime(currentTime),
          status: "Off Duty",
          description: "34-hour restart (70-hour/8-day limit reached)"
        });

        currentTime = addHours(currentTime, 34);
        drivingHours = 0;
        dutyHours = 0;
        totalHOSUsed = 0; // Reset HOS after 34-hour restart
        continue;
      }

      // Check if driver needs a break
      if (drivingHours >= maxDrivingHours) {
        logs.push({
          time: formatTime(currentTime),
          status: "Resting",
          description: "30-minute break (required after 8 hours driving)"
        });

        currentTime = addMinutes(currentTime, 30);
        drivingHours = 0;
        dutyHours += 0.5;
        totalHOSUsed += 0.5;
        continue;
      }

      // Check if driver needs off-duty time
      if (dutyHours >= maxDutyHours) {
        logs.push({
          time: formatTime(currentTime),
          status: "Off Duty",
          description: "10-hour required rest period (14-hour duty limit reached)"
        });

        currentTime = addHours(currentTime, 10);
        drivingHours = 0;
        dutyHours = 0;
        continue;
      }

      // Check if refueling is needed
      if (distanceSinceLastRefuel >= maxRefuelingDistance) {
        // Calculate a point along the route for the refueling stop
        const refuelPoint = interpolatePointAlongRoute(route, distanceTraveled);

        logs.push({
          time: formatTime(currentTime),
          status: "Refueling",
          description: "30-minute refueling stop"
        });

        stops.push({
          name: "Refueling Stop",
          coordinates: refuelPoint
        });

        currentTime = addMinutes(currentTime, 30);
        dutyHours += 0.5;
        totalHOSUsed += 0.5;
        distanceSinceLastRefuel = 0;
        continue;
      }

      // Drive for next segment or remaining distance
      const drivingSegment = Math.min(
        averageSpeed, // Maximum distance in one hour
        tripDistance - distanceTraveled, // Remaining distance
        (maxDrivingHours - drivingHours) * averageSpeed, // Distance limit based on driving hours
        maxRefuelingDistance - distanceSinceLastRefuel // Distance limit based on refueling
      );

      const drivingTime = drivingSegment / averageSpeed; // Time in hours

      logs.push({
        time: formatTime(currentTime),
        status: "Driving",
        description: `Driving for ${(drivingTime * 60).toFixed(0)} minutes (${(tripDistance - distanceTraveled - drivingSegment).toFixed(1)} miles remaining)`
      });

      drivingHours += drivingTime;
      dutyHours += drivingTime;
      totalHOSUsed += drivingTime;
      distanceTraveled += drivingSegment;
      distanceSinceLastRefuel += drivingSegment;
      currentTime = addHours(currentTime, drivingTime);

      // Add a rest stop approximately every 500 miles
      if (Math.floor(distanceTraveled / 500) > Math.floor((distanceTraveled - drivingSegment) / 500)) {
        const restPoint = interpolatePointAlongRoute(route, distanceTraveled);

        logs.push({
          time: formatTime(currentTime),
          status: "Resting",
          description: "Rest stop"
        });

        stops.push({
          name: `Rest Stop (${distanceTraveled.toFixed(0)} miles from pickup)`,
          coordinates: restPoint
        });

        currentTime = addMinutes(currentTime, 30);
        dutyHours += 0.5;
        totalHOSUsed += 0.5;
      }
    }

    // Add drop-off log
    logs.push({
      time: formatTime(currentTime),
      status: "Dropoff",
      description: "Dropoff at destination"
    });

    currentTime = addHours(currentTime, 1); // 1 hour for drop-off
    dutyHours += 1;
    totalHOSUsed += 1;

    return { logs, stops, totalHOSUsed };
  };

  // Helper function to format time
  const formatTime = (date: Date): string => {
    return date.toISOString().split("T")[0] + " " +
      date.getHours().toString().padStart(2, "0") + ":" +
      date.getMinutes().toString().padStart(2, "0");
  };

  // Helper function to add hours to a date
  const addHours = (date: Date, hours: number): Date => {
    const newDate = new Date(date);
    newDate.setTime(date.getTime() + hours * 60 * 60 * 1000);
    return newDate;
  };

  // Helper function to add minutes to a date
  const addMinutes = (date: Date, minutes: number): Date => {
    const newDate = new Date(date);
    newDate.setTime(date.getTime() + minutes * 60 * 1000);
    return newDate;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Panel - Input Form */}
          <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Trip Planner</h1>

            {/* Current Location */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Current Location
              </label>
              <div className="flex gap-2">
                <button
                  onClick={detectCurrentLocation}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Navigation className="w-5 h-5 mr-2" />
                  )}
                  Detect Location
                </button>
              </div>
              {currentLocation && (
                <p className="text-sm text-gray-600">{currentLocation.name}</p>
              )}
            </div>

            {/* Pickup Location */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Pickup Location
              </label>
              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={activeInput === "pickup" ? searchTerm : pickupLocation?.name || ""}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setActiveInput("pickup")
                        searchLocations(e.target.value)
                      }}
                      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Search pickup location"
                    />
                    <Search className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
                  </div>
                </div>
                {activeInput === "pickup" && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
                        onClick={() => handleLocationSelect(suggestion, "pickup")}
                      >
                        {suggestion.place_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dropoff Location */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Dropoff Location
              </label>
              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={activeInput === "dropoff" ? searchTerm : dropoffLocation?.name || ""}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setActiveInput("dropoff")
                        searchLocations(e.target.value)
                      }}
                      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Search dropoff location"
                    />
                    <Search className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
                  </div>
                </div>
                {activeInput === "dropoff" && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
                        onClick={() => handleLocationSelect(suggestion, "dropoff")}
                      >
                        {suggestion.place_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Current Cycle Used */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Current Cycle Used (Hrs)
              </label>
              <input
                type="number"
                value={currentCycleUsed}
                onChange={(e) => setCurrentCycleUsed(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter hours"
              />
            </div>

            {/* Calculate Route Button */}
            <button
              onClick={calculateRoute}
              disabled={!pickupLocation || !dropoffLocation || isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                "Calculate Route"
              )}
            </button>

            {/* Error message - add this right here */}
            {apiError && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                <p>{apiError}</p>
              </div>
            )}
          </div>

          {/* Right Panel - Map */}
          <div className="md:col-span-2">
            <div
              ref={mapContainer}
              className="h-[600px] rounded-lg shadow-md overflow-hidden"
            />
          </div>
        </div>

        {/* Trip Details */}
        {/* Trip Details */}
        {(currentToPickupRoute || pickupToDropoffRoute) && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Trip Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-700">Total Distance</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {((currentToPickupRoute?.distance || 0) / 1609.34 + (pickupToDropoffRoute?.distance || 0) / 1609.34).toFixed(1)} miles
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-700">Total Estimated Time</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {/* Calculate the actual time by analyzing the logs - total time between first and last log */}
                  {logs.length > 1 ?
                    (() => {
                      const firstLogTime = new Date(logs[0].time);
                      const lastLogTime = new Date(logs[logs.length - 1].time);
                      const diffHours = (lastLogTime.getTime() - firstLogTime.getTime()) / (1000 * 60 * 60);
                      return diffHours.toFixed(1);
                    })() :
                    ((currentToPickupRoute?.duration || 0) / 3600 + (pickupToDropoffRoute?.duration || 0) / 3600).toFixed(1)
                  } hours
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-700">Driving Time</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {/* Calculate actual driving time from driving logs */}
                  {logs.filter(log => log.status === "Driving").length > 0 ?
                    logs.filter(log => log.status === "Driving")
                      .reduce((acc, log) => {
                        const timeMatch = log.description.match(/Driving for (\d+) minutes/);
                        return timeMatch ? acc + (parseInt(timeMatch[1]) / 60) : acc;
                      }, 0).toFixed(1) :
                    ((pickupToDropoffRoute?.duration || 0) / 3600).toFixed(1)
                  } hours
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-700">Rest & Stop Time</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {/* Calculate actual rest time from rest/refuel/pickup/dropoff logs */}
                  {logs.filter(log => ["Resting", "Off Duty", "Pickup", "Dropoff", "Refueling"].includes(log.status)).length > 0 ?
                    (() => {
                      const restTime = logs.filter(log => log.status === "Resting" || log.status === "Off Duty")
                        .reduce((acc, log) => {
                          if (log.status === "Resting") return acc + 0.5; // 30 minutes
                          if (log.description.includes("10-hour")) return acc + 10;
                          if (log.description.includes("34-hour")) return acc + 34;
                          return acc + 0.5; // Default 30 minutes
                        }, 0);
                      const pickupDropoffTime = logs.filter(log => log.status === "Pickup" || log.status === "Dropoff").length * 1; // 1 hour each
                      const refuelTime = logs.filter(log => log.status === "Refueling").length * 0.5; // 30 minutes each
                      return (restTime + pickupDropoffTime + refuelTime).toFixed(1);
                    })() :
                    "2.0"
                  } hours
                </p>
              </div>
            </div>
            {/* Display HOS information and stops */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-700">Hours of Service Used</h3>
                <p className="text-2xl font-bold text-blue-600">{totalHOSUsed.toFixed(1)} hours</p>
                <p className="text-sm text-gray-600 mt-1">HOS remaining: {(70 - totalHOSUsed).toFixed(1)} hours</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-700">Planned Stops</h3>
                <p className="text-2xl font-bold text-blue-600">{stops.length}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {stops.map(stop => stop.name.includes("Refueling") ? "⛽" : "🛌").join(" ")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Driver Logs with Timeline */}
        {logs.length > 0 && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Driver Journey Timeline</h2>
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-full"></div>

              <div className="space-y-0">
                {logs.map((log, index) => {
                  // Determine which icon and color to use
                  let IconComponent;
                  let iconColor;
                  let bgColor;
                  let borderColor;

                  switch (log.status) {
                    case "Driving":
                      IconComponent = Truck;
                      iconColor = "text-blue-600";
                      bgColor = "bg-blue-50";
                      borderColor = "border-blue-200";
                      break;
                    case "Resting":
                      IconComponent = Bed;
                      iconColor = "text-green-600";
                      bgColor = "bg-green-50";
                      borderColor = "border-green-200";
                      break;
                    case "Pickup":
                      IconComponent = User;
                      iconColor = "text-amber-600";
                      bgColor = "bg-amber-50";
                      borderColor = "border-amber-200";
                      break;
                    case "Dropoff":
                      IconComponent = User;
                      iconColor = "text-purple-600";
                      bgColor = "bg-purple-50";
                      borderColor = "border-purple-200";
                      break;
                    case "Off Duty":
                      IconComponent = Clock;
                      iconColor = "text-red-600";
                      bgColor = "bg-red-50";
                      borderColor = "border-red-200";
                      break;
                    case "Refueling":
                      IconComponent = Droplet;
                      iconColor = "text-cyan-600";
                      bgColor = "bg-cyan-50";
                      borderColor = "border-cyan-200";
                      break;
                    default:
                      IconComponent = Truck;
                      iconColor = "text-gray-600";
                      bgColor = "bg-gray-50";
                      borderColor = "border-gray-200";
                  }

                  // Extract date and time for better formatting
                  const [date, time] = log.time.split(' ');

                  return (
                    <div key={index} className={`relative ml-12 mb-8 ${index === logs.length - 1 ? '' : 'pb-8'}`}>
                      {/* Timeline node */}
                      <div className={`absolute -left-16 flex items-center justify-center w-10 h-10 rounded-full ${bgColor} border-2 ${borderColor} z-10`}>
                        <IconComponent className={`w-5 h-5 ${iconColor}`} />
                      </div>

                      {/* Content card */}
                      <div className={`p-5 ${bgColor} rounded-lg shadow-sm border ${borderColor} transform transition-all duration-300 hover:scale-102 hover:shadow-md`}>
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
                          <div className="flex items-center gap-2 mb-2 md:mb-0">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${iconColor.replace('text', 'bg')} bg-opacity-20 text-gray-800`}>
                              {log.status}
                            </span>
                          </div>
                          <div className="flex flex-col md:items-end">
                            <span className="text-sm font-semibold text-gray-700">{date}</span>
                            <span className="text-xs text-gray-500">{time}</span>
                          </div>
                        </div>

                        <p className="text-gray-700">{log.description}</p>

                        {/* Visual indicators for specific log types */}
                        {log.status === "Driving" && (
                          <div className="mt-3 flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full"
                                style={{
                                  width: `${Math.min(100, parseFloat(log.description.match(/Driving for (\d+(\.\d+)?)/)?.at(1) || "0") / 480 * 100)}%`
                                }}
                              ></div>
                            </div>
                            <span className="ml-2 text-xs text-gray-500">Drive Time</span>
                          </div>
                        )}

                        {log.status === "Resting" && (
                          <div className="mt-3 grid grid-cols-4 gap-1">
                            {[...Array(4)].map((_, i) => (
                              <div key={i} className={`h-1 rounded-full ${i < 2 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                            ))}
                          </div>
                        )}

                        {log.status === "Off Duty" && (
                          <div className="mt-3 flex items-center">
                            <div className="flex space-x-1">
                              {[...Array(8)].map((_, i) => (
                                <div key={i} className="w-2 h-2 rounded-full bg-red-500 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
                              ))}
                            </div>
                            <span className="ml-2 text-xs text-gray-500">Rest Period</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary indicators at the bottom */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Journey Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                    <Truck className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs text-center text-gray-600">
                    {logs.filter(log => log.status === "Driving").length} Driving Segments
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                    <Bed className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-xs text-center text-gray-600">
                    {logs.filter(log => log.status === "Resting").length} Rest Stops
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-2">
                    <Clock className="w-6 h-6 text-red-600" />
                  </div>
                  <span className="text-xs text-center text-gray-600">
                    {logs.filter(log => log.status === "Off Duty").length} Off-Duty Periods
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-cyan-100 rounded-full mb-2">
                    <Droplet className="w-6 h-6 text-cyan-600" />
                  </div>
                  <span className="text-xs text-center text-gray-600">
                    {logs.filter(log => log.status === "Refueling").length} Refueling Stops
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-2">
                    <User className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-xs text-center text-gray-600">
                    {logs.filter(log => log.status === "Pickup").length} Pickups
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-2">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-xs text-center text-gray-600">
                    {logs.filter(log => log.status === "Dropoff").length} Dropoffs
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}