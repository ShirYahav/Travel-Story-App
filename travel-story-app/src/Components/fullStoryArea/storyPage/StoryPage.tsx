import React, { useState } from "react";
import MapComponent from "../mapComponent/Map";
import emptyHeart from "../../../assets/SVGs/brown-empty-heart.png";
import filledHeart from "../../../assets/SVGs/brown-filled-heart.png";
import "./StoryPage.css";
import CollapseStoryList from "../collapseComponent/CollapseStoryList";

const StoryPage: React.FC = () => {
  const [isLiked, setIsLiked] = useState(false);

  // Function to toggle the like button
  const toggleLike = () => {
    setIsLiked((prevLiked) => !prevLiked); // Toggle the like state
  };

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
        <CollapseStoryList />
      </div>
    </div>
  );
};

export default StoryPage;
