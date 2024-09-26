import React from 'react';
import './StoriesByCountry.css';
import whitePlus from '../../../assets/SVGs/white-plus.png'

import storiesData from '../../home/FakeDataStories.json'
import StoriesCollection from '../storiesCollection/StoriesCollection';

const StoriesByCountry: React.FC = () => {
    return (
        <>
        <div className='storiesByCountry'>
           <h1 className='countryHeadline'>Country</h1>
           <button className='addStory'> <img src={whitePlus} alt='whitePlus' className='whitePlusIcon'/> Add Your Story</button>
           <StoriesCollection stories={storiesData} />
        </div>
        </>
    );
}

export default StoriesByCountry