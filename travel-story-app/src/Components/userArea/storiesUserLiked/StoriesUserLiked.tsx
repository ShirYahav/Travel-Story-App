import React, { useEffect, useState } from 'react';
import StoryModel from '../../../Models/StoryModel';
import axios from 'axios';
import { useUser } from '../../../Context/UserContext';
import { useNavigate } from 'react-router-dom';
import StoriesCollection from '../../storyArea/storiesCollection/StoriesCollection';
import globusIcon from '../../../assets/SVGs/globus-white.png';

import './StoriesUserLiked.css';

const LikedStories: React.FC = () => {
  const { user } = useUser();
  const [likedStories, setLikedStories] = useState<StoryModel[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLikedStories = async () => {
      try {
        if (user && user._id) {
          const response = await axios.get(`http://localhost:3001/api/get-liked-stories/${user._id}`);
          setLikedStories(response.data);
        }
      } catch (error) {
        console.error('Error fetching liked stories:', error);
      }
    };

    if (user?._id) {
      fetchLikedStories();
    }
  }, [user]);

  const handleExploreStories = () => {
    //navigate('/explore'); 
  };

  return (
    <div>
      {likedStories.length > 0 ? (
        <>
        <h4 className='youreStoriesH4'>Stories You've Liked</h4>
        <StoriesCollection stories={likedStories} />
        </>
      ) : (
        <div>
          <h5 className='exploreStories'>Explore people's stories and get inspired!</h5>
          <button onClick={handleExploreStories} className='exploreStoriesButton'><img src={globusIcon} className='globusIcon'/>Explore</button>
        </div>
      )}
    </div>
  );
};

export default LikedStories;
