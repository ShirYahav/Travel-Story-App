import React, { useEffect, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import StoryModel from '../../../Models/StoryModel';
import LocationModel from '../../../Models/LocationModel';
import { getCityCoordinatesGoogle } from '../../../Services/CountriesCitiesService';
import Slider from 'react-slick';
import durationIcon from '../../../Assets/SVGs/flight-date.png';
import budgetIcon from '../../../Assets/SVGs/money-bag.png';
import { calculateDaysDifference, formatDate } from '../../../Services/DateService';
import pinSharpCircle from '../../../Assets/SVGs/pin-sharp-circle.png';
import './UserMap.css';
import Media from '../../reusableComponents/Media';

interface LocationWithCoordinates extends LocationModel {
  lat: number;
  lng: number;
}

interface UserMapProps {
  stories: StoryModel[];
}

const UserMap: React.FC<UserMapProps> = ({ stories }) => {

  const [locations, setLocations] = useState<LocationWithCoordinates[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationWithCoordinates | null>(null);

  useEffect(() => {
    const updateLocations = async () => {
      const updatedLocations: LocationWithCoordinates[] = [];
      for (const story of stories) {
        const locationPromises = story.locations.map(async (location) => {
          const coordinates = await getCityCoordinatesGoogle(location.city);

          if (!coordinates) return null;

          return {
            ...location,
            lat: coordinates.lat,
            lng: coordinates.lng,
            startDate: new Date(location.startDate),
            endDate: new Date(location.endDate),
          };
        });
        const resolvedLocations = await Promise.all(locationPromises);
        updatedLocations.push(...(resolvedLocations.filter(Boolean) as LocationWithCoordinates[]));
      }
      setLocations(updatedLocations);
    };

    if (stories.length > 0) updateLocations();
  }, [stories]);

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
    <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'Your_API_Key_Here'}>
      <Map
        defaultZoom={1}
        defaultCenter={{ lat: 0, lng: 0 }}
        mapId={process.env.REACT_APP_GOOGLE_MAPS_ID}
        className="userStoriesMap"
        colorScheme="DARK"
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
                {selectedLocation.videos.map((video, index) => (
                  <div key={`${selectedLocation.city}-video-${index}`} className="mapVideosDiv">
                    <Media
                      id={`video-${selectedLocation.city}-${index}`}
                      filename={video as string}
                      type="video"
                      autoPlay
                      muted
                      loop
                      playsInline
                      controls = {false}
                    />
                  </div>
                ))}
              </Slider>
              <div className="mapInformation">
                <h2 className="mapStoryTitle">{selectedLocation.city}</h2>
                <hr className="mapHr"></hr>
                <p className="mapStoryPar">{selectedLocation.story}</p>
                <p className="durationInfoWindow">
                  <img src={durationIcon} alt="Duration" />
                  &nbsp;
                  {formatDate(selectedLocation.startDate)} - {formatDate(selectedLocation.endDate)}
                  &nbsp; (
                  {calculateDaysDifference(selectedLocation.startDate, selectedLocation.endDate)} days)
                </p>
                {selectedLocation.cost !== 0 && <p className="budgetInfoWindow">
                  <img src={budgetIcon} alt="Budget" />
                  &nbsp; Cost: {selectedLocation.cost} {selectedLocation.currency}
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
      </Map>
    </APIProvider>
  );
};

export default UserMap;
