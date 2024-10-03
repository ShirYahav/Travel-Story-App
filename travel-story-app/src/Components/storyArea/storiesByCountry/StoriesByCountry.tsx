import React, { useEffect, useState } from 'react';
import './StoriesByCountry.css';
import whitePlus from '../../../assets/SVGs/white-plus.png'
import StoriesCollection from '../storiesCollection/StoriesCollection';
import { convertStoryData } from '../../../services/DateService';
import { useParams } from "react-router-dom";

import storiesData from '../../home/FakeDataStories.json'
import axios from 'axios';
import StoryModel from '../../../models/StoryModel';

const StoriesByCountry: React.FC = () => {
    const { country } = useParams<{ country: string }>();
    const [stories, setStories] = useState<StoryModel[]>([]);
    //const stories = convertStoryData(storiesData);

    useEffect(() => {
        const fetchStories = async () => {
          try {
            const response = await axios.get(`http://localhost:3001/api/stories-by-country/${country}`);
            console.log(response.data); // Assuming you want to log the data
            setStories(response.data);
          } catch (error) {
            console.log(error);
          }
        };
        if (country) {
          fetchStories(); // Only fetch if the country exists
        }
    }, [country]); // Make sure `country` is in the dependency array
      

    return (
        <>
        <div className='storiesByCountry'>
           <h1 className='countryHeadline'>{country}</h1>
           <button className='addStory'> <img src={whitePlus} alt='whitePlus' className='whitePlusIcon'/> Add Your Story</button>
           <StoriesCollection stories={stories} />
        </div>
        </>
    );
}

export default StoriesByCountry