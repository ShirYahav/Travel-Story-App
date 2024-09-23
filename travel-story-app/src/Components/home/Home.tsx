import React, { useEffect, useState } from "react";
import Slideshow from "./Slideshow";
import "./Home.css";
import StoriesList from "../storyArea/storyList/StoriesList";

import storiesData from './FakeDataStories.json'; //temporary

const Home: React.FC = () => {
  
  return (
    <>
      <div className="homeContainer">
        <Slideshow />
        <div>
            <h3 className="ourCommunity">Our Community</h3>
            <hr className="underlineOurCommunity"></hr>
            <p className="ourCommunityParagraph"> Whether you’re exploring local gems or venturing across the globe, Travel Story makes it easy to document and share your travel experiences with a community of fellow explorers. Start sharing your adventures today, and inspire others to discover new destinations!</p>
        </div>
        <div className="HomeStories">
            <h3 className="peopleTell">People Tell</h3>
            <hr className="underlinePeopleTell"></hr>
            <div>
                <StoriesList stories={storiesData}/>
            </div>
        </div>
      </div>
    </>
  );
};

export default Home;
