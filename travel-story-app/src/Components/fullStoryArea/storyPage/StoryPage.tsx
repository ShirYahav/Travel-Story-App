import React, { useEffect, useState } from "react";
import MapComponent from "../mapComponent/Map";
import emptyHeart from "../../../assets/SVGs/brown-empty-heart.png";
import filledHeart from "../../../assets/SVGs/brown-filled-heart.png";
import CollapseStoryList from "../collapseComponent/CollapseStoryList";
import durationIcon from '../../../assets/SVGs/flight-date.png';
import budgetIcon from '../../../assets/SVGs/money-bag.png';
import { formatDate } from "../../../services/DateService";
import { useParams } from "react-router-dom";
import axios from "axios";
import StoryModel from "../../../models/StoryModel";
import { useNavigate } from 'react-router-dom';
import "./StoryPage.css";

const StoryPage: React.FC = () => {
  
  const { storyId } = useParams<{ storyId: string }>();
  const [story, setStory] = useState<StoryModel | undefined>(); 
  const [isLiked, setIsLiked] = useState(false);

  const isOwner = true;
  const navigate = useNavigate();

  
  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/story/${storyId}`);
        const fetchedStory = response.data;
        setStory(fetchedStory);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStory();
  }, [storyId]);

  const toggleLike = () => {
    setIsLiked((prevLiked) => !prevLiked);
  };

  const handleUpdateStory = () => {
    navigate(`/update-story/${storyId}`);
  };

  return (
    <div className="storyPageDiv">
      <MapComponent story={story} />
      <div className="collapseStoryPageDiv">
        <h3>{story?.countries?.join(", ")}</h3>
        <p>{story?.description}</p>
        <p>
          <img src={durationIcon} />
          &nbsp;{story?.startDate &&
            formatDate(new Date(story.startDate))} -{" "}
          {story?.endDate && formatDate(new Date(story.endDate))}
        </p>
        <p>
          <img src={budgetIcon} />
          &nbsp;{story?.budget} {story?.currency}
        </p>
        {story?.locations && <CollapseStoryList locations={story.locations} />}
      </div>
      <div className="bottomStoryPage">
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
        {isOwner && <button className="updateStoryButton" onClick={handleUpdateStory}>Update Story</button>}
      </div>
    </div>
  );
};

export default StoryPage;
