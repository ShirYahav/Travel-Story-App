import React, { useEffect, useState } from "react";
import MapComponent from "../mapComponent/Map";
import emptyHeart from "../../../assets/SVGs/brown-empty-heart.png";
import filledHeart from "../../../assets/SVGs/brown-filled-heart.png";
import CollapseStoryList from "../collapseComponent/CollapseStoryList";
import durationIcon from '../../../assets/SVGs/flight-date.png';
import budgetIcon from '../../../assets/SVGs/money-bag.png';
import "./StoryPage.css";

//import story from '../FakeStory.json';
import { convertStoryData, formatDate } from "../../../services/DateService";
import { useParams } from "react-router-dom";
import axios from "axios";
import StoryModel from "../../../models/StoryModel";

const StoryPage: React.FC = () => {
  
  const { storyId } = useParams<{ storyId: string }>();
  const [story, setStory] = useState<StoryModel | undefined>();  // Can be undefined initially
  const [isLiked, setIsLiked] = useState(false);

  // Fetch the story based on the storyId
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

  return (
    <div className="storyPageDiv">
      <MapComponent story={story}/>
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
      <div className="collapseStoryPageDiv">
        <h3>{story?.countries?.join(", ")}</h3>
        <p>{story?.description}</p>
        <p><img src={durationIcon} />&nbsp;{story?.startDate && formatDate(new Date(story.startDate))} - {story?.endDate && formatDate(new Date(story.endDate))}</p>
        <p><img src={budgetIcon} />&nbsp;{story?.budget} {story?.currency}</p>
          {story?.locations && <CollapseStoryList locations={story.locations} />}
      </div>
    </div>
  );
};

export default StoryPage;
