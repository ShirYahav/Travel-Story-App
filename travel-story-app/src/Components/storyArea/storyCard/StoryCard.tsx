import React from 'react';
import './StoryCard.css'

interface StoryCardProps {
    title: string;
    description: string;
    username: string;
    photo: string;
}

const StoryCard: React.FC<StoryCardProps> = ({title, description, username, photo }) => {
    return (
      <>
      <div className="storyCard">
        <div
          className="imageOverlayContainer"
          style={{ backgroundImage: `url(${photo})` }} // Dynamically set the image
        >
          <div className="imageOverlay"></div> {/* Milky overlay */}
          <div className="textContainer">
            <h3 className="storyTitle">{title}</h3>
            <p className="storyDescription">{description}</p>
            <p className="byUser">By: {username}</p>
          </div>
        </div>
      </div>
    </>
    );
}

export default StoryCard;