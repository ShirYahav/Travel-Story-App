import React, { useEffect, useRef, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import StoryModel from '../../../Models-temp/StoryModel';
import LocationModel from '../../../Models-temp/LocationModel';
import axios from 'axios';
import { getCityCoordinatesGoogle } from '../../../Services-temp/CountriesCitiesService';
import Slider from 'react-slick';
import durationIcon from '../../../assets/SVGs/flight-date.png';
import budgetIcon from '../../../assets/SVGs/money-bag.png';
import { calculateDaysDifference, formatDate } from '../../../Services-temp/DateService';
import pinSharpCircle from '../../../assets/SVGs/pin-sharp-circle.png'; 
import './UserMap.css';

interface LocationWithCoordinates extends Omit<LocationModel, 'photos' | 'videos'> {
  lat: number;
  lng: number;
  photos: string[];
  videos: string[];
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
        for (const location of story.locations) {
          const coordinates = await getCityCoordinatesGoogle(location.city);
          if (coordinates) {
            const photosResponse = await axios.get(`http://localhost:3001/api/story/photos/${location._id}`);
            const videosResponse = await axios.get(`http://localhost:3001/api/story/videos/${location._id}`);
            updatedLocations.push({
              ...location,
              lat: coordinates.lat,
              lng: coordinates.lng,
              photos: photosResponse.data.photos,
              videos: videosResponse.data.videos,
              startDate: new Date(location.startDate),
              endDate: new Date(location.endDate),
            });
          }
        }
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
        gestureHandling= "greedy"
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
              <img
                className={`pinImage ${location.photos && location.photos.length > 0 ? '' : 'defaultImage'}`}
                src={location.photos && location.photos.length > 0 ? location.photos[0] : pinSharpCircle}
                alt={location.city}
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
                    <video id={`video-${selectedLocation.city}-${index}`} autoPlay muted loop controls>
                      <source src={video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
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
                <p className="budgetInfoWindow">
                  <img src={budgetIcon} alt="Budget" />
                  &nbsp; Cost: {selectedLocation.cost} {selectedLocation.currency}
                </p>
              </div>
              <div className="mapPhotosDiv">
                {selectedLocation.photos.map((photo, index) => (
                  <img key={index} src={photo} alt={selectedLocation.city} className="mapPhoto" />
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
