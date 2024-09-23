import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

interface Route {
  from: string;
  to: string;
  wayOfTransport: string;
  note:string;
  time: number;
}

export function Directions({ routesData }: { routesData: Route[] }) {

  const map = useMap();

  const routesLibrary = useMapsLibrary("routes");
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
  const [directionsRenderers, setDirectionsRenderers] = useState<google.maps.DirectionsRenderer[]>([]);

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
          origin: route.from,
          destination: route.to,
          travelMode: getTravelMode(route.wayOfTransport),
          provideRouteAlternatives: false,
        });

        const directionsOptions = {
          polylineOptions: {
            strokeColor: "#B25E39",
            strokeWeight: 3,
          },
        };

        directionsRenderers[index] = new google.maps.DirectionsRenderer({
          map,
          directions: response,
          polylineOptions: directionsOptions.polylineOptions,
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
  
  return null;
}

const getTravelMode = (wayOfTransport: string) => {
  switch (wayOfTransport.toLowerCase()) {
    case "car":
      return google.maps.TravelMode.DRIVING;
    case "bus":
    case "train":
      return google.maps.TravelMode.TRANSIT;
    default:
      return google.maps.TravelMode.DRIVING;
  }
};