import { useEffect, useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
} from "@vis.gl/react-google-maps"; // Removed `useMap` since it's unnecessary
import { calculateDaysDifference } from "../../../services/DateService";
import { Directions } from "./Directions";
import LocationModel from "../../../models/LocationModel";
import "./Map.css";
import story from "../FakeStory.json";
import { getCityCoordinatesGoogle } from "../../../services/CountriesCitiesService";

interface LocationWithCoordinates extends LocationModel {
  lat: number;
  lng: number;
}

const MapComponent: React.FC = () => {
  const [locations, setLocations] = useState<LocationWithCoordinates[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationWithCoordinates | null>(null);
  const [center, setCenter] = useState<{ lat: number, lng: number }>({ lat: 35.6762, lng: 139.6503 }); // Default center: Tokyo

  useEffect(() => {
    const updateLocations = async () => {
      const updatedLocations: LocationWithCoordinates[] = [];

      for (const location of story.locations) {
        const coordinates = await getCityCoordinatesGoogle(location.city);
        if (coordinates) {
          updatedLocations.push({
            ...location,
            _id:'',
            videos: [],
            lat: coordinates.lat,
            lng: coordinates.lng,
            startDate: new Date(location.startDate),
            endDate: new Date(location.endDate),
          });
        }
      }

      setLocations(updatedLocations);

      // Update center to the first location's coordinates, if any locations were fetched
      if (updatedLocations.length > 0) {
        setCenter({ lat: updatedLocations[0].lat, lng: updatedLocations[0].lng });
      }
    };

    updateLocations();
  }, []); // Only runs once on mount

  return (
    <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "Your_API_Key_Here"}>
      <Map
        defaultZoom={6}
        defaultCenter={center} // Use `defaultCenter` for initial map load
        mapId={process.env.REACT_APP_GOOGLE_MAPS_ID}
        colorScheme="DARK"
        className="storyMap"
      >
        {locations.map((location, index) => (
          <AdvancedMarker
            key={index}
            position={{ lat: location.lat, lng: location.lng }}
            onClick={() => setSelectedLocation(location)}
          >
            <div className="pinImageDiv">
              {location.photos && location.photos.length > 0 && (
                <img
                  className="pinImage"
                  src={URL.createObjectURL(location.photos[0])} // Assuming photos are `Blob` or `File`
                  alt={location.city}
                />
              )}
            </div>
          </AdvancedMarker>
        ))}

        {selectedLocation && (
          <InfoWindow
            position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
            onCloseClick={() => setSelectedLocation(null)}
          >
            <div className="infoWindow">
              <div className="mapPhotosDiv">
                {selectedLocation.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(photo)} // Assuming photos are `Blob` or `File`
                    alt={selectedLocation.city}
                    className="mapPhoto"
                  />
                ))}
              </div>
              <div className="mapInformation">
                <h2 className="mapStoryTitle">{selectedLocation.city}</h2>
                <hr className="mapHr"></hr>
                <p className="mapStoryPar">{selectedLocation.story}</p>
                <p>
                  Duration:{" "}
                  {calculateDaysDifference(
                    selectedLocation.startDate,
                    selectedLocation.endDate
                  )}{" "}
                  days
                </p>
                <p>Cost: {selectedLocation.cost}</p>
              </div>
            </div>
          </InfoWindow>
        )}

        <Directions routesData={story.routes} />
      </Map>
    </APIProvider>
  );
};

export default MapComponent;
