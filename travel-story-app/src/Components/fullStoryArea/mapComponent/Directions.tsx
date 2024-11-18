import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import RouteDialog from "./RouteDialog";
import RouteModel from "../../../Models/RouteModel"; 
import { getCityCoordinatesGoogle } from "../../../Services/CountriesCitiesService";

interface DirectionsProps {
  routesData: RouteModel[];  
}

export function Directions({routesData} : DirectionsProps) {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
  const [directionsRenderers, setDirectionsRenderers] = useState<google.maps.DirectionsRenderer[]>([]);

  // Dialog control
  const [selectedRoute, setSelectedRoute] = useState<RouteModel | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 }); 

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    const newRenderers = routesData.map(() => new routesLibrary.DirectionsRenderer({ map }));
    setDirectionsRenderers(newRenderers); 
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsService || directionsRenderers.length === 0 || !map) return; 

    routesData.forEach(async (route, index) => {
      try {
        const response = await directionsService.route({
          origin: route.origin,
          destination: route.destination,
          travelMode: google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: false,
        });

        const polyline = new google.maps.Polyline({
          path: response.routes[0].overview_path,
          strokeColor: "#B25E39",
          strokeWeight: 3,
          map,
        });

        polyline.addListener("click", (event: google.maps.MapMouseEvent) => {
          setSelectedRoute(route); 
          setDialogOpen(true); 
        
          const { x, y } = event.domEvent as MouseEvent;
          setClickPosition({ x, y });
        });

        directionsRenderers[index].setMap(map);
      } catch (error) {
        console.warn("Error fetching directions:", error);
        handleFallbackRoute(route, map, setSelectedRoute, setDialogOpen, setClickPosition);
      }
    });

    return () => {
      directionsRenderers.forEach((renderer) => renderer.setMap(null));
    };

  }, [directionsService, directionsRenderers, routesData, map]);

  return (
    <>
      {selectedRoute && (
        <RouteDialog
          route={selectedRoute}  
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          x={clickPosition.x} 
          y={clickPosition.y} 
        />
      )}
    </>
  );
}

async function handleFallbackRoute(
  route: RouteModel,
  map: google.maps.Map,
  setSelectedRoute: React.Dispatch<React.SetStateAction<RouteModel | null>>,
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setClickPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>
) {
  try {
    const [originCoords, destinationCoords] = await Promise.all([
      getCityCoordinatesGoogle(route.origin),
      getCityCoordinatesGoogle(route.destination),
    ]);

    if (originCoords && destinationCoords) {
      const fallbackPolyline = new google.maps.Polyline({
        path: [
          new google.maps.LatLng(originCoords.lat, originCoords.lng),
          new google.maps.LatLng(destinationCoords.lat, destinationCoords.lng),
        ],
        strokeColor: "#B25E39", 
        strokeWeight: 2,
        map,
      });

      fallbackPolyline.addListener("click", (event: google.maps.MapMouseEvent) => {
        setSelectedRoute(route);
        setDialogOpen(true);

        const { x, y } = event.domEvent as MouseEvent;
        setClickPosition({ x, y });
      });
    }
  } catch (error) {
    console.error("Geocoding failed for fallback polyline:", error);
  }
}

