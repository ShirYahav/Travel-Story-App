import React, { useState } from "react";
import { Collapse } from "react-collapse";
import "./CollapseStory.css";
import arrowDownWhite from "../../../assets/SVGs/arrow-down-circle-white.png";
import arrowDownBrown from "../../../assets/SVGs/arrow-down-circle-brown.png";
import arrowUpWhite from "../../../assets/SVGs/arrow-up-circle-white.png";
import arrowUpBrown from "../../../assets/SVGs/arrow-up-circle-brown.png";
import LocationModel from "../../../models/LocationModel";

interface CollapseStoryProps {
  location: LocationModel;
}

const CollapseStory: React.FC<CollapseStoryProps> = ({ location }) => {
  const [isOpened, setIsOpened] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  return (
    <div className="collapse-story">
      <button
        onClick={toggleCollapse}
        className="collapse-button"
        onMouseEnter={() => setIsHovered(true)} 
        onMouseLeave={() => setIsHovered(false)} 
      >
        {location.city}{" "}
        <img
          src={getArrowIcon()}
          alt={isOpened ? "Collapse" : "Expand"}
          className="arrow-icon"
        />
      </button>

      <Collapse isOpened={isOpened}>
        <div className="collapse-content">
          <p>
            <strong>Country:</strong> {location.country}
          </p>
          <p>
            <strong>Start Date:</strong>{" "}
            {new Date(location.startDate).toLocaleDateString()}
          </p>
          <p>
            <strong>End Date:</strong>{" "}
            {new Date(location.endDate).toLocaleDateString()}
          </p>
          <p>{location.story}</p>
          <p><strong> Cost: </strong>{location.cost}</p>
          <div className="location-photos">
            {location.photos.map((photo, index) => (
              <img
                key={index}
                // src={photo}
                alt={`${location.city} photo ${index}`}
                style={{ width: "100px", margin: "5px" }}
              />
            ))}
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default CollapseStory;
