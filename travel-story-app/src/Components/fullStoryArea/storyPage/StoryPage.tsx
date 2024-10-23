import React, { useEffect, useState } from "react";
import MapComponent from "../mapComponent/Map";
import emptyHeart from "../../../Assets/SVGs/brown-empty-heart.png";
import filledHeart from "../../../Assets/SVGs/brown-filled-heart.png";
import CollapseStoryList from "../collapseComponent/CollapseStoryList";
import durationIcon from '../../../Assets/SVGs/flight-date.png';
import budgetIcon from '../../../Assets/SVGs/money-bag.png';
import { formatDate } from "../../../Services/DateService";
import { useParams } from "react-router-dom";
import axios from "axios";
import StoryModel from "../../../Models/StoryModel";
import { useNavigate } from 'react-router-dom';
import "./StoryPage.css";
import { getCityCoordinatesGoogle } from "../../../Services/CountriesCitiesService";
import { useUser } from '../../../Context/UserContext';
import brownTrash from '../../../Assets/SVGs/trash-bin-trash-brown.png';
import whiteTrash from '../../../Assets/SVGs/trash-bin-trash-white.png';
import toast from 'react-hot-toast';

const StoryPage: React.FC = () => {
  
  const { storyId } = useParams<{ storyId: string }>();
  const [story, setStory] = useState<StoryModel | undefined>(); 

  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);

  const [isHovered, setIsHovered] = useState(false);
  
  const navigate = useNavigate();

  const { user } = useUser();

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/story/${storyId}`);
        const fetchedStory = response.data;
        setStory(fetchedStory);
        setLikes(fetchedStory.likes);

        if (user && user?.likedStories) {
          const liked = user.likedStories.some((likedStoryId: string) => likedStoryId === storyId);
          setIsLiked(liked);
        }

        if (fetchedStory.locations.length > 0) {
          const coordinates = await getCityCoordinatesGoogle(fetchedStory.locations[0].city);
          if (coordinates) {
            setCenter({lat: Number(coordinates.lat), lng: Number(coordinates.lng),});
          }
        }
      } catch (error) {
        toast.error("failed fetching story");
      }
    };

    fetchStory();
  }, [storyId, user]);

  const toggleLike = async () => {
    if (!user) return;
    try {
      if (isLiked) {
        setLikes((prevLikes) => prevLikes - 1);
        setIsLiked(false);

        if (user.likedStories) {
          const updatedLikedStories = user.likedStories.filter((likedStoryId: string) => likedStoryId !== storyId);
          user.likedStories = updatedLikedStories; 
        }

        await axios.post(`http://localhost:3001/api/story/${storyId}/dislike`);
      } else {
        setLikes((prevLikes) => prevLikes + 1);
        setIsLiked(true);

        if (user.likedStories) {
          user.likedStories.push(storyId as string); 
        } else {
          user.likedStories = [storyId as string]; 
        }

        await axios.post(`http://localhost:3001/api/story/${storyId}/like`);
      }
    } catch (error) {
      toast.error("Error liking/disliking story");
    }
  };

  const handleUpdateStory = () => {
    navigate(`/update-story/${storyId}`);
  };

  const getTrashIcon = () => {
    return isHovered ? whiteTrash : brownTrash;
  };

  const deleteStory = async () => {

    const confirmation = window.confirm("Are you sure you want to delete this story?");

    if (confirmation) {
      try {
        await axios.delete(`http://localhost:3001/api/delete-story/${storyId}`);
        toast.success("story deleted successfully");
        navigate("/");
      } catch (error) {
        toast.error("Error deleting story");
      }
    }
  }

  return (
    <div className="storyPageDiv">
      {center && story && <MapComponent story={story} center={center} />}
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
          <div className="likesDiv">{likes} People liked this story</div>
          <button className="likeButton" onClick={toggleLike}>
            <img
              src={isLiked ? filledHeart : emptyHeart}
              alt="like"
              className="heartIcon"
            />
          </button>
        </div>
        <div className="updateDeleteStory">
          {story?.user?._id === user?._id && <button className="updateStoryButton" onClick={handleUpdateStory}>Update Story</button>}
          {story?.user?._id === user?._id && 
            <button className="deleteStoryButton" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={deleteStory}>
              <img className="deleteStoryIcon" src={getTrashIcon()}/>
            </button>}
        </div>
      </div>
    </div>
  );
};

export default StoryPage;
