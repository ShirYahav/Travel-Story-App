import React from 'react';
import './StoryCard.css'
import StoryModel from '../../../models/StoryModel';

interface StoryCardProps {
  story: StoryModel;
}

const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
    return (
      <>
      <div className="storyCard">
        <div
          className="imageOverlayContainer"
          style={{ backgroundImage: `url(${story.locations[0].photos[0]})` }} // Dynamically set the image
        >
          <div className="imageOverlay"></div>
          <div className="textContainer">
            <h3 className="storyTitle">{story.title}</h3>
            <p className="storyDescription">{story.description}</p>
            <p className="byUser">By: {story.user.firstName}</p>
          </div>
        </div>
      </div>
    </>
    );
}

export default StoryCard;