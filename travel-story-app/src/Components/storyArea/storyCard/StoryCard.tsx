import React, { useEffect, useState } from 'react';
import './StoryCard.css';
import StoryModel from '../../../Models/StoryModel';
import { useNavigate } from 'react-router-dom';
import defaultStoryImg from '../../../Assets/defaults/default-story-img.jpg';

interface StoryCardProps {
  story: StoryModel;
}

const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  const [imageUrl, setImageUrl] = useState<any>(defaultStoryImg);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFirstPhoto = () => {
      try {
        const firstPhoto = story?.locations?.[0]?.photos?.[0];

        if (!firstPhoto) {
          setImageUrl(defaultStoryImg); 
          return;
        }

        setImageUrl(firstPhoto);

      } catch (error) {
        console.error("Error fetching the image:", error);
        setImageUrl(defaultStoryImg);
      }
    };

    fetchFirstPhoto();
  }, []); 

  const handleStoryCardClick = () => {
    navigate(`story/${story._id}`);
  };

  return (
    <>
      <div className="storyCard" onClick={handleStoryCardClick}>
        <div className="imageContainer">
          <img src={imageUrl} alt="Story" className="storyImage" />
          <div className="imageOverlay"></div>
        </div>
        <div className="textContainer">
          <h3 className="storyTitle">{story.title}</h3>
          <p className="storyDescription">{story.description}</p>
          <p className="byUser">By: {story.user.firstName}</p>
          <p className="likeCard">{story.likes} Likes</p>
        </div>
      </div>
    </>
  );
}

export default StoryCard;
