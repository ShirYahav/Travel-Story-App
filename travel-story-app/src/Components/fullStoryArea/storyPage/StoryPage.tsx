import React, { useState } from "react";
import MapComponent from "../mapComponent/Map";
import emptyHeart from "../../../assets/SVGs/brown-empty-heart.png";
import filledHeart from "../../../assets/SVGs/brown-filled-heart.png";
import CollapseStoryList from "../collapseComponent/CollapseStoryList";
import "./StoryPage.css";

import story from '../FakeStory.json';
import { convertStoryData } from "../../../services/DateService";

const StoryPage: React.FC = () => {
  const [isLiked, setIsLiked] = useState(false);

  // Function to toggle the like button
  const toggleLike = () => {
    setIsLiked((prevLiked) => !prevLiked); // Toggle the like state
  };

  const storyData = convertStoryData([story]);

  return (
    <div>
      <MapComponent />
      <div className="likesSection">
        <div className="likesDiv">30 People liked this story</div>
        <button className="likeButton" onClick={toggleLike}>
          <img
            src={isLiked ? filledHeart : emptyHeart} 
            alt="like"
            className="heartIcon"
          />
        </button>
      </div>
      <div>
        <CollapseStoryList locations={storyData[0].locations}/>
      </div>
    </div>
  );
};

export default StoryPage;
