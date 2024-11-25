import { useEffect, useState } from "react";
import {APIProvider,Map,AdvancedMarker,InfoWindow} from "@vis.gl/react-google-maps";
import {calculateDaysDifference, formatDate,} from "../../../Services/DateService";
import { Directions } from "./Directions";
import LocationModel from "../../../Models/LocationModel";
import "./Map.css";
import { getCityCoordinatesGoogle } from "../../../Services/CountriesCitiesService";
import StoryModel from "../../../Models/StoryModel";
import Slider from "react-slick";
import durationIcon from "../../../Assets/SVGs/flight-date.png";
import budgetIcon from "../../../Assets/SVGs/money-bag.png";
import pinSharpCircle from '../../../Assets/SVGs/pin-sharp-circle.png';
import Media from "../../reusableComponents/Media";

interface LocationWithCoordinates extends LocationModel {
  lat: number;
  lng: number;
}

interface MapComponentProps {
  story: StoryModel | undefined;
  center: { lat: number; lng: number };
}

const MapComponent: React.FC<MapComponentProps> = ({ story, center }) => {

  const [locations, setLocations] = useState<LocationWithCoordinates[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationWithCoordinates | null>(null);

  useEffect(() => {
    if (story) {
      updateLocations(story);
    }
  }, [story]);

  const updateLocations = async (story: StoryModel) => {
    const updatedLocations: LocationWithCoordinates[] = [];

    for (const location of story.locations) {
      const coordinates = await getCityCoordinatesGoogle(location.city);
      if (coordinates) {
        updatedLocations.push({
          ...location,
          lat: coordinates.lat,
          lng: coordinates.lng,
          startDate: new Date(location.startDate),
          endDate: new Date(location.endDate),
        });
      }
    }

    setLocations(updatedLocations);
  };

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const WORLD_BOUNDS = {
    north: 85,
    south: -85,
    west: -360,
    east: 360,
  };

  return (
    <APIProvider
      apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "Your_API_Key_Here"}
    >
      <Map
        defaultZoom={6}
        defaultCenter={center}
        mapId={process.env.REACT_APP_GOOGLE_MAPS_ID}
        colorScheme="DARK"
        className="storyMap"
        gestureHandling="greedy"
        streetViewControl={false}
        mapTypeControl={false}
        zoomControl={false}
        restriction={{
          latLngBounds: WORLD_BOUNDS,
          strictBounds: true,
        }}
      >
        {locations.map((location, index) => (
          <AdvancedMarker
            key={index}
            position={{ lat: location.lat, lng: location.lng }}
            onClick={() => setSelectedLocation(location)}
          >
            <div className="pinImageDiv">
              <Media
                filename={(location.photos && location.photos.length > 0 ? location.photos[0] : pinSharpCircle) as string}
                type="photo"
                className={`pinImage ${location.photos && location.photos.length > 0 ? '' : 'defaultImage'}`}
                altText={location.city}
              />
            </div>
          </AdvancedMarker>
        ))}

        {selectedLocation && (
          <InfoWindow
            position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
            onCloseClick={() => setSelectedLocation(null)}
          >
            <div className="infoWindow">
              <Slider {...sliderSettings}>
                {selectedLocation?.videos?.map((video, index) => (
                  <div
                    key={`${selectedLocation.city}-video-${index}`}
                    className="mapVideosDiv"
                  >
                    <Media
                      id={`video-${selectedLocation.city}-${index}`}
                      filename={video as string}
                      type="video"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  </div>
                ))}
              </Slider>
              <div className="mapInformation">
                <h2 className="mapStoryTitle">{selectedLocation.city}</h2>
                <hr className="mapHr"></hr>
                <p className="mapStoryPar">{selectedLocation.story}</p>
                <p className="durationInfoWindow">
                  <img src={durationIcon} />
                  &nbsp;
                  {formatDate(selectedLocation.startDate)} -{" "}
                  {formatDate(selectedLocation.endDate)}
                  &nbsp; (
                  {calculateDaysDifference(
                    selectedLocation.startDate,
                    selectedLocation.endDate
                  )}{" "}
                  days)
                </p>
                {selectedLocation.cost !== 0 && <p className="budgetInfoWindow">
                  <img src={budgetIcon} />
                  &nbsp; Cost: {selectedLocation.cost}{" "}
                  {selectedLocation.currency}
                </p>}
              </div>
              <div className="mapPhotosDiv">
                {selectedLocation.photos.map((photo, index) => (
                  <Media
                    key={index}
                    filename={photo as string}
                    type="photo"
                    altText={selectedLocation.city}
                    className="mapPhoto"
                  />
                ))}
              </div>
            </div>
          </InfoWindow>
        )}

        {story && story?.routes?.length > 0 && <Directions routesData={story.routes} />}
      </Map>
    </APIProvider>
  );
};

export default MapComponent;
