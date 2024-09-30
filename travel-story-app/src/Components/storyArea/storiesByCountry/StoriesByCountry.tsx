import React from 'react';
import './StoriesByCountry.css';
import whitePlus from '../../../assets/SVGs/white-plus.png'
import StoriesCollection from '../storiesCollection/StoriesCollection';
import { convertStoryData } from '../../../services/DateService';

import storiesData from '../../home/FakeDataStories.json'

const StoriesByCountry: React.FC = () => {
    const stories = convertStoryData(storiesData);

    return (
        <>
        <div className='storiesByCountry'>
           <h1 className='countryHeadline'>Country</h1>
           <button className='addStory'> <img src={whitePlus} alt='whitePlus' className='whitePlusIcon'/> Add Your Story</button>
           <StoriesCollection stories={stories} />
        </div>
        </>
    );
}

export default StoriesByCountry