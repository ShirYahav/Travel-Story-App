import React from 'react';
import CollapseStory from './CollapseStory';  // Import your component
import story from '../FakeStory.json';  // Assuming you have a JSON file for locations
import './CollapseStoryList.css'

const CollapseStoryList: React.FC = () => {
  return (
    <div className='collapseStories'>
      {story.locations.map((location, index) => (
        <CollapseStory key={index} location={location} />
      ))}
    </div>
  );
};

export default CollapseStoryList;
