import React from 'react';
import CollapseStory from './CollapseStory';
import './CollapseStoryList.css'
import LocationModel from '../../../Models-temp/LocationModel';

interface StoriesCollectionProps {
  locations: LocationModel[];
}

const CollapseStoryList: React.FC <StoriesCollectionProps>= ({locations}) => {
  return (
    <div className='collapseStories'>
      {locations.map((location, index) => (
        <CollapseStory key={index} location={location} />
      ))}
    </div>
  );
};

export default CollapseStoryList;
