import React, { useEffect, useState } from 'react';
import StoryModel from '../../../Models/StoryModel';
import axios from 'axios';
import { useUser } from '../../../Context/UserContext';
import StoriesCollection from '../../storyArea/storiesCollection/StoriesCollection';
import { useNavigate } from 'react-router-dom';
import './UserStories.css';

interface UserStoriesProps {
  stories: StoryModel[];
}

const UserStories: React.FC<UserStoriesProps> = ({stories}) => {

  const navigate = useNavigate();
  const handleAddStory = () => {
    navigate('/add-story'); 
  };

  return (
    <div>
      {stories.length > 0 ? (
        <>
          <h4 className='youreStoriesH4'>Your'e Stories</h4>
          <StoriesCollection stories={stories} />
        </>
      ) : (
        <div>
          <h5 className='shareYourFirstStory'>Share your first story!</h5>
          <button onClick={handleAddStory} className='addStory'> + Add Story</button>
        </div>
      )}
    </div>
  );
};

export default UserStories;
