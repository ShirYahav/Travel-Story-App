import React, { useEffect, useState } from 'react';
import './StoriesByCountry.css';
import whitePlus from '../../../assets/SVGs/white-plus.png'
import StoriesCollection from '../storiesCollection/StoriesCollection';
import { useParams } from "react-router-dom";
import axios from 'axios';
import StoryModel from '../../../models/StoryModel';

const StoriesByCountry: React.FC = () => {
    const { country } = useParams<{ country: string }>();
    const [stories, setStories] = useState<StoryModel[]>([]);

    useEffect(() => {
        const fetchStories = async () => {
          try {
            const response = await axios.get(`http://localhost:3001/api/stories-by-country/${country}`);
            console.log(response.data); 
            setStories(response.data);
          } catch (error) {
            console.log(error);
          }
        };
        if (country) {
          fetchStories(); 
        }
    }, [country]); 
      

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