import React, { useEffect, useState } from "react";
import { Collapse } from "react-collapse";
import "./CollapseStory.css";
import arrowDownWhite from "../../../Assets/SVGs/arrow-down-circle-white.png";
import arrowDownBrown from "../../../Assets/SVGs/arrow-down-circle-brown.png";
import arrowUpWhite from "../../../Assets/SVGs/arrow-up-circle-white.png";
import arrowUpBrown from "../../../Assets/SVGs/arrow-up-circle-brown.png";
import LocationModel from "../../../Models/LocationModel";
import axios from "axios";

interface LocationWithMedia extends Omit<LocationModel, "photos" | "videos"> {
  photos: string[];
  videos: string[];
}

interface CollapseStoryProps {
  location: LocationModel;
}

const CollapseStory: React.FC<CollapseStoryProps> = ({ location }) => {
  const [isOpened, setIsOpened] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [locationMedia, setLocationMedia] = useState<LocationWithMedia | null>(
    null
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);

  const media = locationMedia ? [...locationMedia.photos, ...locationMedia.videos] : [];

  const toggleCollapse = () => {
    setIsOpened(!isOpened);
  };

  const getArrowIcon = () => {
    if (isOpened) {
      return isHovered ? arrowUpWhite : arrowUpBrown;
    } else {
      return isHovered ? arrowDownWhite : arrowDownBrown;
    }
  };

  useEffect(() => {
    if (isOpened && !locationMedia) {
      const fetchLocationMedia = async () => {
        try {
          const photosResponse = await axios.get(
            `http://localhost:3001/api/story/photos/${location._id}`
          );
          const videosResponse = await axios.get(
            `http://localhost:3001/api/story/videos/${location._id}`
          );

          const updatedLocation: LocationWithMedia = {
            ...location,
            photos: photosResponse.data.photos,
            videos: videosResponse.data.videos,
          };

          setLocationMedia(updatedLocation);
        } catch (error) {
          console.error("Error fetching location media:", error);
        }
      };

      fetchLocationMedia();
    }
  }, [isOpened, location, locationMedia]);

  const openModal = (index: number) => {
    setSelectedMediaIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMediaIndex(null);
  };

  const nextMedia = () => {
    if (selectedMediaIndex !== null && media.length > 0) {
      setSelectedMediaIndex((prevIndex) => (prevIndex + 1) % media.length);
    }
  };

  const prevMedia = () => {
    if (selectedMediaIndex !== null && media.length > 0) {
      setSelectedMediaIndex((prevIndex) =>
        prevIndex === 0 ? media.length - 1 : prevIndex - 1
      );
    }
  };

  return (
    <div className="collapse-story">
      <button
        onClick={toggleCollapse}
        className="collapse-button"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {location.city}
        <img
          src={getArrowIcon()}
          alt={isOpened ? "Collapse" : "Expand"}
          className="arrow-icon"
        />
      </button>

      <Collapse isOpened={isOpened}>
        {locationMedia ? (
          <div className="collapse-content">
            <p>
              <strong>Country:&nbsp;</strong> {locationMedia.country}
            </p>
            <p>
              <strong>Start Date:&nbsp;</strong>{" "}
              {new Date(locationMedia.startDate).toLocaleDateString()}
            </p>
            <p>
              <strong>End Date:&nbsp;</strong>
              {new Date(locationMedia.endDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Cost:&nbsp;</strong>
              {locationMedia.cost} {locationMedia.currency}
            </p>
            <p>{locationMedia.story}</p>
            <div className="media-container">
              {locationMedia.photos.length > 0 && (
                locationMedia.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={locationMedia.city}
                    id="mapPhotoCollapse"
                    onClick={() => openModal(index)}
                  />
                ))
              )}

              {locationMedia.videos.length > 0 && (
                locationMedia.videos.map((video, index) => (
                  <video
                    key={index}
                    controls
                    onClick={() => openModal(locationMedia.photos.length + index)}
                    onTouchStart={() => openModal(locationMedia.photos.length + index)}
                  >
                    <source src={video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ))
              )}
            </div>
          </div>
        ) : (
          <p>Loading media...</p>
        )}
      </Collapse>
      {isModalOpen && selectedMediaIndex !== null && (
        <div className="modal">
          <span className="close" onClick={closeModal}>
            &times;
          </span>
          <button className="prev" onClick={prevMedia}>
            &#10094;
          </button>

          {selectedMediaIndex < locationMedia.photos.length ? (
            <img
              src={locationMedia.photos[selectedMediaIndex]}
              id="modal-content"
              alt="Selected"
            />
          ) : (
            <video controls autoPlay className="modal-content-video">
              <source
                src={
                  locationMedia.videos[
                    selectedMediaIndex - locationMedia.photos.length
                  ]
                }
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          )}

          <button className="next" onClick={nextMedia}>
            &#10095;
          </button>
        </div>
      )}
    </div>
  );
};

export default CollapseStory;
