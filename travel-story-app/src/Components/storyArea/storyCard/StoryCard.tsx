import React, { useEffect, useState } from 'react';
import './StoryCard.css'
import StoryModel from '../../../Models/StoryModel';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface StoryCardProps {
  story: StoryModel;
}

const StoryCard: React.FC<StoryCardProps> = ({ story }) => {

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFirstPhoto = async () => {
      try {
        const firstPhotoFileName = story?.locations?.[0]?.photos?.[0];
        if (firstPhotoFileName) {
          const response = await axios.get(`http://localhost:3001/api/story/photo/${firstPhotoFileName}`, { responseType: "blob" });
          const imageObjectUrl = URL.createObjectURL(response.data);
          setImageUrl(imageObjectUrl);
        }
      } catch (error) {
        console.error(error); 
      }
    };
    fetchFirstPhoto();
  }, []);

  const handleStoryCardClick = () => {
    navigate(`story/${story._id}`)
  }
  
    return (
      <>
      <div className="storyCard" onClick={handleStoryCardClick}>
      <div
        className="imageOverlayContainer"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
          <div className="imageOverlay"></div>
          <div className="textContainer">
            <h3 className="storyTitle">{story.title}</h3>
            <p className="storyDescription">{story.description}</p>
            <p className="byUser">By: {story.user.firstName}</p>
            <p className="likeCard">{story.likes} Likes</p>
          </div>
        </div>
      </div>
    </>
    );
}

export default StoryCard;