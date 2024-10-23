import React, { useEffect, useState } from 'react';
import './StoriesByCountry.css';
import whitePlus from '../../../assets/SVGs/white-plus.png';
import StoriesCollection from '../storiesCollection/StoriesCollection';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import StoryModel from '../../../Models-temp/StoryModel';
import toast from 'react-hot-toast';

const StoriesByCountry: React.FC = () => {
  const { country } = useParams<{ country: string }>();
  const [stories, setStories] = useState<StoryModel[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/stories-by-country/${country}`);
        setStories(response.data);
      } catch (error) {
        console.error(error)
      }
    };
    if (country) {
      fetchStories();
    }
  }, [country]);

  const navAddStoryButton = () =>{
    navigate('/add-story')
  }

  return (
    <div className="storiesByCountry">
      <h1 className="countryHeadline">{country}</h1>
      {stories.length === 0 ? (
        <div className="noStoriesMessage">
          <h5>Be the first one to share a story in {country}!</h5>
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

export default StoriesByCountry;
