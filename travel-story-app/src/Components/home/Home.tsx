import React from "react";
import Slideshow from "./Slideshow";
import StoriesList from "../storyArea/storyList/StoriesList";
import { convertStoryData } from "../../services/DateService";
import "./Home.css";

import storiesData from './FakeDataStories.json'; // Temporary

const Home: React.FC = () => {
  
  const stories = convertStoryData(storiesData);

  return (
    <>
      <div className="homeContainer">
        <Slideshow />
        <div>
          <h3 className="ourCommunity">Our Community</h3>
          <hr className="underlineOurCommunity"></hr>
          <p className="ourCommunityParagraph">
            Whether you’re exploring local gems or venturing across the globe,
            Travel Story makes it easy to document and share your travel
            experiences with a community of fellow explorers. Start sharing your
            adventures today, and inspire others to discover new destinations!
          </p>
        </div>
        <div className="HomeStories">
          <h3 className="peopleTell">People Tell</h3>
          <hr className="underlinePeopleTell"></hr>
          <div>
            <StoriesList stories={stories} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
