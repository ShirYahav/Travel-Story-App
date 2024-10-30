import React, { useEffect, useState } from 'react';
import whitePlus from '../../../Assets/SVGs/white-plus.png';
import StoriesCollection from '../storiesCollection/StoriesCollection';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import StoryModel from '../../../Models/StoryModel';
import toast from 'react-hot-toast';
import config from '../../../Utils/Config';

const AllStories: React.FC = () => {

  const [stories, setStories] = useState<StoryModel[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await axios.get(config.getAllStoriesUrl);
        setStories(response.data);
      } catch (error) {
        console.error(error)
      }
    };     
    fetchStories();
  }, []);

  const navAddStoryButton = () =>{
    navigate('/add-story')
  }

  return (
    <div className="storiesByCountry">
      <h1 className="countryHeadline">All Stories</h1>
      {stories.length === 0 ? (
        <div className="noStoriesMessage">
          <h5>Be the first one to share a story!</h5>
          <button className="addStory" onClick={navAddStoryButton}>
            <img src={whitePlus} alt="whitePlus" className="whitePlusIcon" /> Add Your Story
          </button>
        </div>
      ) : (
        <>
          <StoriesCollection stories={stories} />
        </>
      )}
    </div>
  );
};

export default AllStories;
