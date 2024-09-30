import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import RouteDialog from "./RouteDialog";
import RouteModel from "../../../models/RouteModel"; // Import RouteModel

export function Directions({ routesData }: { routesData: RouteModel[] }) {
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
          travelMode: getTravelMode(route.transportType),
          provideRouteAlternatives: false,
        });

        const polyline = new google.maps.Polyline({
          path: response.routes[0].overview_path,
          strokeColor: "#B25E39",
          strokeWeight: 3,
          map,
        });

        polyline.addListener("click", (event: google.maps.MapMouseEvent) => {
          setSelectedRoute(route);  // Set the clicked route as the selected route
          setDialogOpen(true); 
        
          const { x, y } = event.domEvent as MouseEvent;
          setClickPosition({ x, y });  // Capture the click position
        });

        directionsRenderers[index].setMap(map);
      } catch (error) {
        console.error("Error fetching directions:", error);
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
          route={selectedRoute}  // Pass the selected route here
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          x={clickPosition.x} 
          y={clickPosition.y} 
        />
      )}
    </>
  );
}

const getTravelMode = (transportType: string) => {
  switch (transportType.toLowerCase()) {
    case "car":
      return google.maps.TravelMode.DRIVING;
    case "bus":
    case "train":
      return google.maps.TravelMode.TRANSIT;
    default:
      return google.maps.TravelMode.DRIVING;
  }
};
