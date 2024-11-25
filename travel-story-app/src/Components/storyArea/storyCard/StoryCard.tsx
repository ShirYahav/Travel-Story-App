import React from 'react';
import './StoryCard.css';
import StoryModel from '../../../Models/StoryModel';
import { useNavigate } from 'react-router-dom';
import defaultStoryImg from '../../../Assets/defaults/default-story-img.jpg';
import Media from '../../reusableComponents/Media';

interface StoryCardProps {
  story: StoryModel;
}


const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  
  const navigate = useNavigate();

  const handleStoryCardClick = () => {
    navigate(`story/${story._id}`);
  };

  return (
    <>
      <div className="storyCard" onClick={handleStoryCardClick}>
        <div className="imageContainer">
          <Media
              filename={story?.locations[0]?.photos[0] as string}
              type="photo"
              altText="Story location photo"
              defaultAsset={defaultStoryImg}
              className="storyImage"
          />
          <div className="imageOverlay"></div>
        </div>
        <div className="textContainer">
          <h3 className="storyTitle">{story.title}</h3>
          <hr/>
          <p className="storyDescription">{story.description}</p>
          <p className="byUser">By: {story.user.firstName}</p>
          <p className="likeCard">{story.likes} Likes</p>
        </div>
      </div>
    </>
  );
};

export default StoryCard;
