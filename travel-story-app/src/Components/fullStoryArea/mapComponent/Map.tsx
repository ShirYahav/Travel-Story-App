import { FunctionComponent, useState} from 'react';
import { APIProvider, Map, AdvancedMarker , InfoWindow} from '@vis.gl/react-google-maps';
import { calculateDaysDifference } from '../../../services/DateService'; 
import { Directions } from './Directions';
import './Map.css';

import story from '../FakeStory.json';  

type Location = {
  city: string;
  country: string;
  lat: number;
  lng: number;
  startDate: string;
  endDate: string;
  story: string;
  photos: string[];
};

const MapComponent: FunctionComponent<Record<string, unknown>> = () => {
  
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [center, setCenter] = useState({ lat: 35.6762, lng: 139.6503 });

  return (
    <APIProvider
      apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "Your_API_Key_Here"}
    >
      <Map
        defaultZoom={5}
        defaultCenter={center}
        mapId={process.env.REACT_APP_GOOGLE_MAPS_ID}
        colorScheme="DARK"
        className="storyMap"
      >
        {story.locations.map((location: Location, index: number) => (
          <AdvancedMarker
            key={index}
            position={{ lat: location.lat, lng: location.lng }}
            onClick={() => setSelectedLocation(location)}
          >
            <div className='pinImageDiv'>
              <img className='pinImage' src={location.photos[0]} alt={location.city} />
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
                    src={photo}
                    alt={selectedLocation.city}
                    className="mapPhoto"
                  />
                ))}
              </div>
              <div className='mapInformation'>
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
              </div>
            </div>
          </InfoWindow>
        )}

        <Directions routesData={story.route}/>
      </Map>
    </APIProvider>
  );
};

export default MapComponent;
  