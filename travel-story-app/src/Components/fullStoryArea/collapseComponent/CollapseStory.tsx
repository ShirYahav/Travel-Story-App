import React, { useEffect, useState } from "react";
import { Collapse } from "react-collapse";
import "./CollapseStory.css";
import arrowDownWhite from "../../../Assets/SVGs/arrow-down-circle-white.png";
import arrowDownBrown from "../../../Assets/SVGs/arrow-down-circle-brown.png";
import arrowUpWhite from "../../../Assets/SVGs/arrow-up-circle-white.png";
import arrowUpBrown from "../../../Assets/SVGs/arrow-up-circle-brown.png";
import LocationModel from "../../../Models/LocationModel";
import {createTheme, ThemeProvider } from "@mui/material";
import Media from "../../reusableComponents/Media";

const theme = createTheme({
  palette: {
    primary: {
      main: "#B25E39",
    },
    secondary: {
      main: "#473D3A",
    },
    background: {
      default: "#f3f3f3",
    },
  },
});

interface CollapseStoryProps {
  location: LocationModel;
}

const CollapseStory: React.FC<CollapseStoryProps> = ({ location }) => {

  const [isOpened, setIsOpened] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);

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

  const openModal = (index: number) => {
    setSelectedMediaIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMediaIndex(null);
  };

  const nextMedia = () => {
    if (selectedMediaIndex !== null && location.photos.length || location.videos.length) {
      setSelectedMediaIndex((prevIndex) => (prevIndex + 1) % (location.photos.length + location.videos.length));
    }
  };

  const prevMedia = () => {
    if (selectedMediaIndex !== null && location.photos.length || location.videos.length) {
      setSelectedMediaIndex((prevIndex) =>
        prevIndex === 0 ? (location.photos.length + location.videos.length) - 1 : prevIndex - 1
      );
    }
  };

  return (
    <ThemeProvider theme={theme}>
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
          <div className="collapse-content">
            <p><strong>Country:&nbsp;</strong> {location.country}</p>
            <p><strong>Start Date:&nbsp;</strong> {new Date(location.startDate).toLocaleDateString()}</p>
            <p><strong>End Date:&nbsp;</strong> {new Date(location.endDate).toLocaleDateString()}</p>
            {location.cost !== 0 && <p><strong>Cost:&nbsp;</strong> {location.cost} {location.currency}</p>}
            <p>{location.story}</p>

            <div className="media-container">
              {location.photos.map((photo, index) => (
                <Media
                  key={`photo-${index}`}
                  filename={photo as string}
                  type="photo"
                  id="mapPhotoCollapse"
                  altText={location.city}
                  onClick={() => openModal(index)}
                />
              ))}
              {location.videos.map((video, index) => (
                <Media
                  key={`video-${index}`}
                  filename={video as string}
                  type="video"
                  controls={false}
                  muted
                  autoPlay
                  onClick={() => openModal(location.photos.length + index)}
                  onTouchStart={() => openModal(location.photos.length + index)}
                />
              ))}
            </div>
          </div>
        </Collapse>

        {isModalOpen && selectedMediaIndex !== null && (
          <div className="modal">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <button className="prev" onClick={prevMedia}>
              &#10094;
            </button>

            {selectedMediaIndex < location.photos.length ? (
              <Media
                filename={location.photos[selectedMediaIndex] as string}
                type="photo"
                id="modal-content"
                altText="Selected"
              />
            ) : (
              <Media
                filename={location.videos[selectedMediaIndex - location.photos.length] as string}
                type="video"
                className="modal-content-video"
                controls={false}
                muted={false}
                autoPlay
              />
            )}

            <button className="next" onClick={nextMedia}>
              &#10095;
            </button>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
};

export default CollapseStory;
