import React from 'react';
import './StoriesByCountry.css';

import storiesData from '../../home/FakeDataStories.json'
import StoriesCollection from '../storiesCollection/StoriesCollection';

const StoriesByCountry: React.FC = () => {
    return (
        <>
        <div className='storiesByCountry'>
           <h1 className='countryHeadline'>Country</h1>
           <StoriesCollection stories={storiesData} />
        </div>
        </>
    );
}

export default StoriesByCountry