import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../../home/Home';
import StoriesByCountry from '../../storyArea/storiesByCountry/StoriesByCountry';
import StoryPage from '../../fullStoryArea/storyPage/StoryPage';
import AddLocations from '../../storyArea/addStory/addLocation/AddLocations';


const Routing: React.FC = () => {
    return (
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/country-stories" element={<StoriesByCountry />} />
          <Route path="/story" element={<StoryPage />} />
          <Route path="/add-story" element={<AddLocations />} />
        </Routes>
      </>
    );
}

export default Routing;