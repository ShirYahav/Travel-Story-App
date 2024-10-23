import React, { useEffect, useState } from 'react'
import UserStories from './userStories/UserStories'
import StoriesUserLiked from './storiesUserLiked/StoriesUserLiked'
import { useUser } from '../../Context/UserContext';
import StoryModel from '../../Models/StoryModel';
import axios from 'axios';
import UserMap from './userMap/UserMap';
import config from '../../Utils/Config';

const UserProfile: React.FC = () => {
  const { user } = useUser();
  const [stories, setStories] = useState<StoryModel[]>([]);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        if (user && user._id) {
          const response = await axios.get(config.getStoriesByUserUrl + user._id);
          setStories(response.data); 
        }
      } catch (error) {
        console.error('Error fetching stories:', error);
      }
    };

    if (user?._id) {
      fetchStories();
    }
  }, [user]);

  return (
    <>
      {stories && <UserMap stories={stories} />}
      <UserStories stories={stories} />
      <StoriesUserLiked />
    </>
  )
}

export default UserProfile