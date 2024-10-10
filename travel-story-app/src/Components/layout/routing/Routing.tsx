import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../../home/Home';
import StoriesByCountry from '../../storyArea/storiesByCountry/StoriesByCountry';
import StoryPage from '../../fullStoryArea/storyPage/StoryPage';
import AddStory from '../../storyArea/addStory/AddStory';
import UpdateStory from '../../storyArea/updateStory/UpdateStory';
import Login from '../../auth/login/Login';
import Register from '../../auth/register/Register';
import UserProfile from '../../userArea/UserProfile';
import RouteNotFound from '../routeNotFound/RouteNotFound';


const Routing: React.FC = () => {
    return (
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stories/:country" element={<StoriesByCountry />} />
          <Route path="/story/:storyId" element={<StoryPage />} />
          <Route path="/add-story" element={<AddStory />} />
          <Route path="/update-story/:storyId" element={<UpdateStory />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-profile" element={<UserProfile />} />
          <Route path="*" element={<RouteNotFound />} />
        </Routes>
      </>
    );
}

export default Routing;