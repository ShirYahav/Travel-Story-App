import React, { useEffect, useState } from 'react';
import './StoryCard.css';
import StoryModel from '../../../Models/StoryModel';
import { useNavigate } from 'react-router-dom';
import defaultStoryImg from '../../../Assets/defaults/default-story-img.jpg';
import { fetchFirstPhoto } from '../../../Services/MediaService';

interface StoryCardProps {
  story: StoryModel;
}

const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  const [imageUrl, setImageUrl] = useState<any>(defaultStoryImg);
  const navigate = useNavigate();

  useEffect(() => {
    const loadImage = async () => {
      const firstPhoto = story?.locations?.[0]?.photos?.[0];
      if (firstPhoto) {
        const fileName = firstPhoto.toString().replace("photos/", "");
        const image = await fetchFirstPhoto(fileName, defaultStoryImg);
        setImageUrl(image);
      } else {
        setImageUrl(defaultStoryImg);
      }
    };

    loadImage();
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
